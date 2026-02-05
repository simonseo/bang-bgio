# Agent 4 Handoff - Bang! Boardgame.io Project

**Date:** 2026-02-05
**Current Status:** 98% tests passing, character selection phase implemented
**Active Agents:** Agent 1 (main development), potential Agent 3 (feature branch)

## Project Overview

This is a complete implementation of the Bang! card game using boardgame.io v0.50.2. The game supports 4-7 players with hidden roles (Sheriff, Deputy, Outlaw, Renegade), 80 unique cards, and 16 character abilities.

## Current Test Status

- **Total:** 237/241 tests passing (98%)
- **Unit Tests:** 114/114 (100%) ✅
- **E2E Tests:** 29/29 (100%) ✅
- **Integration Tests:** 19/20 (95%)

## Your Role as Agent 4

Based on our coordination system (see `.docs/AGENT_COORDINATION_PLAN.md`), you own:
- **Infrastructure & Tooling**: Build config, dev tools, CI/CD, scripts
- **Shared Utilities**: Helper functions, type definitions, constants
- **Documentation**: Keeping docs up-to-date

## Current Priorities

### Immediate Tasks

1. **Review agent-3/feature/new-work branch** (if exists)
   - Check for conflicts with main
   - Review code quality
   - Merge to main if approved

2. **Fix gameFlow integration test failure**
   - File: `src/test/integration/gameFlow.test.ts`
   - Issue: Test assumes game starts in 'play' phase, but now starts in 'characterSelection'
   - Solution: The beforeEach hook attempts to complete character selection but needs debugging
   - Current implementation:
     ```typescript
     beforeEach(() => {
       client = Client({ game: BangGame, numPlayers: 4, playerID: '0' });
       let state = client.getState();
       while (state.ctx.phase === 'characterSelection') {
         const currentPlayer = state.ctx.currentPlayer;
         const choice = state.G.players[currentPlayer].characterChoices[0];
         client.moves.selectCharacter(choice.id);
         state = client.getState();
       }
     });
     ```

### Medium Priority

- **Update all integration/E2E tests** to handle character selection phase
- **Create GitHub Actions workflow** for CI/CD (see coordination plan)
- **Add helper scripts** from coordination plan:
  - `scripts/check-locks.sh` ✅ (exists)
  - `scripts/create-lock.sh` ✅ (exists)
  - `scripts/release-lock.sh` ✅ (exists)
  - `scripts/declare-intent.sh` ✅ (exists)
  - `scripts/mark-ready.sh` ✅ (exists)
  - Additional automation scripts as needed

## Git Coordination System

**CRITICAL:** Follow these steps for ALL work:

1. **Before starting:**
   ```bash
   # Check for locks
   ./scripts/check-locks.sh src/path/to/file.ts

   # Declare your intent
   ./scripts/declare-intent.sh agent-4 agent-4/type/description "What you're doing"

   # Create your branch
   git checkout -b agent-4/type/description

   # Lock files you'll modify
   ./scripts/create-lock.sh agent-4 agent-4/type/description src/path/to/file.ts "Why"
   ```

2. **While working:**
   - Commit frequently with conventional commit messages
   - Use tags: `[WIP]`, `[CROSS-ZONE]`, `[BREAKING]`, `[BLOCKED]`
   - Push your branch regularly

3. **When done:**
   ```bash
   # Release locks
   ./scripts/release-lock.sh src/path/to/file.ts

   # Mark ready for review
   ./scripts/mark-ready.sh agent-4 agent-4/type/description "Summary of work"

   # Push and create PR
   git push -u origin agent-4/type/description
   gh pr create --title "Your title" --body "Description"
   ```

## Area Ownership

**Your Zone (Agent 4):**
- `.github/` - CI/CD workflows
- `scripts/` - Build and utility scripts
- `vite.config.ts`, `tsconfig.json`, `package.json` - Build config
- `.docs/` - Documentation (shared with all agents)

**DO NOT modify without coordination:**
- `src/game/` - Agent 1's zone (game logic)
- `src/components/` - Agent 2's zone (UI)
- `src/test/` - Agent 3's zone (testing)

**Exception:** Cross-zone work is allowed with `[CROSS-ZONE]` tag in commit message.

## Recent Work (Agent 1)

**Just Completed:**
- Character selection phase implementation (TDD methodology)
- All players now choose from 2 random characters before game starts
- Added `characterSelection` phase that transitions to `play` after all select
- New E2E tests: `src/test/e2e/character-selection-phase.test.ts`

**Current Branch:** `agent-1/feature/character-selection-ui`
**Status:** WIP - needs integration test fixes before merge

## Project Structure

```
bang-boardgame-io/
├── src/
│   ├── game/          # Game logic (Agent 1)
│   ├── components/    # UI components (Agent 2)
│   ├── test/          # Tests (Agent 3)
│   ├── data/          # Card/character definitions (Agent 1)
│   └── ai/            # AI player logic (Agent 1)
├── scripts/           # Helper scripts (Agent 4) ✅
├── .github/           # CI/CD (Agent 4) - NEEDS SETUP
├── .docs/             # Documentation (All agents)
└── .agent-*           # Coordination files (All agents)
```

## Key Documentation

**Must Read:**
- `CLAUDE.md` - Golden rules and patterns
- `.docs/AGENT_COORDINATION_PLAN.md` - Full coordination system
- `.docs/HOW_TO_ADD_CARDS.md` - Card implementation
- `.docs/HOW_TO_ADD_CHARACTERS.md` - Character abilities

**Reference:**
- `TODO.md` - Current tasks and priorities
- `MEMORY.md` - Critical learnings and patterns
- `.agent-coordination.json` - Current agent status

## Technical Context

### boardgame.io v0.50.2 Critical Patterns

1. **Events Parameter Pattern:**
   ```typescript
   // CORRECT:
   export function myMove({ G, ctx, events }: { G: GameState; ctx: any; events: any }) {
     events?.setActivePlayers({ ... });
   }

   // WRONG:
   export function myMove({ G, ctx }: { G: GameState; ctx: any }) {
     ctx.events.setActivePlayers({ ... }); // ctx.events doesn't exist!
   }
   ```

2. **Phase hooks pass events:**
   ```typescript
   onBegin: (G, ctx) => {
     myMove({ G, ctx, events: ctx.events });
   }
   ```

### Testing Strategy

- **Unit tests:** Test individual functions in isolation
- **E2E tests:** Test game flow with boardgame.io Client
- **Integration tests:** Test React components + game logic
- **TDD:** RED (write failing test) → GREEN (minimal fix) → REFACTOR (clean up)

### Git Configuration

- **Remote:** `git@github-main:simonseo/bang-bgio.git`
- **Branch naming:** `agent-{n}/{type}/{description}`
  - Types: `feature`, `bugfix`, `refactor`, `docs`, `test`
- **Main branch:** Protected, requires PR + review

## Known Issues

1. **gameFlow integration test fails** - Character selection not completed in test setup
2. **AI takeDamage bug** - May be outdated TODO, needs browser testing to verify
3. **Some items need browser testing** vs unit tests

## Communication Protocol

1. **Check `.agent-coordination.json`** before starting work
2. **Update your status** when starting/pausing work
3. **Lock files** before modifying
4. **Commit messages** should be clear and use conventional format
5. **PR descriptions** should reference issue/task numbers

## Quick Start Checklist

- [ ] Read `.docs/AGENT_COORDINATION_PLAN.md` completely
- [ ] Check `.agent-coordination.json` for current agent status
- [ ] Review `TODO.md` for current priorities
- [ ] Set up your development environment:
  ```bash
  npm install
  npm test -- --run  # Verify tests pass
  npm run dev        # Start dev server
  ```
- [ ] Declare intent for first task
- [ ] Create branch following naming convention
- [ ] Lock any files you'll modify

## Questions?

If anything is unclear:
1. Check the documentation files listed above
2. Review recent commits for context: `git log --oneline -20`
3. Check other agents' branches: `git branch -a`
4. Look at `.agent-coordination.json` for agent contact info (when available)

## Success Criteria

You're doing well if:
- ✅ All your commits follow the branch naming convention
- ✅ You declare intent before starting work
- ✅ You lock files before modifying them
- ✅ Tests pass before you push
- ✅ You don't modify other agents' zones without coordination
- ✅ Your PRs are focused and well-described

Welcome to the team, Agent 4! 🎉
