#!/usr/bin/env bash
# destructive-guard.sh — PreToolUse(Bash) guard ตาม Destructive Ops + Workflow rules
# block = exit 2 พร้อมเหตุผลระบุกฎที่ติด; ผ่าน = เงียบ exit 0
# trade-off ที่รู้ตัว: มอง command เป็น string แบนๆ ไม่ parse shell quoting —
# คำสั่ง destructive ที่อยู่ใน quoted string (เช่นเขียน docs/test) อาจโดน block เกินจริง
# (ทิศ fail-safe); ห้ามแก้ด้วย prefix-skip echo/grep เพราะเป็น bypass hole

# จับ argv ทั้งหมด ไม่ใช่แค่ $1 — invocation ที่ word-split (หลาย arg) จะยังเห็นครบ
# (review #23). adapter ส่ง arg เดียว -> $* == $1 จึงไม่กระทบ path เดิม.
C="${*:-$(cat)}"
[ -n "$C" ] || exit 0

# Normalized copy สำหรับ "หา boundary ชื่อคำสั่ง" เท่านั้น (ไม่ได้เอาไป exec):
# ลบ backslash / single-quote / double-quote ออกทั้งหมด เพื่อให้ทุกรูปสะกดของ command token
# ยุบมาเป็นรูปธรรมดา แล้ว POS anchor (ที่ยอมรับ whitespace นำหน้า) จับได้:
#   \rm        -> rm           (#1 leading-backslash)
#   "rm"/'rm'  -> rm           (#4 quoted command name)
#   sh -c '... rm -rf ...'     -> sh -c ... rm -rf ...   (#5 -c '...' wrapper, rm ตามหลัง space)
#   eval 'rm -rf ...'          -> eval rm -rf ...        (#5 eval wrapper)
# ทิศ fail-safe เดิมคงไว้: ถ้า quoted destructive string โดน block เกินจริง = ยอมรับได้.
N=$(printf '%s' "$C" | tr -d '\\'\''"')

# anchor ตำแหน่ง token คำสั่ง: ต้นบรรทัด / หลัง ; & | $( / หลัง whitespace
# (ครอบ indent, xargs/sudo/env-prefix, path prefix เช่น /bin/rm) + optional rtk proxy
POS='(^|[;&|][[:space:]]*|\$\([[:space:]]*|[[:space:]])(rtk[[:space:]]+(proxy[[:space:]]+)?)?([^[:space:]]*/)?'

block() {
  echo "Blocked: $1" >&2
  exit 2
}

# rm recursive+force ทุกรูปสะกด (-rf, -fr, -r -f, --recursive --force):
# ดึง span ของแต่ละ rm invocation (จบที่ separator ถัดไป) แล้วเช็ก r+f ภายใน span เดียวกัน
# — กัน flag จากคนละคำสั่ง (เช่น grep -r ... && rm -f ...) มา AND กันผิดๆ
# ใช้ $N (normalized) เพื่อให้ \rm / "rm" / sh -c 'rm -rf'/eval ถูกจับด้วย (#1/#4/#5)
RM_SPANS=$(echo "$N" | grep -oE "${POS}rm[[:space:]][^;&|]*")
if [ -n "$RM_SPANS" ]; then
  while IFS= read -r SPAN; do
    if echo "$SPAN" | grep -qE '[[:space:]](-[A-Za-z]*[rR][A-Za-z]*|--recursive)([[:space:]]|$)' &&
      echo "$SPAN" | grep -qE '[[:space:]](-[A-Za-z]*f[A-Za-z]*|--force)([[:space:]]|$)'; then
      block 'rm แบบ recursive+force — ยืนยันเป้าหมายกับ user ก่อน (Destructive Ops rules)'
    fi
  done <<<"$RM_SPANS"
fi

echo "$N" | grep -qE "${POS}git[[:space:]]+reset[[:space:]]+--hard" &&
  block 'git reset --hard — ยืนยันเป้าหมายก่อน (Destructive Ops rules)'

echo "$N" | grep -qE "${POS}git[[:space:]]+clean[[:space:]]([^;&|]*[[:space:]])?(-[A-Za-z]*f[A-Za-z]*|--force)([[:space:]]|$)" &&
  block 'git clean -f — ยืนยันเป้าหมายก่อน (Destructive Ops rules)'

echo "$N" | grep -qE "${POS}find[[:space:]][^;&|]*[[:space:]]-delete([[:space:]]|$)" &&
  block 'find -delete — ยืนยันเป้าหมายก่อน (Destructive Ops rules)'

# whole-tree working-copy discard (issue #30): `git restore .` / `-W .` / `--worktree .`
# และ `git checkout -- .` / `git checkout .` ทิ้ง uncommitted ทั้ง tree โดยไม่ผ่าน git
# history (Tier-1 backstop ไม่ถึง). block เฉพาะ pathspec '.' ทั้ง tree เท่านั้น —
# single-file (git restore file / git checkout -- file), branch switch (git checkout dev
# / -b), unstage-only (git restore --staged .) ผ่าน เพื่อกัน false-positive.
CO_SPANS=$(echo "$N" | grep -oE "${POS}git[[:space:]]+(restore|checkout)[[:space:]][^;&|]*")
if [ -n "$CO_SPANS" ]; then
  while IFS= read -r SPAN; do
    # pathspec '.' standing alone (after ' -- ' or a space, then space/end) = whole tree
    echo "$SPAN" | grep -qE '([[:space:]]--[[:space:]]|[[:space:]])\.([[:space:]]|$)' || continue
    # git restore --staged .  (unstage only, no worktree loss) -> allow
    if echo "$SPAN" | grep -qE '[[:space:]]restore([[:space:]]|$)' &&
      echo "$SPAN" | grep -qE '[[:space:]](--staged|-[A-Za-z]*S[A-Za-z]*)([[:space:]]|$)' &&
      ! echo "$SPAN" | grep -qE '[[:space:]](--worktree|-[A-Za-z]*W[A-Za-z]*)([[:space:]]|$)'; then
      continue
    fi
    block 'git restore/checkout ทั้ง working tree (.) — ทิ้ง uncommitted ทั้งหมด ไม่ผ่าน git history; stash/ยืนยันก่อน (Destructive Ops rules)'
  done <<<"$CO_SPANS"
fi

# --- SQL destructive (Destructive Ops rules: ห้าม DROP/DELETE/TRUNCATE บน prod) ---
# case-insensitive; anchor หัวคำที่ separator/whitespace/ต้นบรรทัด เพื่อไม่ชน substring
# ("backupdb" ไม่ match "dropdb", "select drop from menu" ไม่ match "DROP TABLE")
echo "$N" | grep -qiE "(^|[;&|]|[[:space:]])drop[[:space:]]+(table|database)([[:space:]]|$)" &&
  block 'SQL DROP TABLE/DATABASE — ยืนยันกับ user + ต้องมี backup (Destructive Ops rules)'

# SQL TRUNCATE: ต้องตามด้วย token ที่ไม่ใช่ dash-flag (TABLE / identifier / quote) —
# กัน coreutil 'truncate -s 0 logfile' / 'truncate --size=0' (log rotation ปกติ) ไม่ให้ false-block
echo "$N" | grep -qiE "(^|[;&|]|[[:space:]])truncate[[:space:]]+[^-[:space:]]" &&
  block 'SQL TRUNCATE — ยืนยันกับ user + ต้องมี backup (Destructive Ops rules)'

echo "$N" | grep -qiE "(^|[;&|]|[[:space:]])dropdb([[:space:]]|$)" &&
  block 'dropdb — ยืนยันกับ user + ต้องมี backup (Destructive Ops rules)'

# DELETE FROM ที่ไม่มี WHERE ใน command เดียวกัน (span จบที่ separator ถัดไป):
# มี WHERE = มีเงื่อนไข -> ผ่าน; ไม่มี WHERE = ลบทั้งตาราง -> block
DEL_SPAN=$(echo "$N" | grep -oiE "delete[[:space:]]+from[[:space:]][^;&|]*")
if [ -n "$DEL_SPAN" ] && ! echo "$DEL_SPAN" | grep -qiE "[[:space:]]where([[:space:]]|=|\(|$)"; then
  block 'SQL DELETE FROM ไม่มี WHERE — ลบทั้งตาราง ยืนยันกับ user ก่อน (Destructive Ops rules)'
fi

echo "$N" | grep -qE "${POS}git[[:space:]]+push[[:space:]][^;&|]*--force(-with-lease)?([[:space:]]|$)" &&
  block 'force push (Workflow rules: ห้าม force push)'

# short flag -f (รวมแบบ combined เช่น -uf) — จำกัด span ไม่ให้ข้าม command separator
echo "$N" | grep -qE "${POS}git[[:space:]]+push[[:space:]]+([^;&|]*[[:space:]])?-[A-Za-z]*f[A-Za-z]*([[:space:]]|$)" &&
  block 'force push -f (Workflow rules: ห้าม force push)'

# force via leading-'+' refspec (git push origin +feat / +main / +HEAD:main rewrite remote history)
echo "$N" | grep -qE "${POS}git[[:space:]]+push[[:space:]][^;&|]*[[:space:]]\+[^[:space:];&|]" &&
  block 'force push (+refspec rewrite remote history; Workflow rules: ห้าม force push)'

# --mirror = บังคับ overwrite ทุก ref ปลายทาง (force โดยธรรมชาติ) -> block ไม่มีเงื่อนไข
echo "$N" | grep -qE "${POS}git[[:space:]]+push[[:space:]][^;&|]*--mirror([[:space:]]|=|$)" &&
  block 'git push --mirror — overwrite ทุก ref ปลายทาง (Workflow rules: ห้าม force push)'

# --all + force = force-overwrite ทุก branch ref จาก branch ไหนก็ได้
if echo "$N" | grep -qE "${POS}git[[:space:]]+push[[:space:]][^;&|]*--all([[:space:]]|$)" &&
  echo "$N" | grep -qE "${POS}git[[:space:]]+push[[:space:]][^;&|]*(--force(-with-lease)?([[:space:]]|$)|[[:space:]]-[A-Za-z]*f[A-Za-z]*([[:space:]]|$))"; then
  block 'git push --all --force — force-overwrite ทุก branch (Workflow rules: ห้าม force push)'
fi

# branch protection: commit/push ขณะอยู่บน main/develop หรือ push ระบุ main/develop
if echo "$N" | grep -qE "${POS}git[[:space:]]+(commit|push)([[:space:]]|$)"; then
  BR=$(git branch --show-current 2>/dev/null)
  # เดิม: อยู่บน main/develop = block commit/push ทุกแบบ (ตัดสินจาก HEAD ไม่ใช่ target).
  # ยกเว้นเดียวที่เพิ่ม: delete push "ล้วน" ของ ref ที่ไม่ใช่ main/develop (post-merge
  # cleanup เช่น `git push origin --delete feature/x` ขณะยืนบน develop) — floor จริงอยู่ที่
  # .githooks/pre-push (#132) ที่บังคับว่า branch ต้องมี PR merged ก่อนลบ.
  #
  # ทำไมเป็น *positive shape allowlist* ไม่ใช่ blocklist: rework 1-3 ยกเว้นแบบ "เห็น
  # indicator (--delete/-d หรือ colon) หนึ่งตัวก็พอ" แล้วปะช่องทีละตัวที่หลุด — trailing
  # metachar, variable ref, colon ปน content push, และ --tags/--follow-tags ที่ inject ref
  # (tag) เข้า remote เอง (4 ช่องในผิวสัมผัสเดียวกัน). surface นี้ไม่มีขอบเขต จึงพลิกเป็น:
  # ยกเว้นเฉพาะ span ที่ match รูปแบบเต็มแบบ token-by-token เท่านั้น token แปลกหน้าตัวเดียว =
  # ไม่ยกเว้น = ตกไปกฎเดิม (AC-8). ตัดสินต่อ span ของแต่ละ push (pattern เดียวกับ RM_SPANS)
  # เพื่อกันเคส multi-segment.
  if [ "$BR" = "main" ] || [ "$BR" = "develop" ]; then
    echo "$N" | grep -qE "${POS}git[[:space:]]+commit([[:space:]]|$)" &&
      block "git commit บน branch $BR — ต้อง branch แยกแล้วผ่าน PR (Workflow rules)"
    # trailing redirect (`2>&1`, `>/dev/null`, `&>out.log`, ...) ที่ปิดท้ายทั้งคำสั่งจริง ๆ
    # ไม่ใช่ separator ของอีกคำสั่ง แต่ตัวมันมี `&` ปนอยู่ ซึ่งเป็นอักขระเดียวกับที่ exclusion
    # class ของ PUSH_SPANS (`[^;&|]*`) ใช้ตัด span — เจอ `&` ก่อนถึงท้าย ref ก็ตัด span
    # กลางคัน (`... feature/x 2>` ไม่มี `&1`) ทำให้ DELSHAPE (ซึ่ง anchor `$` ต้องเจอท้ายจริง)
    # ไม่ match แล้วตกไป block ทั้งที่เป็น delete-push ล้วนที่ควรยกเว้น (AC-8). ลอก trailing
    # redirect ออกจากปลายคำสั่งจริงก่อนตัด span (ไม่แตะ $N ตัวอื่นในไฟล์) — anchor `$` ท้าย
    # regex กันไม่ให้ไปแมตช์ redirect ที่อยู่กลางคำสั่งก่อน `&&`/`;` ตัวถัดไป (เช่น
    # `push ... 2>&1 && rm -rf /` ยังเห็น `&& rm -rf /` เป็นคำสั่งแยกตามเดิม).
    _RE_REDIR_TAIL='[[:space:]]+([0-9]{0,2}>&[0-9]+-?|&>>?[[:space:]]*[^;&|[:space:]]+|[0-9]{0,2}>>?[[:space:]]*[^;&|[:space:]]+)[[:space:]]*$'
    N_PUSH="$N"
    _redir_i=0
    while [ "$_redir_i" -lt 6 ] && [[ "$N_PUSH" =~ $_RE_REDIR_TAIL ]]; do
      N_PUSH="${N_PUSH%"${BASH_REMATCH[0]}"}"
      _redir_i=$((_redir_i + 1))
    done
    PUSH_SPANS=$(echo "$N_PUSH" | grep -oE "${POS}git[[:space:]]+push([[:space:]][^;&|]*)?")
    [ -n "$PUSH_SPANS" ] ||
      block "git commit/push บน branch $BR — ต้อง branch แยกแล้วผ่าน PR (Workflow rules)"
    # shape delete-push ที่ยกเว้นได้ (AC-8) — ต้อง match args หลัง `push` แบบเต็มทั้ง span:
    #   push <remote> (--delete|-d) <ref>...   (delete flag ล้วน, ref ตามหลัง)
    #   push (--delete|-d) <remote> <ref>...   (delete flag นำหน้า remote)
    #   push <remote> :<ref>...                (colon-refspec ล้วน, ทุกตัวขึ้นต้น ':')
    # <remote>=_RE_RMT ไม่ขึ้นต้น `-` และไม่มี `:` `/` `@` (ตัด URL ที่มี colon);
    # <ref>=_RE_REF ไม่ขึ้นต้น `-` -> flag ที่ inject ref (--tags/--follow-tags) หรือ flag
    # อื่นใด (--, -o, --repo=, --atomic, -dq, flag ที่ยังไม่แจกแจง) ไม่ผ่านเป็น remote/ref
    # จึงทำให้ทั้ง span ไม่ match = block. `$` ` ` * ? [ { ก็ไม่อยู่ใน class -> ref ไม่
    # determinable = ไม่ยกเว้น (fail-safe, กัน `--delete $B` ที่ $B=main). strip ถึง `push`
    # ตัวแรก (shortest-match) แล้ว quote กัน glob/word-split; anchor ^...$ กันช่อง ref ที่มี
    # คำว่า `push` (เช่น `--tags feature/push origin :old`) มา re-open การยกเว้น.
    #
    # ข้อจำกัดที่ประกาศไว้ (นอกขอบเขต task นี้ — shape allowlist ปิดไม่ถึง, เป็น task แยก):
    #   - gitconfig `push.followTags=true` ทำให้ `git push origin :old` push tag ตามไปเอง
    #     โดยไม่มี flag; guard อ่าน gitconfig ไม่ได้ (ตัดสินจาก command string เท่านั้น)
    #   - `git -c a=b push origin main` ข้าม branch protection (POS ต้องการ git ติด push)
    #   - backtick command substitution ข้าม guard ทั้งตัว รวมกฎ rm -rf
    #   - trailing metachar ที่ arm outer (`git push;`) ข้าม branch-protection arm
    _RE_RMT='[A-Za-z0-9_.][A-Za-z0-9_.-]*'
    _RE_REF='[[:alnum:]_./][[:alnum:]_./-]*'
    DELSHAPE="^[[:space:]]+(${_RE_RMT}[[:space:]]+(--delete|-d)([[:space:]]+${_RE_REF})+|(--delete|-d)[[:space:]]+${_RE_RMT}([[:space:]]+${_RE_REF})+|${_RE_RMT}([[:space:]]+:${_RE_REF})+)[[:space:]]*\$"
    while IFS= read -r SPAN; do
      # match shape = delete push ล้วน -> ข้ามเฉพาะ arm HEAD-branch นี้ (AC-9); กฎ
      # target-based (บรรทัดท้าย if) และ force/mirror/all (ด้านบน) ยังทำงานกับ span ที่ match
      printf '%s' "${SPAN#*push}" | grep -qE "$DELSHAPE" && continue
      block "git push บน branch $BR — ต้อง branch แยกแล้วผ่าน PR (ยกเว้น delete push ของ ref ที่ไม่ใช่ main/develop; Workflow rules)"
    done <<<"$PUSH_SPANS"
  fi
  # anchor ก่อน (main|develop) รับ whitespace / ':' / '+' / '/' :
  #   ':' หรือ whitespace -> 'origin main', 'HEAD:main'
  #   '+' -> '+main' force push
  #   '/' -> fully-qualified refspec 'HEAD:refs/heads/main' (critic: เดิม / นำหน้า main เลยรอด)
  # trailing ([^[:alnum:]_./-]|$) = negated ref-name class บังคับ word boundary:
  #   อักขระของชื่อ ref (a-z0-9 _ . / -) ต่อท้าย = คนละ ref -> 'maintenance'/'developer-x'/
  #   'develop-old'/'main.bak' ไม่ false-block. อักขระอื่น (';' '&' '|' ')' '>' '<' ฯลฯ) =
  #   สิ้นสุด token main/develop จริง -> block. (เดิม ([[:space:]]|$) จับเฉพาะ whitespace/EOL
  #   จึงหลุด delete push ที่ target main/develop แล้วตามด้วย shell metachar ประชิด.)
  echo "$N" | grep -qE "${POS}git[[:space:]]+push[[:space:]][^;&|]*([[:space:]]|:|\+|/)(main|develop)([^[:alnum:]_./-]|$)" &&
    block 'git push ตรงเข้า main/develop — ต้องผ่าน PR (Workflow rules)'
fi

# KNOWN, INTENTIONALLY-UNBLOCKED GAP (ยอมรับเพื่อกัน false-positive สูงเกินไป):
#   git branch -D <branch> / find ... -exec rm {} +
# ลบข้อมูลได้แต่ใช้งานปกติบ่อย + กู้คืนได้ (branch -D ผ่าน reflog) — hard-block จะ FP สูง.
# enforcement floor จริงอยู่ที่ Tier 1 (git hooks + CI). ถ้าจะเพิ่มในอนาคตต้อง anchor ให้แคบก่อน.
# (git restore/checkout '.' ทั้ง working tree ถูก block ด้านบนแล้ว — issue #30.)
exit 0
