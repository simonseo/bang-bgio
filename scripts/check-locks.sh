#!/bin/bash
# Check if files are locked before modification

set -e

if [ $# -eq 0 ]; then
  echo "Usage: ./scripts/check-locks.sh <file-path> [<file-path> ...]"
  echo "Example: ./scripts/check-locks.sh src/game/moves.ts src/game/phases.ts"
  exit 1
fi

LOCKED_FILES=()

for file in "$@"; do
  # Convert path to lock filename (replace / with -)
  lock_name=$(echo "$file" | sed 's/\//-/g').lock
  lock_path=".agent-locks/$lock_name"

  if [ -f "$lock_path" ]; then
    LOCKED_FILES+=("$file")
    echo "⚠️  LOCKED: $file"
    cat "$lock_path" | jq '.'
    echo ""
  fi
done

if [ ${#LOCKED_FILES[@]} -gt 0 ]; then
  echo "❌ ${#LOCKED_FILES[@]} file(s) are locked by other agents"
  echo "Wait for them to finish or coordinate with the owning agent"
  exit 1
else
  echo "✅ All files are available"
  exit 0
fi
