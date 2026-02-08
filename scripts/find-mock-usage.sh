#!/bin/bash
# Script to find remaining MshnCtrlService usage in the codebase
# Usage: ./scripts/find-mock-usage.sh

echo "🔍 Finding remaining MshnCtrlService usage..."
echo ""

echo "📊 Files still importing mock-service:"
grep -r "import.*MshnCtrlService.*from.*mock-service" frontend/src/features --include="*.tsx" --include="*.ts" | wc -l | xargs echo "  Total files:"

echo ""
echo "📋 Detailed list:"
grep -r "import.*MshnCtrlService.*from.*mock-service" frontend/src/features --include="*.tsx" --include="*.ts" -l | sed 's/frontend\/src\/features\//  - /'

echo ""
echo "🎯 Function call breakdown:"
echo ""

echo "Targeting functions:"
grep -r "MshnCtrlService\.getTarget" frontend/src/features --include="*.tsx" --include="*.ts" | wc -l | xargs echo "  getTarget calls:"
grep -r "MshnCtrlService\.updateTargetStatus" frontend/src/features --include="*.tsx" --include="*.ts" | wc -l | xargs echo "  updateTargetStatus calls:"

echo ""
echo "Operations functions:"
grep -r "MshnCtrlService\.getOperations" frontend/src/features --include="*.tsx" --include="*.ts" | wc -l | xargs echo "  getOperations calls:"
grep -r "MshnCtrlService\.getCampaign" frontend/src/features --include="*.tsx" --include="*.ts" | wc -l | xargs echo "  getCampaign calls:"

echo ""
echo "Planning functions:"
grep -r "MshnCtrlService\.getOPLAN" frontend/src/features --include="*.tsx" --include="*.ts" | wc -l | xargs echo "  getOPLAN calls:"
grep -r "MshnCtrlService\.getScenario" frontend/src/features --include="*.tsx" --include="*.ts" | wc -l | xargs echo "  getScenario calls:"

echo ""
echo "Intelligence functions:"
grep -r "MshnCtrlService\.getRFI" frontend/src/features --include="*.tsx" --include="*.ts" | wc -l | xargs echo "  getRFI calls:"
grep -r "MshnCtrlService\.getCCIR" frontend/src/features --include="*.tsx" --include="*.ts" | wc -l | xargs echo "  getCCIR calls:"

echo ""
echo "✅ Progress: 3 of 38 files migrated (8%)"
echo "See docs/MIGRATION_PROGRESS.md for detailed status"
