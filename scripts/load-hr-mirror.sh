#!/usr/bin/env bash
set -euo pipefail

# Loads the operator-managed HR mirror tables into the local VCentralPay database from the two
# SSMS dumps. These tables are deliberately absent from every EF migration and from
# docker/bootstrap (tier0-graph-employee-profile REQ-8.7; Tier0EmployeeProfileMigrationTests
# asserts OBJECT_ID(N'dbo.VibEmp') IS NULL right after a migration replay), so a fresh local DB —
# `docker compose down -v`, a schema.sql apply, any `ef database update` — comes up without them
# and this script has to be run by hand afterwards. It is idempotent: each selected table is
# dropped and reloaded, then re-granted SELECT to pol_app.
#
# Usage:
#   ./scripts/load-hr-mirror.sh [--tables VibEmp,branch] [dump.sql ...]
#
# Defaults to all four tables from ~/Downloads/vcentralhqdb_script.sql (dbo.VibEmp,
# dbo.COACH_OfficeData) and ~/Downloads/masmotordb_script.sql (dbo.branch, dbo.sale).
# Only dbo.VibEmp (EmployeeProfileReader) and dbo.branch (the migration's conditional GRANT) have
# consumers in this repo; dbo.sale is ~284MB of the second dump and nothing reads it, so
# `--tables VibEmp,branch` is the fast path.
#
# The dumps hold real PII: they are converted inside $TMPDIR (never into the repo tree), and the
# verification below compares row counts only.

# --- transform (covered by scripts/load-hr-mirror.test.sh) ----------------------------------------

# Keeps only the object blocks (SSMS `/****** Object: ... ******/` sections — tables and their PK
# index blocks) whose [dbo].[Table] is selected. SSMS also scripts every table data section after
# the last CREATE TABLE with no Object marker in front of it, so a standalone statement has to be
# routed by the table it names, not by the block it happens to follow — and a value holding a
# newline (a Thai province name in dbo.COACH_OfficeData) makes an INSERT span lines, so a
# continuation line has to follow the statement it belongs to. Dropping the statement but keeping
# its continuation left a batch starting mid-string, which wedged sqlcmd instead of erroring. That
# data section is one batch too: the GO every 1000 statements (emitted only in front of the next
# statement, never inside one) keeps a single batch from reaching tens of MB, which matters because
# the 8GB Docker VM runs three SQL Server instances and pol-db was OOM-killed (exit 137) mid-load
# while testing this.
AWK_FILTER='
  BEGIN { keep = 1 }
  /^\/\*+ Object:/ { pending = 1; np = 0; buf[++np] = $0; data = 0; next }
  pending {
    buf[++np] = $0
    if (match($0, /\[dbo\]\.\[[^]]+\]/)) {
      t = tolower(substr($0, RSTART + 7, RLENGTH - 8))
      keep = index(tables, "," t ",") > 0
      if (keep) for (i = 1; i <= np; i++) print buf[i]
      pending = 0
    }
    next
  }
  /^(INSERT|ALTER TABLE|SET IDENTITY_INSERT) / && match($0, /\[dbo\]\.\[[^]]+\]/) {
    data = 1
    t = tolower(substr($0, RSTART + 7, RLENGTH - 8))
    stmt = index(tables, "," t ",") > 0
    if (stmt) {
      if (due) { print "GO"; due = 0 }
      print
      if (++emitted % 1000 == 0) due = 1
    }
    next
  }
  data { if (stmt || /^GO\r?$/) print; next }
  { if (keep) print }
'

# stdin: a UTF-8 dump. $1: comma-separated lowercase table names. $2: target database.
filter_sql() {
  sed -E "s/^USE \[[^]]+\]/USE [$2]/" | awk -v tables=",$1," "$AWK_FILTER"
}

# The dumps are UTF-16LE with a BOM: `-f UTF-16` consumes the BOM (`-f UTF-16LE` would leave it in
# front of the first USE, and sqlcmd would send it to the server).
filter_dump() { iconv -f UTF-16 -t UTF-8 "$1" | filter_sql "$2" "$3"; }

# Sourced by the test for the two functions above; everything below is the actual load.
if [ "${HR_MIRROR_LIB_ONLY:-0}" = "1" ]; then return 0; fi

# --- load -----------------------------------------------------------------------------------------

cd "$(dirname "$0")/.."

TABLES=vibemp,coach_officedata,branch,sale
DUMPS=()
while [ $# -gt 0 ]; do
  case "$1" in
    --tables) TABLES="$(printf '%s' "$2" | tr '[:upper:]' '[:lower:]')"; shift 2 ;;
    --tables=*) TABLES="$(printf '%s' "${1#--tables=}" | tr '[:upper:]' '[:lower:]')"; shift ;;
    -h|--help) sed -n '4,22p' "$0"; exit 0 ;;
    *) DUMPS+=("$1"); shift ;;
  esac
done
if [ ${#DUMPS[@]} -eq 0 ]; then
  DUMPS=("$HOME/Downloads/vcentralhqdb_script.sql" "$HOME/Downloads/masmotordb_script.sql")
fi

if [ -z "${MSSQL_SA_PASSWORD:-}" ] && [ -f .env ]; then
  set -a; . ./.env; set +a
fi
: "${MSSQL_SA_PASSWORD:?set MSSQL_SA_PASSWORD (or keep it in .env)}"
POL_DB="${POL_DB:-VCentralPay}"
CONTAINER="${POL_DB_CONTAINER:-pol-db}"
# No `docker exec -i`: every batch is fed from a file, and an attached stdin that never reaches EOF
# leaves the exec client hanging after sqlcmd has already exited (seen when run non-interactively).
SQLCMD=(docker exec "$CONTAINER" /opt/mssql-tools18/bin/sqlcmd
  -S localhost -U sa -P "$MSSQL_SA_PASSWORD" -C -b)

# Two loads at once drop and refill the same tables in parallel and collide on the primary key
# ("Violation of PRIMARY KEY constraint 'XPKsale'"), so refuse to start a second one.
LOCKDIR=/tmp/load-hr-mirror.lock
mkdir "$LOCKDIR" 2>/dev/null \
  || { echo "another load is running (remove $LOCKDIR if it is stale)" >&2; exit 1; }

WORK="$(mktemp -d "${TMPDIR:-/tmp}/hr-mirror.XXXXXX")"
# The container-side copies are 26MB and 150MB; an interrupted run used to leave them in the
# image's /tmp, so drop them on every exit path, not just the successful one.
trap 'rm -rf "$WORK"; rmdir "$LOCKDIR" 2>/dev/null; docker exec -u 0 "$CONTAINER" sh -c "rm -f /tmp/hr-mirror-*.sql" >/dev/null 2>&1 || true' EXIT

LOADED=()
: > "$WORK/expected.tsv"
for dump in "${DUMPS[@]}"; do
  [ -f "$dump" ] || { echo "dump not found: $dump" >&2; exit 1; }
  base="$(basename "$dump" .sql)"
  out="$WORK/$base.sql"
  filter_dump "$dump" "$TABLES" "$POL_DB" > "$out"

  # A dump that names its catalog somewhere the rewrite missed would silently load into [Coach] /
  # [motordb] instead of the app database.
  [ "$(grep -c '^USE \[' "$out")" = "1" ] && grep -q "^USE \[$POL_DB\]" "$out" \
    || { echo "$base: USE statement was not rewritten to [$POL_DB]" >&2; exit 1; }

  # Reload from scratch so a re-run is idempotent; dropping the table takes its ALTER TABLE
  # constraints with it. NOCOUNT so the reload does not print "(1 rows affected)" once per INSERT —
  # sqlcmd writes its errors to stdout too, so that output has to stay visible.
  drops="$WORK/$base.drop.sql"
  printf 'SET NOCOUNT ON;\nGO\n' > "$drops"
  found=()
  while read -r t; do
    [ -n "$t" ] || continue
    found+=("$t")
    printf "IF OBJECT_ID(N'dbo.%s', N'U') IS NOT NULL DROP TABLE dbo.[%s];\nGO\n" "$t" "$t" >> "$drops"
    printf '%s\t%s\n' "$t" "$(grep -c "^INSERT \[dbo\]\.\[$t\]" "$out")" >> "$WORK/expected.tsv"
  done < <(grep -oE 'CREATE TABLE \[dbo\]\.\[[^]]+\]' "$out" | sed -E 's/.*\[([^]]+)\]$/\1/')

  if [ ${#found[@]} -eq 0 ]; then
    echo "$base: no selected table in this dump — skipped"
    continue
  fi
  echo "$base: loading ${found[*]}"
  cat "$drops" "$out" > "$WORK/$base.load.sql"
  docker cp "$WORK/$base.load.sql" "$CONTAINER:/tmp/hr-mirror-$base.load.sql" >/dev/null
  # -I: QUOTED_IDENTIFIER ON. docker cp + `-i` rather than piping on stdin, which sqlcmd truncates
  # at 4096 characters per line (the INSERT lines here run to ~2000).
  "${SQLCMD[@]}" -d "$POL_DB" -I -i "/tmp/hr-mirror-$base.load.sql"
  # -u 0: `docker cp` lands the file owned by root and the mssql image runs as a non-root user,
  # which cannot unlink it from the sticky /tmp.
  docker exec -u 0 "$CONTAINER" rm -f "/tmp/hr-mirror-$base.load.sql"
  LOADED+=("${found[@]}")
done

[ ${#LOADED[@]} -gt 0 ] || { echo "nothing loaded" >&2; exit 1; }

# Same conditional SELECT-only grant the Tier0EmployeeProfile migration applies — DROP TABLE above
# discarded the old one. The migration only grants dbo.VibEmp and dbo.branch (the two tables with
# consumers); granting every loaded table is deliberate here, so local dev reads whatever the
# operator provisioned and never gets write access to any of it. Then count the rows actually in
# the database and fail on any table that does not match its INSERT count in the dump: a batch that
# dies mid-file leaves a partial table.
{
  for t in "${LOADED[@]}"; do
    printf "IF OBJECT_ID(N'dbo.%s', N'U') IS NOT NULL EXEC(N'GRANT SELECT ON dbo.[%s] TO pol_app');\n" "$t" "$t"
  done
  echo "GO"
  echo "SET NOCOUNT ON;"
  for t in "${LOADED[@]}"; do
    printf "SELECT N'%s' + CHAR(9) + CAST(COUNT_BIG(*) AS nvarchar(20)) FROM dbo.[%s];\n" "$t" "$t"
  done
} > "$WORK/verify.sql"
docker cp "$WORK/verify.sql" "$CONTAINER:/tmp/hr-mirror-verify.sql" >/dev/null
"${SQLCMD[@]}" -d "$POL_DB" -I -h-1 -W -i /tmp/hr-mirror-verify.sql \
  | grep -E '^[A-Za-z_]+	[0-9]+$' | sort > "$WORK/actual.tsv"
docker exec -u 0 "$CONTAINER" rm -f /tmp/hr-mirror-verify.sql

sort -o "$WORK/expected.tsv" "$WORK/expected.tsv"
if ! diff -u "$WORK/expected.tsv" "$WORK/actual.tsv"; then
  echo "row counts do not match the dumps (- expected / + in $POL_DB)" >&2
  exit 1
fi
sed 's/^/  /' "$WORK/actual.tsv"
echo "HR mirror loaded into $POL_DB and granted SELECT to pol_app."
