#!/usr/bin/env bash
set -euo pipefail

# Covers the dump transform in scripts/load-hr-mirror.sh — table selection, the USE rewrite and the
# batch split — without a database. Run: ./scripts/load-hr-mirror.test.sh
cd "$(dirname "$0")/.."
HR_MIRROR_LIB_ONLY=1 . ./scripts/load-hr-mirror.sh

WORK="$(mktemp -d "${TMPDIR:-/tmp}/hr-mirror-test.XXXXXX")"
trap 'rm -rf "$WORK"' EXIT
fail() { echo "FAIL: $1" >&2; exit 1; }

# A miniature of what SSMS emits: two tables, then both tables' data with no Object marker in front
# of it, then an index block.
{
  echo 'USE [Coach]'
  echo 'GO'
  echo '/****** Object:  Table [dbo].[COACH_OfficeData]    Script Date: 14/08/2569 11:45:49 ******/'
  echo 'SET ANSI_NULLS ON'
  echo 'GO'
  echo 'CREATE TABLE [dbo].[COACH_OfficeData]([OfficeID] [nvarchar](50) NOT NULL) ON [PRIMARY]'
  echo 'GO'
  echo '/****** Object:  Table [dbo].[VibEmp]    Script Date: 14/08/2569 11:45:49 ******/'
  echo 'CREATE TABLE [dbo].[VibEmp]([EmpCode] [nvarchar](50) NOT NULL) ON [PRIMARY]'
  echo 'GO'
  echo "INSERT [dbo].[COACH_OfficeData] ([OfficeID]) VALUES (N'1021')"
  # A value holding a newline: the statement spans two lines, and the second one carries no table
  # name. Keeping it after dropping its INSERT leaves a batch that starts mid-string.
  echo "INSERT [dbo].[COACH_OfficeData] ([OfficeID]) VALUES (N'1022"
  echo "', N'unselected continuation')"
  for i in $(seq 1 2500); do echo "INSERT [dbo].[VibEmp] ([EmpCode]) VALUES (N'$i')"; done
  echo '/****** Object:  Index [XPKVibEmp]    Script Date: 14/08/2569 11:45:49 ******/'
  echo 'ALTER TABLE [dbo].[VibEmp] ADD PRIMARY KEY CLUSTERED ([EmpCode])'
  echo 'GO'
} > "$WORK/dump.sql"

filter_sql vibemp VCentralPay < "$WORK/dump.sql" > "$WORK/out.sql"

grep -q '^USE \[VCentralPay\]$' "$WORK/out.sql" || fail "USE was not rewritten to the target database"
[ "$(grep -c '^USE \[' "$WORK/out.sql")" = "1" ] || fail "expected exactly one USE statement"
grep -q 'CREATE TABLE \[dbo\]\.\[VibEmp\]' "$WORK/out.sql" || fail "selected table lost its CREATE TABLE"
grep -q 'ALTER TABLE \[dbo\]\.\[VibEmp\]' "$WORK/out.sql" || fail "selected table lost its index block"
[ "$(grep -c 'VibEmp' "$WORK/out.sql")" -ge 2501 ] || fail "selected table lost rows"

# The bug this catches: the data section carries no Object marker, so INSERTs for an unselected
# table leak through on the previous block's decision and hit the table already in the database.
! grep -q 'COACH_OfficeData' "$WORK/out.sql" || fail "unselected table leaked into the output"

! grep -q 'unselected continuation' "$WORK/out.sql" \
  || fail "a continuation line of an unselected statement leaked into the output"

# 2500 INSERTs plus one ALTER TABLE emitted: GO after statement 1000 and 2000, on top of the three
# GOs the fixture keeps (the USE, the CREATE TABLE and the index block).
[ "$(grep -cx 'GO' "$WORK/out.sql")" = "5" ] || fail "expected a GO every 1000 statements"

# The GO must land in front of the next statement, never between an INSERT and its own
# continuation line.
awk '
  /^GO\r?$/ && odd { print "GO after unterminated line " NR; exit 1 }
  { n = gsub(/'"'"'/, "&"); odd = (n % 2 == 1) }
' "$WORK/out.sql" || fail "a GO was emitted inside a multi-line statement"

filter_sql branch VCentralPay < "$WORK/dump.sql" > "$WORK/none.sql"
! grep -q 'CREATE TABLE' "$WORK/none.sql" || fail "a dump with no selected table still emitted one"

echo "load-hr-mirror transform OK"
