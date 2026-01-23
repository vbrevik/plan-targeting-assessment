#!/bin/bash
# Integration Test Script for NATO COPD Targeting Cell Dashboard
# Tests API endpoints with authentication

set -e

BASE_URL="http://localhost:3000"
EMAIL="targeting_cell@test.mil"
PASSWORD="TargetingCell2026!"

echo "=========================================="
echo "NATO COPD Integration Tests"
echo "=========================================="
echo ""

# Step 1: Login and get token
echo "1. Authenticating..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"identifier\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

if echo "$LOGIN_RESPONSE" | grep -q "access_token"; then
  TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
  echo "✓ Authentication successful"
  echo "  Token: ${TOKEN:0:30}..."
else
  echo "✗ Authentication failed"
  echo "$LOGIN_RESPONSE"
  exit 1
fi

echo ""

# Step 2: Test Decision Gates endpoint
echo "2. Testing Decision Gates endpoint..."
DECISION_GATES=$(curl -s -X GET "$BASE_URL/api/targeting/decision-gates" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

if echo "$DECISION_GATES" | grep -q "roe"; then
  echo "✓ Decision Gates endpoint working"
  echo "$DECISION_GATES" | jq '.' 2>/dev/null || echo "$DECISION_GATES" | head -5
else
  echo "✗ Decision Gates endpoint failed"
  echo "$DECISION_GATES"
fi

echo ""

# Step 3: Test Mission Command endpoints
echo "3. Testing Mission Command endpoints..."

echo "  a) Mission Intent..."
INTENT=$(curl -s -X GET "$BASE_URL/api/targeting/mission/intent" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")
if echo "$INTENT" | grep -q "phase"; then
  echo "    ✓ Mission Intent working"
else
  echo "    ✗ Mission Intent failed: $INTENT"
fi

echo "  b) Targeting Guidance..."
GUIDANCE=$(curl -s -X GET "$BASE_URL/api/targeting/mission/guidance" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")
if echo "$GUIDANCE" | grep -q "roeLevel"; then
  echo "    ✓ Targeting Guidance working"
else
  echo "    ✗ Targeting Guidance failed: $GUIDANCE"
fi

echo "  c) Authority Matrix..."
AUTHORITY=$(curl -s -X GET "$BASE_URL/api/targeting/mission/authority-matrix" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")
if echo "$AUTHORITY" | grep -q "level"; then
  echo "    ✓ Authority Matrix working"
else
  echo "    ✗ Authority Matrix failed: $AUTHORITY"
fi

echo "  d) Operational Tempo..."
TEMPO=$(curl -s -X GET "$BASE_URL/api/targeting/mission/tempo" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")
if echo "$TEMPO" | grep -q "currentPhase"; then
  echo "    ✓ Operational Tempo working"
else
  echo "    ✗ Operational Tempo failed: $TEMPO"
fi

echo ""

# Step 4: Test Target endpoints
echo "4. Testing Target endpoints..."
TARGETS=$(curl -s -X GET "$BASE_URL/api/targeting/targets?limit=5" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")
if echo "$TARGETS" | grep -q "id\|\[\]"; then
  echo "✓ Targets endpoint working (may return empty array)"
else
  echo "✗ Targets endpoint failed: $TARGETS"
fi

echo ""

# Step 5: Test DTL endpoints
echo "5. Testing DTL endpoints..."
DTL=$(curl -s -X GET "$BASE_URL/api/targeting/dtl?limit=5" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")
if echo "$DTL" | grep -q "id\|\[\]"; then
  echo "✓ DTL endpoint working (may return empty array)"
else
  echo "✗ DTL endpoint failed: $DTL"
fi

echo ""

# Step 6: Test ISR endpoints
echo "6. Testing ISR endpoints..."
ISR=$(curl -s -X GET "$BASE_URL/api/targeting/isr/platforms" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")
if echo "$ISR" | grep -q "id\|\[\]"; then
  echo "✓ ISR Platforms endpoint working (may return empty array)"
else
  echo "✗ ISR Platforms endpoint failed: $ISR"
fi

echo ""

# Step 7: Test Risk endpoints
echo "7. Testing Risk endpoints..."
RISK=$(curl -s -X GET "$BASE_URL/api/targeting/risk/high" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")
if echo "$RISK" | grep -q "id\|\[\]"; then
  echo "✓ High Risk Targets endpoint working (may return empty array)"
else
  echo "✗ High Risk Targets endpoint failed: $RISK"
fi

echo ""

# Step 8: Test Alternative Analysis endpoints
echo "8. Testing Alternative Analysis endpoints..."
ASSUMPTIONS=$(curl -s -X GET "$BASE_URL/api/targeting/analysis/assumptions" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")
if echo "$ASSUMPTIONS" | grep -q "id\|\[\]"; then
  echo "✓ Assumptions endpoint working (may return empty array)"
else
  echo "✗ Assumptions endpoint failed: $ASSUMPTIONS"
fi

echo ""

# Step 9: Test Decision Log endpoints
echo "9. Testing Decision Log endpoints..."
DECISIONS=$(curl -s -X GET "$BASE_URL/api/targeting/decisions?limit=5" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")
if echo "$DECISIONS" | grep -q "id\|\[\]"; then
  echo "✓ Decisions endpoint working (may return empty array)"
else
  echo "✗ Decisions endpoint failed: $DECISIONS"
fi

echo ""

echo "=========================================="
echo "Integration Tests Complete"
echo "=========================================="
echo ""
echo "Frontend URL: http://localhost:5173/smartops/targeting-cell-dashboard"
echo "Backend URL: $BASE_URL"
echo ""
echo "To test frontend with Playwright GUI:"
echo "  cd frontend && npx playwright test targeting-nato-copd.spec.ts --ui"
