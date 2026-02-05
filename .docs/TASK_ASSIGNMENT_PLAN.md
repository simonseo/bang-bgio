# Task Assignment Plan

**Generated:** 2026-02-05 22:05
**Status:** All tasks assigned to agents based on area ownership

---

## Agent Status Summary

### Agent 1 (Game Logic & Backend) - streamed-drifting-lerdorf
- **Status:** Was working on integration tests (now completed by Agent 3)
- **Area:** `src/game/`, `src/data/`
- **Next Task:** Character selection UI backend logic

### Agent 2 (UI Components) - current-session
- **Status:** Available for new tasks
- **Area:** `src/components/`, `src/styles/`, `public/assets/`
- **Next Task:** Character selection UI frontend

### Agent 3 (Testing & Quality) - agent-3-ralph ✅
- **Status:** ACTIVE - Just completed AI takeDamage bug fix
- **Area:** `src/test/`, bug fixes, quality assurance
- **Completed:** Integration test fixes (28/28 passing), AI takeDamage bug
- **Next Task:** Fix fullGameScenario E2E tests

### Agent 4 (Infrastructure & DevOps) - UNASSIGNED
- **Status:** Not yet active
- **Area:** `server.cjs`, configs, CI/CD, docs, deployment
- **Next Task:** Fix server port conflict

---

## Task Queue by Priority

### 🔴 HIGH PRIORITY

#### Agent 3 (Testing) - IMMEDIATE
1. ✅ **DONE: Integration test fixes** - 28/28 passing (completed on agent-3/feature/new-work)
2. ✅ **DONE: AI takeDamage bug** - Fixed using playMissed() pattern (completed on agent-3/fix/ai-take-damage-bug)
3. **NEXT: Fix fullGameScenario E2E tests** (4 failures)
   - Files: `src/test/e2e/fullGameScenario.test.tsx`
   - Issue: Tests checking move return values instead of state changes
   - Estimate: 1-2 hours

#### Agent 1 + Agent 2 (Backend + Frontend) - PARALLEL
4. **Character Selection UI** - Split between agents
   - **Agent 1 Backend:** Game logic for character selection phase
     - Files: `src/game/phases.ts`, `src/game/setup.ts`
     - Add character selection phase with 2-choice UI
   - **Agent 2 Frontend:** Character selection UI component
     - Files: `src/components/CharacterSelection.tsx` (new)
     - Interactive modal for choosing between 2 character options
   - **Dependency:** Backend must be done first, then frontend
   - Estimate: 3-4 hours total

#### Agent 2 (UI) - AFTER CHARACTER SELECTION
5. **Gameplay Testing (Browser)** - Manual testing checklist
   - Test BANG! card with target selection
   - Test Missed! response to BANG! attacks
   - Verify equipment equips and shows in play area
   - Verify weapon changes attack range
   - Verify Barrel can be used to dodge BANG!
   - Estimate: 1-2 hours manual testing

---

### 🟡 MEDIUM PRIORITY

#### Agent 4 (Infrastructure) - WHEN AVAILABLE
6. **Fix server port conflict** (EADDRINUSE on 8000)
   - Files: `server.cjs`
   - Add port detection and auto-increment
   - Estimate: 30 minutes

7. **Test network multiplayer**
   - Manual testing with multiple browsers
   - Document any issues found
   - Estimate: 1 hour

#### Agent 2 (UI) - POLISH
8. **Victory screen with winner announcement**
   - Files: `src/components/VictoryScreen.tsx` (new)
   - Display winner, role reveal, game stats
   - Estimate: 2 hours

9. **Game log/history panel**
   - Files: `src/components/GameLog.tsx` (new)
   - Show recent actions and events
   - Estimate: 2-3 hours

---

### 🟢 LOW PRIORITY

#### Agent 3 (Research) - BACKLOG
10. **Check boardgame.io notable projects**
    - Research best practices and patterns
    - Document findings in `.docs/RESEARCH.md`
    - Estimate: 1 hour

#### Agent 2 (UI Polish) - BACKLOG
11. **Animations for card play, damage, death**
    - Add CSS/React animations
    - Estimate: 4-6 hours

12. **Sound effects** (card play, BANG!, damage, death)
    - Add audio files and playback logic
    - Estimate: 2-3 hours

13. **Better card art** (currently using placeholders)
    - Design or source card graphics
    - Estimate: 8-12 hours (or external designer)

#### Agent 4 (Infrastructure) - BACKLOG
14. **Multiplayer features**
    - Add player names/avatars
    - Add chat system
    - Add spectator mode
    - Estimate: 8-12 hours total

15. **Undo/Redo support** (if boardgame.io supports it)
    - Research boardgame.io undo/redo
    - Implement if feasible
    - Estimate: 3-4 hours

---

## Task Dependencies

```
Character Selection UI:
  Agent 1 (Backend) → Agent 2 (Frontend)
  └─ Must complete before gameplay testing

Gameplay Testing:
  Requires: Character Selection UI complete
  └─ Manual browser testing

E2E Test Fixes:
  No dependencies - can start immediately

Server Port Fix:
  No dependencies - can start when Agent 4 available
```

---

## Next Steps for Each Agent

### Agent 1 (streamed-drifting-lerdorf)
```bash
git checkout main
git pull origin main
git checkout -b agent-1/feature/character-selection-backend
# Work on character selection phase logic
# Update .agent-coordination.json with status
```

### Agent 2 (current-session)
```bash
# Wait for Agent 1 to complete backend
# OR start on victory screen / game log in parallel
git checkout main
git pull origin main
git checkout -b agent-2/feature/victory-screen
# OR: git checkout -b agent-2/feature/character-selection-ui
```

### Agent 3 (agent-3-ralph) - ME, NEXT TASK
```bash
git checkout main
git pull origin main
git checkout -b agent-3/fix/fullgame-scenario-tests
# Fix E2E tests to check state instead of return values
# Update .agent-coordination.json with status
```

### Agent 4 (UNASSIGNED)
```bash
# When available:
git checkout main
git pull origin main
git checkout -b agent-4/fix/server-port-conflict
# Add port detection and auto-increment to server.cjs
```

---

## Merge Order

1. ✅ **agent-3/feature/new-work** (integration tests) - Ready to merge
2. ✅ **agent-3/fix/ai-take-damage-bug** - Ready to merge
3. **agent-3/fix/fullgame-scenario-tests** - Next to complete
4. **agent-1/feature/character-selection-backend** - Then agent-2 can start frontend
5. **agent-2/feature/character-selection-ui** - After backend done
6. **agent-4/fix/server-port-conflict** - Independent, can merge anytime
7. **agent-2/feature/victory-screen** - Independent, can merge anytime

---

## Notes

- **Agent 3 (me)** should continue with E2E test fixes next iteration
- **Agent 1** needs to start character selection backend OR take over another high-priority task
- **Agent 2** has multiple UI tasks ready - can start victory screen in parallel
- **Agent 4** is not active yet - infrastructure tasks are waiting
- All agents should update `.agent-coordination.json` when starting/completing tasks
- Mark tasks as complete in `TODO.md` and add to `.docs/archive/COMPLETED_TODOS.md`
