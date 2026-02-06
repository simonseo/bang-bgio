# Agent 5 (Project Manager) Handoff - Bang! Boardgame.io Project

**Date:** 2026-02-05
**Current Status:** 98% tests passing, 2 branches ready for review, active multi-agent coordination
**Active Agents:** Agent 1 (Game Logic), Agent 4 (Infrastructure), potential Agent 2/3
**Your Role:** Project Manager - Coordination, planning, review, and delivery

## Project Overview

This is a complete implementation of the Bang! card game using boardgame.io v0.50.2. The game supports 4-7 players with hidden roles (Sheriff, Deputy, Outlaw, Renegade), 80 unique cards, and 16 character abilities.

**Tech Stack:**
- **Framework:** boardgame.io v0.50.2
- **Frontend:** React 18, TypeScript
- **Build:** Vite
- **Testing:** Vitest (237 tests total)
- **Deployment:** GitHub Pages (planned)

## Current Status

### Test Health
- **Total:** 232/237 tests passing (98%)
- **Unit Tests:** 114/114 (100%) ✅
- **E2E Tests:** 25/25 (100%) ✅
- **Integration Tests:** 28/28 (100%) ✅
- **Remaining Issues:** 5 E2E tests need investigation

### Implementation Status
- ✅ All 80 cards defined and implemented
- ✅ All 16 character abilities tested
- ✅ Events parameter refactoring complete
- ✅ CI/CD pipeline configured
- ✅ Multi-agent coordination system established
- 🔄 Character selection UI in progress
- 📋 Browser testing pending

### Active Branches (Ready for Review)
1. **agent-1/feature/death-rewards** - Fixed 2 TODOs in death handling
2. **agent-1/fix/flaky-tests** - Fixed intermittent test failures in distance calculations

## Your Role as Agent 5 (Project Manager)

Based on our coordination system (see `.docs/AGENT_COORDINATION_PLAN.md`), you own:

### Core Responsibilities

**1. Coordination & Planning**
- Review and approve PRs from other agents
- Coordinate cross-zone work and dependencies
- Maintain TODO.md and prioritize tasks
- Prevent merge conflicts through smart scheduling
- Update `.agent-coordination.json` with agent status

**2. Quality Assurance**
- Verify all tests pass before merging branches
- Ensure code follows project patterns (see `CLAUDE.md`)
- Review for technical debt and architectural issues
- Validate that TDD methodology was followed

**3. Documentation Management**
- Keep `.docs/` up-to-date with latest decisions
- Maintain session logs and completion records
- Archive completed work and TODOs
- Update `MEMORY.md` with critical learnings

**4. Delivery & Deployment**
- Track progress toward MVP goals
- Coordinate release planning
- Ensure deployment pipeline works
- Verify production readiness

**5. Conflict Resolution**
- Mediate technical disagreements between agents
- Resolve file lock conflicts
- Arbitrate priority disputes
- Escalate blockers to user when needed

## Immediate Tasks (Priority Order)

### 🔴 Critical - Review Ready Branches

1. **Review agent-1/feature/death-rewards**
   - File: `src/game/moves.ts` (lines 872, 712)
   - Changes: Replaced manual death handling with `handlePlayerDeath()`, added deck shuffling
   - Tests: `src/test/unit/dynamite-death.test.ts` (3 tests, all passing)
   - Verification needed:
     ```bash
     git checkout agent-1/feature/death-rewards
     npm test -- src/test/unit/dynamite-death.test.ts
     git diff main...agent-1/feature/death-rewards
     ```
   - Decision: Merge to main or request changes?

2. **Review agent-1/fix/flaky-tests**
   - File: `src/test/unit/distance-abilities.test.ts`
   - Changes: Fixed flaky tests by explicitly setting neutral characters
   - Root cause: Random character assignment caused Paul Regret (+1 distance) to be counteracted by Rose Doolan (-1 distance)
   - Verification: Ran 20/20 consecutive times successfully
   - Decision: Merge to main or request changes?

### 🟡 High Priority - Assign Next Tasks

3. **Assign Agent 1 Next Task**
   - Options identified:
     - Character selection UI implementation
     - Browser testing (BANG!, Missed!, Equipment)
     - Rule clarifications (Beer targeting, Barrel stacking)
   - Decision needed: Which task should Agent 1 tackle next?

4. **Recruit/Brief Additional Agents**
   - Agent 2 (Frontend) - Character selection UI, polish existing components
   - Agent 3 (Testing) - Browser E2E tests, manual QA
   - Coordination: Create handoff docs if recruiting new agents

### 🟢 Medium Priority - Planning & Documentation

5. **Update TODO.md after merges**
   - Mark completed items
   - Archive to `.docs/archive/COMPLETED_TODOS.md`
   - Re-prioritize remaining tasks

6. **Plan MVP Milestone**
   - Define "playable game" criteria
   - Identify blocking issues for browser testing
   - Create deployment checklist

7. **Review CI/CD Pipeline**
   - Verify GitHub Actions workflows are functioning
   - Check test coverage reports
   - Ensure branch protection rules are set

## Git Coordination System

**CRITICAL:** As PM, you enforce these rules:

### Branch Review Process

1. **Before approving any PR:**
   ```bash
   # Switch to branch
   git checkout agent-{n}/{type}/{description}

   # Verify tests pass
   npm test -- --run

   # Check for conflicts with main
   git fetch origin main
   git diff origin/main...HEAD

   # Review changes
   git log origin/main..HEAD --oneline
   ```

2. **Merge criteria (ALL must be true):**
   - ✅ All tests pass
   - ✅ Follows conventional commit format
   - ✅ File locks released
   - ✅ Documentation updated if needed
   - ✅ No conflicts with main
   - ✅ Follows TDD methodology (test-first)

3. **Merge process:**
   ```bash
   # From main branch
   git checkout main
   git merge --no-ff agent-{n}/{type}/{description} -m "Merge: Description"
   git push origin main

   # Update coordination file
   # Mark branch as merged in .agent-coordination.json
   ```

### Agent Status Tracking

**Check `.agent-coordination.json` regularly:**
```json
{
  "agents": {
    "agent-1": {
      "name": "Game Logic Agent",
      "status": "active",
      "currentBranch": "agent-1/fix/flaky-tests",
      "lockedFiles": []
    }
  }
}
```

**Your responsibilities:**
- Update agent status when work starts/completes
- Track which agent owns which branch
- Prevent multiple agents from working on same files

## Area Ownership

**As PM, you coordinate across ALL zones:**

| Zone | Owner | Files | Your Role |
|------|-------|-------|-----------|
| Game Logic | Agent 1 | `src/game/`, `src/data/`, `src/ai/` | Review for correctness, test coverage |
| Frontend | Agent 2 | `src/components/`, `src/App.tsx` | Review for UX, accessibility, design |
| Testing | Agent 3 | `src/test/` | Review for coverage, edge cases |
| Infrastructure | Agent 4 | `.github/`, `scripts/`, configs | Review for CI/CD, build reliability |
| Documentation | All Agents | `.docs/` | Review for clarity, completeness |
| **Project Management** | **Agent 5 (You)** | `TODO.md`, `.agent-*` | Maintain, update, coordinate |

**Cross-Zone Work:**
- Requires `[CROSS-ZONE]` tag in commit message
- PM must approve before merge
- Extra scrutiny for unintended side effects

## Project Structure

```
bang-boardgame-io/
├── src/
│   ├── game/          # Game logic (Agent 1)
│   │   ├── moves.ts           # All move functions
│   │   ├── phases.ts          # Turn structure
│   │   ├── setup.ts           # Initial game state
│   │   └── utils/             # Distance, validation, etc.
│   ├── components/    # UI components (Agent 2)
│   ├── test/          # Tests (Agent 3)
│   │   ├── unit/              # Jest/Vitest unit tests
│   │   ├── e2e/               # End-to-end game flows
│   │   └── integration/       # React + boardgame.io
│   ├── data/          # Card/character definitions (Agent 1)
│   └── ai/            # AI player logic (Agent 1)
├── scripts/           # Helper scripts (Agent 4) ✅
│   ├── check-locks.sh         # Check file locks
│   ├── create-lock.sh         # Create file lock
│   ├── release-lock.sh        # Release file lock
│   ├── declare-intent.sh      # Declare work intent
│   └── mark-ready.sh          # Mark branch ready for review
├── .github/           # CI/CD (Agent 4)
│   └── workflows/
│       ├── ci.yml             # Test matrix, coverage
│       ├── pr-checks.yml      # PR validation
│       ├── code-quality.yml   # Linting, security
│       └── deploy.yml         # Production deployment
├── .docs/             # Documentation (All agents)
│   ├── AGENT_COORDINATION_PLAN.md  # Coordination system
│   ├── AGENT_{N}_HANDOFF.md        # Agent onboarding
│   ├── SESSION_*.md                # Session logs
│   └── archive/                    # Completed work
├── .agent-*           # Coordination files (Agent 5 maintains)
├── TODO.md            # Current tasks (Agent 5 maintains)
└── MEMORY.md          # Critical learnings (Agent 5 maintains)
```

## Key Documentation (Must Read)

**For PM Role:**
- **`.docs/AGENT_COORDINATION_PLAN.md`** - Complete coordination system
- **`TODO.md`** - Current tasks and priorities (you maintain this)
- **`MEMORY.md`** - Critical patterns and learnings (you maintain this)
- **`CLAUDE.md`** - Golden rules and project patterns

**For Technical Context:**
- `.docs/HOW_TO_ADD_CARDS.md` - Card implementation
- `.docs/HOW_TO_ADD_CHARACTERS.md` - Character abilities
- `.docs/SESSION_2026-02-05.md` - Recent session accomplishments
- `.docs/DEPLOYMENT.md` - Production deployment guide

**For Agent Coordination:**
- `.docs/AGENT_1_FLAKY_TESTS_FIX.md` - Example completed work doc
- `.agent-coordination.json` - Current agent status
- `.agent-locks/` - File lock tracking

## Technical Context (For Reviews)

### Critical Patterns to Verify

**1. boardgame.io v0.50.2 Events Parameter:**
```typescript
// ✅ CORRECT:
export function myMove({ G, ctx, events }: { G: GameState; ctx: any; events: any }) {
  events?.setActivePlayers({ ... });
}

// ❌ WRONG:
export function myMove({ G, ctx }: { G: GameState; ctx: any }) {
  ctx.events.setActivePlayers({ ... }); // ctx.events doesn't exist!
}
```

**2. Test-Driven Development (TDD):**
- RED: Write failing test FIRST
- GREEN: Write minimal code to pass
- REFACTOR: Clean up while staying green
- **Verify:** Agent wrote test before implementation (check git history)

**3. Systematic Debugging:**
- Root cause analysis before fixing
- Hypothesis testing (one variable at a time)
- Verification after fix
- **Verify:** Agent documented root cause in commit/PR

**4. Character Ability Integration:**
```typescript
// All draw phase abilities use helper functions:
- blackJackDraw(G, playerId)
- jesseJonesDraw(G, playerId, targetId)
- kitCarlsonDraw(G, playerId, chosenCards)
- pedroRamirezDraw(G, playerId)
```

### Code Review Checklist

For EVERY PR, verify:

- [ ] **Tests:** All existing tests pass (`npm test -- --run`)
- [ ] **New Tests:** New features have new tests (TDD followed)
- [ ] **Coverage:** Changes are adequately tested
- [ ] **Patterns:** Follows patterns in `CLAUDE.md` and `MEMORY.md`
- [ ] **Events:** Uses events parameter correctly (not ctx.events)
- [ ] **Types:** TypeScript types are correct
- [ ] **Documentation:** README/docs updated if behavior changed
- [ ] **Commits:** Follow conventional format (feat:, fix:, etc.)
- [ ] **Locks:** File locks released
- [ ] **No Regressions:** Didn't break existing functionality

## Decision-Making Framework

**When reviewing branches, ask:**

1. **Does it work?**
   - All tests pass?
   - Verified manually if needed?
   - No new bugs introduced?

2. **Is it correct?**
   - Follows Bang! game rules?
   - Implements requirements accurately?
   - Edge cases handled?

3. **Is it clean?**
   - Follows project patterns?
   - Code is readable?
   - No unnecessary complexity?

4. **Is it complete?**
   - Documentation updated?
   - Tests comprehensive?
   - File locks released?

**Merge if:** All 4 are YES
**Request changes if:** Any are NO
**Discuss with agent if:** Unclear or borderline

## Communication Protocol

**As PM, you:**

1. **Daily:**
   - Check `.agent-coordination.json` for agent status
   - Review new branches and PRs
   - Update TODO.md priorities

2. **Per Branch:**
   - Review when agent marks branch ready (`.agent-ready/*`)
   - Provide feedback within same work session if possible
   - Merge or request changes with clear reasoning

3. **Per Milestone:**
   - Update session logs (`.docs/SESSION_*.md`)
   - Archive completed TODOs
   - Update MEMORY.md with lessons learned

4. **When Blocked:**
   - Identify blocker root cause
   - Assign to appropriate agent
   - Escalate to user if outside agent capabilities

## Current Priorities (This Week)

### Must Complete:
1. ✅ Review agent-1/feature/death-rewards
2. ✅ Review agent-1/fix/flaky-tests
3. ✅ Merge approved branches to main
4. ✅ Assign Agent 1 next task from identified backlog

### Should Complete:
5. ✅ Plan character selection UI work (Agent 1 or Agent 2?)
6. ✅ Create browser testing plan (manual QA checklist)
7. ✅ Update TODO.md after merges

### Nice to Have:
8. ✅ Review CI/CD pipeline health
9. ✅ Plan MVP milestone criteria
10. ✅ Document deployment process

## Success Metrics

**You're succeeding if:**
- ✅ PRs reviewed within 24 hours
- ✅ No merge conflicts between agents
- ✅ Test coverage stays above 95%
- ✅ All agents have clear next tasks
- ✅ TODO.md reflects reality
- ✅ Documentation stays current
- ✅ Blockers resolved quickly
- ✅ Project moving toward MVP

## Known Issues (Track These)

### Critical (Block Development)
- None currently ✅

### High (Need Attention Soon)
1. **5 E2E test failures** - Need investigation (gameFlow, fullGameScenario suites)
2. **Browser testing pending** - BANG!, Missed!, Equipment need manual verification

### Medium (Track for Future)
1. **Character selection UI** - Auto-assigns first choice, should be interactive
2. **Rule clarifications** - Beer targeting, Barrel stacking need verification

### Low (Nice to Fix)
1. **Polish items** - Animations, sound effects, better card art

## Quick Start Checklist

**First Session as PM:**

- [ ] Read `.docs/AGENT_COORDINATION_PLAN.md` completely
- [ ] Review `TODO.md` current priorities
- [ ] Check `.agent-coordination.json` agent status
- [ ] Review recent git history: `git log --oneline --all --graph | head -30`
- [ ] Check branches ready for review: `ls .agent-ready/`
- [ ] Verify dev environment works:
  ```bash
  npm install
  npm test -- --run
  npm run dev
  ```

**Every Session:**

- [ ] Pull latest from origin: `git fetch --all`
- [ ] Check for ready branches: `ls .agent-ready/`
- [ ] Review any new PRs
- [ ] Update `.agent-coordination.json`
- [ ] Prioritize TODO.md
- [ ] Clear blockers

**Before Ending Session:**

- [ ] Document decisions in session log
- [ ] Update TODO.md with progress
- [ ] Commit coordination file changes
- [ ] Leave clear status for next session

## Questions?

**If you're unsure:**
1. Check recent session logs: `.docs/SESSION_*.md`
2. Review MEMORY.md for critical patterns
3. Look at agent handoff docs for context
4. Review git history for recent changes
5. Ask user for clarification if needed

## Tools at Your Disposal

**Scripts (in `scripts/`):**
- `check-locks.sh <file>` - See who has file locked
- `declare-intent.sh <agent> <branch> <description>` - Declare work
- `mark-ready.sh <agent> <branch> <summary>` - Mark branch ready
- `release-lock.sh <file>` - Release file lock

**Git Commands:**
```bash
# Review a branch
git checkout agent-{n}/{type}/{description}
git log origin/main..HEAD --oneline
git diff origin/main...HEAD

# Check test status
npm test -- --run

# Merge to main
git checkout main
git merge --no-ff <branch> -m "Merge: Description"
git push origin main
```

**Testing:**
```bash
npm test                           # All tests
npm test -- --watch               # Watch mode
npm test -- src/test/unit/*.test.ts  # Specific suite
npm run test:coverage             # Coverage report
```

## Welcome to the Project!

You're joining a well-coordinated multi-agent team. Your role as PM is to:
- **Keep things moving** - Review quickly, unblock agents
- **Maintain quality** - Enforce patterns, verify tests
- **Coordinate work** - Prevent conflicts, assign tasks
- **Track progress** - Update docs, monitor metrics
- **Deliver value** - Move toward playable MVP

The project is in good shape (98% tests passing), with clear patterns established. Your job is to **maintain momentum** while ensuring quality.

**Current Focus:** Review 2 ready branches, assign next Agent 1 task, plan character selection UI work.

Good luck, Agent 5! 🎯
