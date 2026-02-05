#!/bin/bash
# Declare your intent before starting work

set -e

if [ $# -lt 3 ]; then
  echo "Usage: ./scripts/declare-intent.sh <agent-id> <branch-name> <description>"
  echo "Example: ./scripts/declare-intent.sh agent-1 agent-1/feature/abilities 'Implementing character draw abilities'"
  exit 1
fi

AGENT=$1
BRANCH=$2
DESCRIPTION=$3

# Read current intents
if [ ! -f ".agent-intents.json" ]; then
  echo '{"version":"1.0","intents":[]}' > .agent-intents.json
fi

# Add new intent
timestamp=$(date -u +%Y-%m-%dT%H:%M:%SZ)
jq --arg agent "$AGENT" \
   --arg branch "$BRANCH" \
   --arg desc "$DESCRIPTION" \
   --arg ts "$timestamp" \
   '.intents += [{"agent":$agent,"branch":$branch,"description":$desc,"timestamp":$ts}]' \
   .agent-intents.json > .agent-intents.json.tmp

mv .agent-intents.json.tmp .agent-intents.json

echo "✅ Intent declared:"
echo "Agent: $AGENT"
echo "Branch: $BRANCH"
echo "Description: $DESCRIPTION"
echo ""
echo "Current intents:"
cat .agent-intents.json | jq '.intents'
