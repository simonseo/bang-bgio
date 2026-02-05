# Multi-Agent Git Coordination Plan

## Overview
This plan enables up to 4 agents to work simultaneously on different areas of the codebase with minimal communication overhead using git branches, GitHub features, and file-based markers.

## Core Principles

1. **Branch Isolation** - Each agent works on a dedicated branch
2. **Area Ownership** - Clear responsibility zones prevent conflicts
3. **Convention Over Communication** - Standardized patterns eliminate coordination overhead
4. **Automated Checks** - CI/CD prevents integration issues
5. **Async Coordination** - File markers and commit messages communicate intent

---

## Branch Strategy

### Main Branches
```
main                    # Production-ready code
├── agent-1/feature    # Agent 1's work area
├── agent-2/feature    # Agent 2's work area
├── agent-3/feature    # Agent 3's work area
└── agent-4/feature    # Agent 4's work area
```

### Branch Naming Convention
```
agent-{n}/{category}/{description}

Categories:
- feature     (new functionality)
- fix         (bug fixes)
- refactor    (code improvements)
- test        (test additions/fixes)
- docs        (documentation)
- ui          (UI/UX changes)

Examples:
- agent-1/feature/character-selection-ui
- agent-2/fix/equipment-validation
- agent-3/test/integration-tests
- agent-4/ui/game-board-polish
```

---

## Area Ownership System

### Responsibility Zones (Prevent File Conflicts)

**Agent 1: Game Logic & Backend**
- `src/game/moves.ts`
- `src/game/phases.ts`
- `src/game/setup.ts`
- `src/game/utils/`
- `src/data/`

**Agent 2: UI Components**
- `src/components/`
- `src/styles/`
- `public/assets/`
- UI-related files

**Agent 3: Testing & Quality**
- `src/test/unit/`
- `src/test/e2e/`
- `src/test/integration/`
- `.docs/testing/`

**Agent 4: Infrastructure & DevOps**
- `server.cjs`
- `vite.config.ts`
- `package.json`
- CI/CD configs
- Documentation

### Cross-Zone Work Protocol
When an agent needs to modify another zone's files:

1. **Check LOCK file** (see below)
2. **Create marker** in `.agent-locks/{agent-id}/{file-path}.lock`
3. **Commit with tag**: `[CROSS-ZONE] {reason}`
4. **Notify via commit message**: Link to issue/reasoning

---

## File-Based Coordination

### 1. Lock File System
```bash
.agent-locks/
├── agent-1/
│   ├── src-components-GameBoard.tsx.lock    # Agent 1 working on GameBoard
│   └── metadata.json
├── agent-2/
│   └── src-game-moves.ts.lock               # Agent 2 working on moves
└── metadata.json
```

**Lock File Format** (`.agent-locks/agent-1/metadata.json`):
```json
{
  "agentId": "agent-1",
  "branch": "agent-1/feature/character-selection",
  "locks": [
    {
      "file": "src/components/GameBoard.tsx",
      "reason": "Adding character selection UI integration",
      "timestamp": "2026-02-05T20:00:00Z",
      "estimatedCompletion": "2026-02-05T22:00:00Z",
      "commit": "abc123f"
    }
  ]
}
```

**How to Use**:
```bash
# Before modifying a file, check locks
ls -la .agent-locks/*/

# Create a lock
mkdir -p .agent-locks/agent-1
echo "src/components/GameBoard.tsx" > .agent-locks/agent-1/src-components-GameBoard.tsx.lock

# Remove lock when done (in commit)
git rm .agent-locks/agent-1/src-components-GameBoard.tsx.lock
```

### 2. Intent Declaration File
```
.agent-intents.json
```

Declares what each agent plans to work on:
```json
{
  "version": "1.0",
  "intents": {
    "agent-1": {
      "branch": "agent-1/feature/character-selection-ui",
      "goal": "Implement character selection phase UI",
      "files": [
        "src/components/CharacterSelection.tsx",
        "src/components/GameBoard.tsx",
        "src/game/phases.ts"
      ],
      "dependencies": [],
      "blockers": ["agent-2 must finish GameBoard refactor"],
      "estimatedCompletion": "2026-02-05T22:00:00Z"
    },
    "agent-2": {
      "branch": "agent-2/refactor/game-board",
      "goal": "Refactor GameBoard component structure",
      "files": [
        "src/components/GameBoard.tsx",
        "src/components/PlayerArea.tsx"
      ],
      "dependencies": [],
      "blockers": [],
      "estimatedCompletion": "2026-02-05T21:00:00Z"
    }
  }
}
```

**Update Protocol**:
- Commit intent file at session start
- Update when plans change
- Remove entry when work complete

### 3. Merge Readiness File
```
.merge-ready/{agent-id}.json
```

Signals when a branch is ready to merge:
```json
{
  "agentId": "agent-1",
  "branch": "agent-1/feature/character-selection-ui",
  "readyForReview": true,
  "testsPass": true,
  "conflicts": false,
  "prNumber": 42,
  "reviewers": ["agent-3"],
  "timestamp": "2026-02-05T22:00:00Z"
}
```

---

## Workflow

### Session Start (Per Agent)

```bash
# 1. Pull latest from main
git checkout main
git pull origin main

# 2. Create/update feature branch
git checkout -b agent-1/feature/my-feature

# 3. Declare intent
# Edit .agent-intents.json with your plan

# 4. Check for conflicts
cat .agent-intents.json | jq '.intents | to_entries[] | select(.value.files | contains(["YOUR_FILE"]))'

# 5. Create locks for cross-zone files (if any)
mkdir -p .agent-locks/agent-1
echo "src/components/GameBoard.tsx" > .agent-locks/agent-1/src-components-GameBoard.tsx.lock

# 6. Commit intent + locks
git add .agent-intents.json .agent-locks/
git commit -m "intent: declare work on character selection UI"
git push origin agent-1/feature/my-feature
```

### During Work

```bash
# Commit frequently with descriptive messages
git add src/components/CharacterSelection.tsx
git commit -m "feat: add character selection component

- Created CharacterSelection component with 2-choice UI
- Integrated with game phases
- Added unit tests

Related: #15"

git push origin agent-1/feature/my-feature

# Check for new intents from other agents
git fetch --all
git log --all --oneline --grep="^intent:"
```

### Session End

```bash
# 1. Run tests
npm test

# 2. Release locks
git rm .agent-locks/agent-1/*.lock
git add .agent-locks/

# 3. Update intent (mark complete or in-progress)
# Edit .agent-intents.json

# 4. Create merge-ready marker (if complete)
cat > .merge-ready/agent-1.json << EOF
{
  "agentId": "agent-1",
  "branch": "agent-1/feature/character-selection-ui",
  "readyForReview": true,
  "testsPass": true,
  "conflicts": false,
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF

git add .merge-ready/agent-1.json
git commit -m "ready: character selection UI complete and ready for review"
git push origin agent-1/feature/my-feature

# 5. Create Pull Request (via GitHub CLI or web)
gh pr create \
  --title "feat: Character Selection UI" \
  --body "Implements character selection phase with 2-choice UI" \
  --base main \
  --head agent-1/feature/character-selection-ui \
  --label "agent-1,feature,ready-for-review"
```

---

## Commit Message Convention

### Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code refactoring
- `test`: Test additions/changes
- `docs`: Documentation
- `chore`: Maintenance
- `intent`: Work declaration
- `ready`: Merge readiness signal
- `merge`: Merge commit

### Special Tags
- `[CROSS-ZONE]` - Modifying another agent's area
- `[BREAKING]` - Breaking API changes
- `[WIP]` - Work in progress, don't merge
- `[BLOCKED]` - Waiting on dependency

### Examples
```bash
# Regular commit
git commit -m "feat(ui): add character selection modal

Implemented modal with 2-choice selection
- Uses CharacterCard component
- Integrates with selectCharacter move
- Fully responsive design

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

# Cross-zone commit
git commit -m "fix(game): update moves.ts for UI integration [CROSS-ZONE]

Modified playBang signature to support UI requirements
Reason: CharacterSelection needs access to events parameter

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

# Blocked commit
git commit -m "feat(ui): character selection component [BLOCKED]

Waiting on agent-2's GameBoard refactor to complete
See issue #23

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Pull Request Workflow

### PR Creation Checklist
```markdown
## Agent Information
- **Agent ID**: agent-1
- **Branch**: agent-1/feature/character-selection-ui
- **Area**: UI Components

## Changes
- [ ] Character selection UI implemented
- [ ] Unit tests added (15 tests)
- [ ] Integration with game phases
- [ ] Documentation updated

## Testing
- [x] All tests pass (226/237)
- [x] No new test failures
- [x] Manual testing complete

## Cross-Zone Changes
- Modified: `src/game/phases.ts` (reason: added character selection phase)
- Notified: agent-1 (game logic owner)

## Review
- Suggested reviewers: @agent-3 (testing expert)
- Estimated review time: 30 minutes
```

### PR Labels
```
Labels:
- agent-1, agent-2, agent-3, agent-4    # Agent ID
- feature, fix, refactor, test, docs    # Type
- ui, game-logic, testing, infrastructure # Area
- ready-for-review, needs-work, blocked  # Status
- cross-zone                              # Cross-area changes
- breaking-change                         # API breaking
```

### PR Review Protocol

**Automatic Reviewers**:
- Cross-zone PRs: Auto-assign area owner as reviewer
- Breaking changes: Auto-assign all agents as reviewers
- Test changes: Auto-assign agent-3 (testing expert)

**Review SLA**:
- Simple PRs: 1 hour
- Complex PRs: 4 hours
- Breaking changes: 8 hours

**Auto-Merge Conditions**:
- All tests pass (CI)
- No conflicts with main
- Required reviewers approved
- No `[WIP]` or `[BLOCKED]` tags

---

## Conflict Resolution

### Prevention
1. **Area ownership** - Stay in your zone
2. **Lock files** - Check before modifying
3. **Intents** - Declare plans early
4. **Frequent merges** - Sync with main daily

### Detection
```bash
# Check for conflicts before starting work
git fetch origin main
git merge-base --is-ancestor origin/main HEAD || echo "Needs rebase"

# Preview potential conflicts
git merge --no-commit --no-ff origin/main
git merge --abort
```

### Resolution Protocol

**If conflict detected**:

1. **Identify conflict owner**
   ```bash
   git log --oneline origin/main..HEAD --grep="CROSS-ZONE"
   ```

2. **Check who locked the file**
   ```bash
   find .agent-locks -name "*conflicting-file*.lock"
   ```

3. **Resolution priority**:
   - Area owner has priority
   - Earlier lock timestamp wins
   - Breaking changes block non-breaking
   - Tests block implementation

4. **Communicate via commit**:
   ```bash
   git commit -m "resolve: conflict in GameBoard.tsx [RESOLVED WITH agent-2]

   Agent-2 had lock priority (timestamp: 2026-02-05T20:00:00Z)
   Rebased my changes on top of their work
   Verified tests still pass"
   ```

---

## GitHub Actions Integration

### Automated Checks

**`.github/workflows/agent-coordination.yml`**:
```yaml
name: Agent Coordination Checks

on:
  push:
    branches: [ 'agent-*/**' ]
  pull_request:
    branches: [ main ]

jobs:
  check-locks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Check for lock conflicts
        run: |
          # Verify no overlapping locks
          python .github/scripts/check_locks.py

      - name: Validate intent file
        run: |
          # Verify intent file is valid JSON
          jq empty .agent-intents.json

      - name: Check cross-zone changes
        run: |
          # Detect cross-zone modifications without approval
          python .github/scripts/check_cross_zone.py

  prevent-conflicts:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0

      - name: Check for area violations
        run: |
          # Ensure agent stayed in their area (unless [CROSS-ZONE])
          python .github/scripts/check_area_ownership.py

  auto-label:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Add labels to PR
        run: |
          # Auto-add labels based on files changed
          gh pr edit ${{ github.event.pull_request.number }} \
            --add-label $(python .github/scripts/detect_labels.py)

  auto-assign-reviewers:
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'
    steps:
      - uses: actions/checkout@v3

      - name: Assign reviewers
        run: |
          # Assign area owners for cross-zone PRs
          python .github/scripts/assign_reviewers.py
```

### Status Badges

Add to README.md:
```markdown
## Agent Work Status

| Agent | Branch | Status | Tests | Last Update |
|-------|--------|--------|-------|-------------|
| Agent 1 | `agent-1/feature/char-select` | ![Status](https://img.shields.io/badge/status-in_progress-yellow) | ![Tests](https://img.shields.io/badge/tests-passing-green) | 2h ago |
| Agent 2 | `agent-2/refactor/game-board` | ![Status](https://img.shields.io/badge/status-ready-green) | ![Tests](https://img.shields.io/badge/tests-passing-green) | 1h ago |
| Agent 3 | `agent-3/test/integration` | ![Status](https://img.shields.io/badge/status-blocked-red) | ![Tests](https://img.shields.io/badge/tests-passing-green) | 30m ago |
| Agent 4 | - | ![Status](https://img.shields.io/badge/status-idle-lightgrey) | - | - |
```

---

## Helper Scripts

### 1. Lock Checker (`scripts/check-locks.sh`)
```bash
#!/bin/bash
# Check if any locks exist for a file before modifying

FILE=$1
AGENT_ID=$2

# Check all lock directories
for lock_dir in .agent-locks/*/; do
  agent=$(basename "$lock_dir")

  if [ "$agent" != "$AGENT_ID" ]; then
    lock_file="$lock_dir$(echo $FILE | tr '/' '-').lock"

    if [ -f "$lock_file" ]; then
      echo "⚠️  WARNING: File locked by $agent"
      cat "$lock_file"
      exit 1
    fi
  fi
done

echo "✅ No locks found. Safe to modify."
exit 0
```

### 2. Intent Validator (`scripts/validate-intent.js`)
```javascript
const fs = require('fs');

const intents = JSON.parse(fs.readFileSync('.agent-intents.json', 'utf8'));

// Check for file conflicts between agents
const fileMap = {};
for (const [agentId, intent] of Object.entries(intents.intents)) {
  for (const file of intent.files) {
    if (fileMap[file]) {
      console.error(`❌ Conflict: ${file} claimed by both ${fileMap[file]} and ${agentId}`);
      process.exit(1);
    }
    fileMap[file] = agentId;
  }
}

console.log('✅ No intent conflicts found');
```

### 3. Area Ownership Validator (`scripts/check-ownership.sh`)
```bash
#!/bin/bash
# Validate that agent is modifying files in their area

AGENT_ID=$1
BRANCH=$2

# Get changed files in this branch
CHANGED_FILES=$(git diff --name-only origin/main...HEAD)

# Define area ownership
declare -A OWNERSHIP=(
  ["src/game/"]="agent-1"
  ["src/components/"]="agent-2"
  ["src/test/"]="agent-3"
  ["server.cjs"]="agent-4"
)

for file in $CHANGED_FILES; do
  # Check if file is in owned area
  OWNER=""
  for path in "${!OWNERSHIP[@]}"; do
    if [[ $file == $path* ]]; then
      OWNER=${OWNERSHIP[$path]}
      break
    fi
  done

  # Check if agent owns this file
  if [ -n "$OWNER" ] && [ "$OWNER" != "$AGENT_ID" ]; then
    # Check if [CROSS-ZONE] tag exists in recent commits
    if ! git log -1 --pretty=%B | grep -q "\[CROSS-ZONE\]"; then
      echo "❌ $file belongs to $OWNER but modified by $AGENT_ID without [CROSS-ZONE] tag"
      exit 1
    fi
  fi
done

echo "✅ All modifications within area or properly tagged"
```

---

## Quick Reference Card

### Before Starting Work
```bash
git checkout main && git pull
git checkout -b agent-{n}/{type}/{name}
./scripts/check-locks.sh {file} agent-{n}
# Edit .agent-intents.json
git add .agent-intents.json && git commit -m "intent: ..."
```

### During Work
```bash
# Commit frequently
git add {files}
git commit -m "{type}({scope}): {message}"
git push origin agent-{n}/{branch}

# Check for conflicts
git fetch --all
./scripts/validate-intent.js
```

### When Complete
```bash
npm test  # Ensure all tests pass
git rm .agent-locks/agent-{n}/*.lock
# Create .merge-ready/agent-{n}.json
git add . && git commit -m "ready: {feature} complete"
gh pr create --base main --head agent-{n}/{branch}
```

### Emergency Override
```bash
# If you MUST modify another agent's area
# 1. Add [CROSS-ZONE] tag to commit
# 2. Explain why in commit body
# 3. Notify via PR comment or issue

git commit -m "fix(game): critical bug in moves.ts [CROSS-ZONE]

Emergency fix for production bug #42
Agent-1 notified via PR comment"
```

---

## Benefits of This System

1. **Zero Communication Overhead** - All coordination via files/commits
2. **Automatic Conflict Detection** - CI catches violations
3. **Clear Ownership** - No ambiguity about responsibility
4. **Parallel Work** - 4 agents work simultaneously without blocking
5. **Audit Trail** - Git history shows all coordination
6. **Self-Documenting** - Intent files explain what's happening
7. **Graceful Degradation** - System works even if some agents are offline
8. **GitHub Native** - Uses standard GitHub features (PRs, labels, reviews)

---

## Example Scenario: 4 Agents Working in Parallel

**Agent 1**: Implementing character selection UI
- Branch: `agent-1/feature/character-selection-ui`
- Files: `src/components/CharacterSelection.tsx`, needs `src/game/phases.ts`
- Intent: Declared in `.agent-intents.json`
- Lock: Created for `src/game/phases.ts` (cross-zone)

**Agent 2**: Refactoring GameBoard component
- Branch: `agent-2/refactor/game-board-cleanup`
- Files: `src/components/GameBoard.tsx`, `src/components/PlayerArea.tsx`
- Intent: Declared, blocks Agent 1 temporarily

**Agent 3**: Adding integration tests
- Branch: `agent-3/test/integration-suite`
- Files: `src/test/integration/*`
- Intent: Declared, no conflicts

**Agent 4**: Setting up CI/CD
- Branch: `agent-4/infrastructure/ci-cd-setup`
- Files: `.github/workflows/*`, `vite.config.ts`
- Intent: Declared, no conflicts

**Timeline**:
```
T+0:00  All agents pull main, create branches, declare intents
T+0:05  Agent 1 sees Agent 2 blocks GameBoard, waits
T+0:30  Agent 2 completes refactor, pushes, creates PR
T+0:35  Agent 1 rebases on Agent 2's branch, continues work
T+1:00  Agent 3 and 4 complete work independently
T+1:30  Agent 1 completes, all 4 PRs ready for review
T+2:00  All PRs reviewed and merged to main
```

No communication needed - all coordination via git!

---

## Maintenance

- Review and clean `.agent-locks/` weekly
- Archive completed intents in `.agent-intents.json`
- Update area ownership as project evolves
- Adjust workflows based on agent feedback

---

**Version**: 1.0
**Last Updated**: 2026-02-05
**Maintainer**: Multi-Agent Coordination System
