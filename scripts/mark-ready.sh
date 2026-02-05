#!/bin/bash
# Mark branch as ready for merge

set -e

if [ $# -lt 3 ]; then
  echo "Usage: ./scripts/mark-ready.sh <agent-id> <branch-name> <summary>"
  echo "Example: ./scripts/mark-ready.sh agent-1 agent-1/feature/abilities 'Completed all character abilities'"
  exit 1
fi

AGENT=$1
BRANCH=$2
SUMMARY=$3

# Run tests
echo "🧪 Running tests..."
if npm test; then
  TESTS_PASS=true
  echo "✅ Tests passed"
else
  TESTS_PASS=false
  echo "❌ Tests failed - fix tests before marking ready"
  exit 1
fi

# Check for conflicts
echo "🔍 Checking for conflicts with main..."
git fetch origin main || true
if git merge-base --is-ancestor origin/main HEAD; then
  CONFLICTS=false
  echo "✅ No conflicts"
else
  git merge --no-commit --no-ff origin/main || true
  if git diff --name-only --diff-filter=U | grep -q .; then
    CONFLICTS=true
    echo "⚠️  Conflicts detected - resolve before marking ready"
    git merge --abort
    exit 1
  else
    CONFLICTS=false
    git merge --abort
    echo "✅ No conflicts"
  fi
fi

# Create marker file
marker_name=$(echo "$BRANCH" | sed 's/\//-/g').ready
marker_path=".merge-ready/$marker_name"

mkdir -p .merge-ready
cat > "$marker_path" <<EOF
{
  "branch": "$BRANCH",
  "agent": "$AGENT",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "summary": "$SUMMARY",
  "testsPass": $TESTS_PASS,
  "conflicts": $CONFLICTS
}
EOF

echo ""
echo "✅ Branch marked as ready for merge:"
cat "$marker_path" | jq '.'
echo ""
echo "Next steps:"
echo "1. Push branch: git push -u origin $BRANCH"
echo "2. Create PR: gh pr create --title \"$SUMMARY\" --body \"Completed by $AGENT\""
