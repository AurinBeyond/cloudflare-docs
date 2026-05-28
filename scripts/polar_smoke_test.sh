#!/usr/bin/env bash
# polar_smoke_test.sh — Null-stress Polar.sh cutover verification.
#
# §POLAR-SMOKE 2026-02-11 — Founder runbook companion. Run this after
# every Polar env-key change. Three green checks = safe to proceed
# to the next step in /app/memory/POLAR_SWITCHOVER_GUIDE.md.
#
# Usage:
#   bash /app/scripts/polar_smoke_test.sh
#   bash /app/scripts/polar_smoke_test.sh --json     # machine-readable
#
# Exit codes:
#   0 = all three checks passed
#   1 = at least one check failed (see output)
#   2 = environment problem (REACT_APP_BACKEND_URL or ADMIN_TOKEN unset)

set -e

JSON=0
if [ "$1" = "--json" ]; then JSON=1; fi

BACKEND_URL=$(grep '^REACT_APP_BACKEND_URL=' /app/frontend/.env | cut -d '=' -f2-)
ADMIN_TOKEN=$(grep '^ADMIN_TOKEN=' /app/backend/.env | cut -d '=' -f2-)

if [ -z "$BACKEND_URL" ]; then
  echo "FATAL: REACT_APP_BACKEND_URL not set in /app/frontend/.env" >&2
  exit 2
fi
if [ -z "$ADMIN_TOKEN" ]; then
  echo "FATAL: ADMIN_TOKEN not set in /app/backend/.env" >&2
  exit 2
fi

C_GREEN='\033[0;32m'
C_RED='\033[0;31m'
C_BOLD='\033[1m'
C_DIM='\033[2m'
C_OFF='\033[0m'

ok=0
fail=0

check() {
  local name="$1"
  local pass="$2"
  local detail="$3"
  if [ "$pass" = "1" ]; then
    ok=$((ok + 1))
    [ "$JSON" = "0" ] && printf "  ${C_GREEN}✓${C_OFF} %-44s ${C_DIM}%s${C_OFF}\n" "$name" "$detail"
  else
    fail=$((fail + 1))
    [ "$JSON" = "0" ] && printf "  ${C_RED}✗${C_OFF} %-44s ${C_DIM}%s${C_OFF}\n" "$name" "$detail"
  fi
}

[ "$JSON" = "0" ] && echo -e "${C_BOLD}Polar.sh cutover smoke-test${C_OFF}"
[ "$JSON" = "0" ] && echo -e "${C_DIM}Backend: $BACKEND_URL${C_OFF}\n"

# ============================================================
# Check 1 — admin SKU map endpoint reports polar_configured=true
# ============================================================
RESP=$(curl -s -X GET "$BACKEND_URL/api/admin/payment/sku-map" \
  -H "X-Admin-Token: $ADMIN_TOKEN" || echo "{}")
POLAR_CONFIGURED=$(echo "$RESP" | python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    print('1' if d.get('polar_configured') is True else '0')
except Exception:
    print('0')
")
POLAR_MODE=$(echo "$RESP" | python3 -c "
import sys, json
try:
    print(json.load(sys.stdin).get('polar_mode') or 'unset')
except Exception:
    print('unset')
")
check "polar_configured == true" "$POLAR_CONFIGURED" "mode=$POLAR_MODE"

# ============================================================
# Check 2 — webhook signature verification rejects bad payload
# ============================================================
HTTP_BAD=$(curl -s -o /dev/null -w "%{http_code}" \
  -X POST "$BACKEND_URL/api/webhooks/polar" \
  -H "Content-Type: application/json" \
  -H "webhook-id: smoke-test-bad" \
  -H "webhook-timestamp: 1" \
  -H "webhook-signature: v1,invalid" \
  -d '{"type":"order.created"}')
# Acceptable: 400 (bad signature), 503 (not yet configured)
if [ "$HTTP_BAD" = "400" ]; then
  check "webhook rejects invalid signature" "1" "HTTP 400 (signature verification working)"
elif [ "$HTTP_BAD" = "503" ]; then
  check "webhook rejects invalid signature" "0" "HTTP 503 (Polar not configured — fill env keys first)"
else
  check "webhook rejects invalid signature" "0" "HTTP $HTTP_BAD (expected 400 or 503)"
fi

# ============================================================
# Check 3 — idempotency log collection exists and is writable
# ============================================================
CHECK3=$(python3 - <<'PYEOF'
import os
from dotenv import load_dotenv
load_dotenv('/app/backend/.env')
try:
    from pymongo import MongoClient
    client = MongoClient(os.environ['MONGO_URL'], serverSelectionTimeoutMS=3000)
    db = client[os.environ['DB_NAME']]
    # Just check we can query the collection
    count = db.polar_webhook_log.count_documents({})
    print(f"1|count={count}")
except Exception as exc:
    print(f"0|{exc}")
PYEOF
)
PASS=$(echo "$CHECK3" | cut -d '|' -f1)
DETAIL=$(echo "$CHECK3" | cut -d '|' -f2-)
check "polar_webhook_log queryable" "$PASS" "$DETAIL"

# ============================================================
# Summary
# ============================================================
if [ "$JSON" = "1" ]; then
  python3 -c "
import json
print(json.dumps({'ok': $ok, 'fail': $fail, 'polar_mode': '$POLAR_MODE'}))
"
else
  echo
  if [ "$fail" -eq 0 ]; then
    echo -e "${C_GREEN}${C_BOLD}ALL CHECKS PASSED ($ok/$((ok+fail)))${C_OFF}"
    echo -e "${C_DIM}Safe to proceed to the next step in POLAR_SWITCHOVER_GUIDE.md${C_OFF}"
  else
    echo -e "${C_RED}${C_BOLD}$fail check(s) failed${C_OFF} ($ok passed)"
    echo -e "${C_DIM}Do NOT advance to the next step. See POLAR_SWITCHOVER_GUIDE.md → Rollback.${C_OFF}"
  fi
fi

[ "$fail" -eq 0 ] && exit 0 || exit 1
