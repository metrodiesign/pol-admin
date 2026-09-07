#!/usr/bin/env bash
# destructive-guard.test.sh — adversarial test สำหรับ destructive guard
# รัน: bash .claude/hooks/tests/destructive-guard.test.sh   (exit 0 = ผ่านครบ)
# logic อยู่ใน .ai/bin/check-destructive.sh; .claude/hooks/destructive-guard.sh เป็น thin
# adapter (jq stdin -> argv). ทุกเคสรัน 2 ทางพิสูจน์ parity: 1) Claude adapter (JSON->stdin)
# 2) ตรง engine (.ai/bin, argv). ตรวจ exit code (2 = block, 0 = allow). ไม่รัน git/rm จริง.
# เคส "commit/push ขณะอยู่บน main/develop" ขึ้นกับ branch ปัจจุบัน — ทดสอบผ่าน temp git repo
# ที่คุม branch ได้ (check_at + REPO_DEV/REPO_FEAT ด้านล่าง) ไม่พึ่ง branch จริงของ repo ที่รัน
# และไม่แก้ state ของ repo จริง (AC-7). กฎที่ตัดสินจาก command string ล้วนยังทดสอบตรง (check).
set -u

HOOK="$(cd "$(dirname "$0")/.." && pwd)/destructive-guard.sh"
ENGINE="$(cd "$(dirname "$0")/../../../.ai/bin" && pwd)/check-destructive.sh"
pass=0
fail=0
skip=0

# branch ปัจจุบัน: ใช้ตัดสินว่าเคส "allow ของ git push" ทดสอบได้หรือไม่ —
# บน main/develop guard บล็อก git push ทุกตัว *ยกเว้น delete push ล้วนของ ref ที่ไม่ใช่
# main/develop* (branch-protection). เคส check_allow_push ด้านล่างเป็น content push (ไม่ใช่
# delete push) จึงยังถูกบล็อกบน protected branch -> ทดสอบไม่ได้ที่นั่น (skip)
BR_NOW=$(git branch --show-current 2>/dev/null)

check() { # $1=expect(block|allow) $2=desc $3=command-string
  local want=2
  [ "$1" = allow ] && want=0

  printf '{"tool_input":{"command":%s}}' "$(printf '%s' "$3" | jq -Rs .)" | "$HOOK" >/dev/null 2>&1
  local rc_adapter=$?
  if [ "$rc_adapter" -eq "$want" ]; then pass=$((pass + 1)); else
    fail=$((fail + 1)); echo "FAIL [adapter][$1] $2 -> exit $rc_adapter (want $want) :: $3"
  fi

  "$ENGINE" "$3" >/dev/null 2>&1
  local rc_engine=$?
  if [ "$rc_engine" -eq "$want" ]; then pass=$((pass + 1)); else
    fail=$((fail + 1)); echo "FAIL [engine][$1] $2 -> exit $rc_engine (want $want) :: $3"
  fi
}

# check_allow_push: allow-case ของ git push (content push) ที่ env-dependent — ข้าม (skip)
# เมื่ออยู่บน main/develop เพราะเป็น content push (ไม่ใช่ delete push ล้วน) จึงยังถูก
# branch-protection บล็อก (exit 2) ตามดีไซน์. มิเช่นนั้นทดสอบเหมือน check allow ปกติ.
check_allow_push() { # $1=desc $2=command-string
  if [ "$BR_NOW" = "main" ] || [ "$BR_NOW" = "develop" ]; then
    skip=$((skip + 2)); echo "SKIP [allow] $1 (branch=$BR_NOW blocks all git push) :: $2"
    return
  fi
  check allow "$1" "$2"
}

# --- MUST BLOCK: destructive ---
check block "rm -rf"                 'rm -rf /tmp/x'
check block "rm -fr"                 'rm -fr /tmp/x'
check block "rm -r -f split"         'rm -r -f /tmp/x'
check block "indented rm -rf"        '   rm -rf /tmp/x'
check block "/bin/rm -rf path"       '/bin/rm -rf /tmp/x'
check block "rtk proxy rm -rf"       'rtk proxy rm -rf /tmp/x'
check block "git reset --hard"       'git reset --hard HEAD~1'
check block "git clean -fd"          'git clean -fd'
check block "find -delete"           'find . -name "*.tmp" -delete'
# issue #30: whole-tree working-copy discard ('.') — block; single-file/branch/unstage pass
check block "git restore whole tree"      'git restore .'
check block "git restore -W whole tree"   'git restore --worktree .'
check block "git restore -SW whole tree"  'git restore --staged --worktree .'
check block "git checkout -- whole tree"  'git checkout -- .'
check block "git checkout dot whole tree" 'git checkout .'
check block "push --force"           'git push --force origin feat'
check block "push --force-with-lease" 'git push --force-with-lease origin feat'
check block "push -f"                'git push -f origin feat'
# regression (review High): '+'-refspec force pushes were silently allowed
check block "push +refspec"          'git push origin +feat:feat'
check block "push +bare-ref"         'git push origin +experimental'
check block "push +develop"          'git push origin +develop'
check block "push +main"             'git push origin +main'
check block "push +HEAD:main"        'git push origin +HEAD:main'
# branch-target protection (command-string based)
check block "push to develop"        'git push origin develop'
check block "push HEAD:main"         'git push origin HEAD:main'
# regression (critic): fully-qualified refspec — '/' before main/develop slipped the anchor
check block "push refs/heads/main"   'git push origin HEAD:refs/heads/main'
check block "push refs/heads/develop" 'git push origin HEAD:refs/heads/develop'

# regression (review #1/#4/#5): rm recursive+force reachable via backslash / quotes / -c|eval wrapper.
# token อันตรายประกอบ runtime กัน live guard บล็อก command ของ test เอง
RM="r""m"
check block "backslash rm -rf"       "\\${RM} -rf /tmp/x"
check block "double-quoted rm -rf"   "\"${RM}\" -rf /tmp/x"
check block "single-quoted rm -rf"   "'${RM}' -rf /tmp/x"
check block "sh -c rm -rf wrapper"   "sh -c '${RM} -rf /tmp/x'"
check block "bash -c rm -rf wrapper" "bash -c \"${RM} -rf /tmp/x\""
check block "eval rm -rf wrapper"    "eval '${RM} -rf /tmp/x'"

# new (review #10/#16): SQL destructive coverage (CLAUDE.md Destructive Ops rules)
DROP="DR""OP"; TRUNC="TRUN""CATE"; DEL="DELE""TE"
check block "DROP TABLE"             "${DROP} TABLE users"
check block "DROP DATABASE"          "${DROP} DATABASE app"
check block "drop table lowercase"   "drop table users"
check block "TRUNCATE TABLE"         "${TRUNC} TABLE logs"
check block "truncate lowercase"     "truncate logs"
check block "dropdb"                 "dropdb mydb"
check block "DELETE FROM no WHERE"   "${DEL} FROM users"
check block "delete no where lc"     "delete from users"

# new (critic): force-overwrite ของทุก ref
check block "push --mirror"          'git push --mirror origin'
check block "push --all --force"     'git push --all --force origin'
check block "push --force --all"     'git push --force --all origin'
check block "push --all -f"          'git push --all -f origin'

# --- MUST ALLOW: safe ---
check allow "rm single file"         'rm /tmp/onefile'
# allow-push เป็น env-dependent (branch-protection บล็อก git push ทุกตัวบน main/develop) -> skip ที่นั่น
check_allow_push "push feature branch"    'git push origin feat'
check_allow_push "push HEAD:feat"         'git push origin HEAD:feat'
check_allow_push "push full refspec"      'git push origin refs/heads/feat:refs/heads/feat'
check allow "grep -r (not rm)"       'grep -r foo .'
check allow "ls and echo"           'ls && echo ok'
check allow "git status"             'git status'
# issue #30 baselines: narrow whole-tree block must NOT catch normal restore/checkout
check allow "git restore single file"      'git restore src/app.ts'
check allow "git restore --staged unstage" 'git restore --staged .'
check allow "git checkout branch"          'git checkout develop'
check allow "git checkout -- single file"  'git checkout -- src/app.ts'
check allow "git checkout -b new branch"   'git checkout -b feat/x'
# benign baselines for new rules — must NOT false-positive
check allow "DELETE FROM with WHERE" "${DEL} FROM t WHERE id=1"
check allow "delete with where lc"   "delete from t where id=1"
check allow "select drop from menu"  'select drop from menu'
# coreutil truncate (log rotation) — dash-flag after the word -> NOT SQL TRUNCATE, must pass
check allow "truncate -s coreutil"   'truncate -s 0 /tmp/app.log'
check allow "truncate --size coreutil" 'truncate --size=0 /tmp/app.log'
check_allow_push "push --all no force"    'git push --all origin'
check_allow_push "branch maintenance"     'git push origin maintenance'

# --- AC-7: branch-controlled cases (push-delete-guard) ---------------------------
# ตารางเคส branch-dependent ทดสอบผ่าน temp git repo ที่คุม branch ผ่าน symbolic-ref ของ
# unborn branch (ไม่ต้อง commit, ไม่ต้อง network/gh) แล้วรัน adapter+engine จากใน dir นั้น
# (cwd = repo -> engine เห็น `git branch --show-current` = branch ที่ตั้ง). ไม่แตะ repo จริง.
TMPROOT=$(mktemp -d)
trap 'rm -rf "$TMPROOT"' EXIT
mkrepo() { # $1=dir $2=branch
  git init -q "$TMPROOT/$1"
  git -C "$TMPROOT/$1" symbolic-ref HEAD "refs/heads/$2"
}
mkrepo dev develop
mkrepo feat feature/x
REPO_DEV="$TMPROOT/dev"
REPO_FEAT="$TMPROOT/feat"

# gate: unborn-branch show-current ต้องคืนชื่อ branch จริง มิฉะนั้น arm branch-protection
# ไม่ทำงานและเคส allow จะผ่านด้วยเหตุผลผิด -> ประกาศ FAIL ชัดเจนแทนการผ่านหลอก
_bd=$(git -C "$REPO_DEV" branch --show-current 2>/dev/null)
if [ "$_bd" != "develop" ]; then
  fail=$((fail + 1)); echo "FAIL [ac7-setup] temp repo show-current='$_bd' want 'develop' (harness invalid)"
fi

check_at() { # $1=repo-dir $2=expect(block|allow) $3=desc $4=command
  local want=2
  [ "$2" = allow ] && want=0
  printf '{"tool_input":{"command":%s}}' "$(printf '%s' "$4" | jq -Rs .)" | (cd "$1" && "$HOOK") >/dev/null 2>&1
  local rc_adapter=$?
  if [ "$rc_adapter" -eq "$want" ]; then pass=$((pass + 1)); else
    fail=$((fail + 1)); echo "FAIL [adapter@$(basename "$1")][$2] $3 -> exit $rc_adapter (want $want) :: $4"
  fi
  (cd "$1" && "$ENGINE" "$4") >/dev/null 2>&1
  local rc_engine=$?
  if [ "$rc_engine" -eq "$want" ]; then pass=$((pass + 1)); else
    fail=$((fail + 1)); echo "FAIL [engine@$(basename "$1")][$2] $3 -> exit $rc_engine (want $want) :: $4"
  fi
}

# rm token ประกอบ runtime (case 19) กัน live guard บล็อก command ของ test เอง (เหมือน RM ด้านบน)
RMX="r""m"

# HEAD = develop (protected) — ตาราง adversarial 22 เคสของ spec push-delete-guard
check_at "$REPO_DEV" allow "1 delete --delete feature/x"        'git push origin --delete feature/x'
check_at "$REPO_DEV" allow "2 delete -d docs/y"                 'git push -d origin docs/y'
check_at "$REPO_DEV" allow "3 delete colon feature/x"           'git push origin :feature/x'
check_at "$REPO_DEV" allow "4 delete colon refs/heads/feature"  'git push origin :refs/heads/feature/x'
check_at "$REPO_DEV" block "5 delete develop"                   'git push origin --delete develop'
check_at "$REPO_DEV" block "6 delete main"                      'git push origin --delete main'
check_at "$REPO_DEV" block "7 -d develop"                       'git push -d origin develop'
check_at "$REPO_DEV" block "8 colon develop"                    'git push origin :develop'
check_at "$REPO_DEV" block "9 colon refs/heads/main"            'git push origin :refs/heads/main'
check_at "$REPO_DEV" block "10 --force + delete feature"        'git push --force origin --delete feature/x'
check_at "$REPO_DEV" block "11 -f -d feature"                   'git push -f -d origin feature/x'
check_at "$REPO_DEV" block "12 +feature refspec"                'git push origin +feature/x'
check_at "$REPO_DEV" block "13 --mirror"                        'git push --mirror origin'
check_at "$REPO_DEV" block "14 --all --force"                   'git push --all --force origin'
check_at "$REPO_DEV" block "15 -u feature (non-delete)"         'git push -u origin feature/x'
check_at "$REPO_DEV" block "16 bare push"                       'git push'
check_at "$REPO_DEV" block "17 git commit"                      'git commit -m x'
check_at "$REPO_DEV" block "18 delete && push develop"          'git push origin --delete feature/x && git push origin develop'
check_at "$REPO_DEV" block "19 delete ; rm -rf"                 "git push origin --delete feature/x ; ${RMX} -rf /tmp/a"
check_at "$REPO_DEV" allow "20 delete maintenance (boundary)"   'git push origin --delete maintenance'
check_at "$REPO_DEV" allow "21 delete developer-x (boundary)"   'git push origin --delete developer-x'
check_at "$REPO_DEV" allow "22 delete tag v1.0.0"               'git push origin --delete v1.0.0'

# trailing shell metachar หลัง target main/develop (regression rework 1): เดิม boundary
# ([[:space:]]|$) จับเฉพาะ whitespace/EOL จึงหลุด delete push ที่ target protected แล้วตามด้วย
# metachar ประชิด. ครบทุกตัว ';' '&' '|' ')' '>' '<' x รูป --delete / -d / colon-refspec x main/develop
check_at "$REPO_DEV" block "23 --delete develop;"              'git push origin --delete develop; echo done'
check_at "$REPO_DEV" block "24 --delete main&"                 'git push origin --delete main&'
check_at "$REPO_DEV" block "25 --delete main|cat"             'git push origin --delete main|cat'
check_at "$REPO_DEV" block "26 --delete main) cmdsubst"       '$(git push origin --delete main)'
check_at "$REPO_DEV" block "27 --delete develop>redir"        'git push origin --delete develop>/dev/null'
check_at "$REPO_DEV" block "28 --delete main<redir"          'git push origin --delete main<y'
check_at "$REPO_DEV" block "29 -d develop;"                    'git push -d origin develop;pwd'
check_at "$REPO_DEV" block "30 -d main>redir"                 'git push -d origin main>/dev/null'
check_at "$REPO_DEV" block "31 colon develop;"                 'git push origin :develop;pwd'
check_at "$REPO_DEV" block "32 colon refs/heads/main;"         'git push origin :refs/heads/main;'
check_at "$REPO_DEV" block "33 colon develop|cat"             'git push origin :develop|cat'
# allow-control หลังชน: อักขระของชื่อ ref (- . ต่อท้าย) หรือ ref ที่ไม่ใช่ main/develop แม้มี metachar
check_at "$REPO_DEV" allow "34 --delete develop-old"           'git push origin --delete develop-old'
check_at "$REPO_DEV" allow "35 --delete main.bak"             'git push origin --delete main.bak'
check_at "$REPO_DEV" allow "36 --delete maintenance;"          'git push origin --delete maintenance; echo ok'
check_at "$REPO_DEV" allow "37 --delete developer-x&"          'git push origin --delete developer-x&'

# non-determinable ref (rework 2 regression): delete push ที่ ref เป็นตัวแปร/command subst/glob.
# rework 4: `$ \` * ? [ {` ไม่อยู่ใน char class ของ <remote>/<ref> ใน shape allowlist -> span
# ไม่ match shape = ตกไป block (fail-safe) มิฉะนั้น `--delete $B` ที่ $B=main = ช่องลบ remote main.
check_at "$REPO_DEV" block "38 --delete \$B (var)"             'git push origin --delete $B'
check_at "$REPO_DEV" block "39 --delete \"\$B\" (quoted var)"    'git push origin --delete "$B"'
check_at "$REPO_DEV" block "40 --delete \${B} (braced var)"    'git push origin --delete ${B}'
check_at "$REPO_DEV" block "41 :\$B (colon var)"               'git push origin :$B'
check_at "$REPO_DEV" block "42 -d origin \$B (var)"            'git push origin -d origin $B'
check_at "$REPO_DEV" block "43 --delete \$(cat f) (cmdsubst)"  'git push origin --delete $(cat f)'
check_at "$REPO_DEV" block "44 --delete feature/* (glob)"      'git push origin --delete feature/*'
check_at "$REPO_DEV" block "45 --delete feature/? (glob)"      'git push origin --delete feature/?'
check_at "$REPO_DEV" block "46 --delete feature/[ab] (glob)"   'git push origin --delete feature/[ab]'
check_at "$REPO_DEV" block "47 :refs/heads/\$B (colon var)"    'git push origin :refs/heads/$B'
check_at "$REPO_DEV" block "48 --delete \`echo main\` (btick)" 'git push origin --delete `echo main`'
# word-split bypass: literal ref ที่ถูกต้องตามด้วย extra$v — $v=" main" จะ split เป็น arg ลบ main
check_at "$REPO_DEV" block "49 --delete feat/x extra\$v"       'git push origin --delete feature/x extra$v'
check_at "$REPO_DEV" block "50 --delete (no ref)"             'git push origin --delete'
check_at "$REPO_DEV" block "51 --delete;pwd (no ref)"         'git push origin --delete;pwd'

# content push ปน delete (must-fix rework 3): shape 3 (colon) ต้องให้ refspec *ทุกตัว* ขึ้นต้น
# ':' -> มี refspec ที่ไม่ขึ้นต้น ':' (content push) ปนแม้ตัวเดียว = span ไม่ match = block เพราะ
# ครึ่ง content push เข้า remote จริงและ Tier1 pre-push ปล่อย fast-forward. block บน protected.
check_at "$REPO_DEV" block "52 content+delete feature/x :old"   'git push origin feature/x :old'
check_at "$REPO_DEV" block "53 content+delete HEAD:feature :old" 'git push origin HEAD:feature/x :old'
check_at "$REPO_DEV" block "54 delete+content :old feature/x"    'git push origin :old feature/x'
check_at "$REPO_DEV" block "55 content main:feature +delete"     'git push origin main:feature :old'

# rework 4: positive shape allowlist (AC-8/AC-9) — flag ที่ inject ref เอง (--tags/
# --follow-tags) หรือ token แปลกหน้าใด ๆ ปนใน span = ไม่ match shape = block. ปิด BLOCKING
# รอบ 4 (tag leak) ที่ blocklist รอบ 1-3 ปะไม่ทัน. ทุกเคส HEAD=develop (protected).
check_at "$REPO_DEV" block "56 --tags inject ref"              'git push --tags origin :old'
check_at "$REPO_DEV" block "57 --follow-tags + --delete"      'git push --follow-tags origin --delete old'
check_at "$REPO_DEV" block "58 -o push-option"                'git push -o ci.skip origin :old'
check_at "$REPO_DEV" block "59 --atomic flag"                 'git push --atomic origin :old'
check_at "$REPO_DEV" block "60 --repo= flag"                  'git push --repo=x origin :old'
check_at "$REPO_DEV" block "61 -- separator"                  'git push -- origin :old'
check_at "$REPO_DEV" block "62 URL remote (has @:/)"          'git push git@github.com:org/repo.git :old'
check_at "$REPO_DEV" block "63 remote with slash"             'git push origin/sub :old'
check_at "$REPO_DEV" allow "64 remote name has push"          'git push pushremote :old'
check_at "$REPO_DEV" block "65 --delete no ref"               'git push origin --delete'
check_at "$REPO_DEV" block "66 bare push origin (no ref)"     'git push origin'
# anchor discriminator (advisor M3): ref ที่มีคำว่า `push` ต้องไม่ re-open การยกเว้น —
# ถ้า regex ไม่ anchor ^ จะจับ `push origin :old` ที่ท้าย `feature/push` แล้วปล่อย --tags
check_at "$REPO_DEV" block "67 --tags feature/push re-open"   'git push --tags feature/push origin :old'
check_at "$REPO_DEV" allow "68 colon ref name has push"       'git push origin :feature/push-x'
check_at "$REPO_DEV" allow "69 delete flag before remote"     'git push --delete origin feature/x'
# flag inject ในตำแหน่ง ref ของ delete-shape: leading-dash ban ของ <ref> ต้องกัน (ถ้า class
# หลวมรับ '-' นำหน้า `--tags` จะผ่านเป็น ref แล้วยกเว้นทั้งที่ push tag จริง) -> block
check_at "$REPO_DEV" block "70 --tags in ref position"        'git push origin --delete feature/x --tags'

# HEAD = feature/x — ผลต้องเท่ากับพฤติกรรมก่อนแก้ (arm branch-protection ไม่ทำงานนอก protected):
# 1-14/18-22 เท่าเดิม, ต่างเฉพาะ 15/16/17 ที่กลับเป็น allow เพราะ push/commit จาก branch ปกติผ่านได้
check_at "$REPO_FEAT" allow "f1 delete feature/x"               'git push origin --delete feature/x'
check_at "$REPO_FEAT" allow "f3 delete colon feature/x"         'git push origin :feature/x'
check_at "$REPO_FEAT" block "f5 delete develop"                 'git push origin --delete develop'
check_at "$REPO_FEAT" block "f9 colon refs/heads/main"          'git push origin :refs/heads/main'
check_at "$REPO_FEAT" block "f10 --force + delete"              'git push --force origin --delete feature/x'
check_at "$REPO_FEAT" block "f13 --mirror"                      'git push --mirror origin'
check_at "$REPO_FEAT" allow "f15 -u feature (allowed off-prot)" 'git push -u origin feature/x'
check_at "$REPO_FEAT" allow "f16 bare push (allowed off-prot)"  'git push'
check_at "$REPO_FEAT" allow "f17 git commit (allowed off-prot)" 'git commit -m x'
check_at "$REPO_FEAT" block "f18 delete && push develop"        'git push origin --delete feature/x && git push origin develop'
check_at "$REPO_FEAT" allow "f20 delete maintenance"            'git push origin --delete maintenance'
# trailing metachar mirror บน feature: target protected ต้อง block ทั้งสองฝั่ง; boundary allow เท่าเดิม
check_at "$REPO_FEAT" block "f23 --delete develop;"            'git push origin --delete develop; echo done'
check_at "$REPO_FEAT" block "f28 --delete main<redir"         'git push origin --delete main<y'
check_at "$REPO_FEAT" block "f31 colon develop;"               'git push origin :develop;pwd'
check_at "$REPO_FEAT" allow "f35 --delete main.bak"           'git push origin --delete main.bak'
check_at "$REPO_FEAT" allow "f36 --delete maintenance;"        'git push origin --delete maintenance; echo ok'
# parity: non-determinable ref บน feature branch ยัง allow (arm ไม่ยิงนอก protected) = ไม่มี
# regression จาก rework 2; แต่ literal target protected ยัง block ทั้งสองฝั่ง (f38b)
check_at "$REPO_FEAT" allow "f38 --delete \$B (off-prot)"      'git push origin --delete $B'
check_at "$REPO_FEAT" allow "f42 -d origin \$B (off-prot)"     'git push origin -d origin $B'
check_at "$REPO_FEAT" allow "f44 --delete feature/* (off-prot)" 'git push origin --delete feature/*'
check_at "$REPO_FEAT" block "f38b --delete \$B target develop"  'git push origin --delete $B develop'
# content push ปน delete บน feature branch: arm ไม่ยิงนอก protected -> content push จาก branch
# ปกติผ่านได้ (parity, no regression) ยกเว้น target เป็น main/develop ที่ยัง block ผ่าน :161
check_at "$REPO_FEAT" allow "f52 content+delete feature/x :old"   'git push origin feature/x :old'
check_at "$REPO_FEAT" allow "f54 delete+content :old feature/x"   'git push origin :old feature/x'
check_at "$REPO_FEAT" block "f55 content main:feature +delete"    'git push origin main:feature :old'
# parity rework 4: บน feature branch arm HEAD ไม่ยิง -> --tags ไม่ถูก shape-check ที่ชั้นนี้
# (Tier1 pre-push เป็น floor ของ tag) จึง allow เท่าพฤติกรรมก่อน diff = ไม่มี regression
check_at "$REPO_FEAT" allow "f56 --tags (off-prot parity)"       'git push --tags origin :old'

echo "---"
echo "pass=$pass fail=$fail skip=$skip"
[ "$fail" -eq 0 ]
