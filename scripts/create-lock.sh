#!/bin/bash
# Create lock file for a file you're about to modify

set -e

if [ $# -lt 3 ]; then
  echo "Usage: ./scripts/create-lock.sh <agent-id> <branch-name> <file-path> [intent]"
  echo "Example: ./scripts/create-lock.sh agent-1 agent-1/feature/abilities src/game/moves.ts 'Adding character abilities'"
  exit 1
fi

AGENT=$1
BRANCH=$2
FILE=$3
INTENT=${4:-"Working on $FILE"}

# Convert path to lock filename
lock_name=$(echo "$FILE" | sed 's/\//-/g').lock
lock_path=".agent-locks/$lock_name"

# Check if already locked
if [ -f "$lock_path" ]; then
  echo "❌ File is already locked:"
  cat "$lock_path" | jq '.'
  exit 1
fi

# Create lock
mkdir -p .agent-locks
cat > "$lock_path" <<EOF
{
  "agent": "$AGENT",
  "branch": "$BRANCH",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "intent": "$INTENT"
}
EOF

echo "✅ Lock created for $FILE"
cat "$lock_path" | jq '.'
