#!/bin/bash
# Release lock file after completing work

set -e

if [ $# -eq 0 ]; then
  echo "Usage: ./scripts/release-lock.sh <file-path> [<file-path> ...]"
  echo "Example: ./scripts/release-lock.sh src/game/moves.ts"
  exit 1
fi

for file in "$@"; do
  lock_name=$(echo "$file" | sed 's/\//-/g').lock
  lock_path=".agent-locks/$lock_name"

  if [ -f "$lock_path" ]; then
    rm "$lock_path"
    echo "✅ Released lock for $file"
  else
    echo "⚠️  No lock found for $file"
  fi
done
