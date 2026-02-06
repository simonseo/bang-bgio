# Bang! Game TODO List

> **Note:** Completed items archived in `.docs/archive/COMPLETED_TODOS.md`
> **Session Logs:** See `.docs/SESSION_2026-02-05_RALPH_LOOP.md` for latest work

**Last Updated:** 2026-02-05 16:05 (Agent 5 PM Update)
**Test Status:** 20/20 project tests passing ✅ (100% on main after flaky-tests merge)
**Character Abilities:** 16/16 tested ✅ (all characters complete!)
**Refactoring:** Events parameter pattern complete ✅
**CI/CD:** GitHub Actions pipeline complete ✅

---

## 🔍 PM Review Status & Branch Management

### ✅ Recently Merged to Main
- **agent-1/fix/flaky-tests** - Merged by Agent 5 PM on 2026-02-05
  - Fixed flaky distance-abilities tests (90-95% → 100% pass rate)
  - Added comprehensive CI/CD pipeline with GitHub Actions
  - Added auto-port finding utility
  - All 20/20 project tests now passing on main ✅

### ⏳ Branches Awaiting Merge Decision
- **agent-1/feature/death-rewards** - Ready for review, but flaky test discovered
  - ✅ Code changes: Fixed 2 TODOs (handlePlayerDeath, shuffleDeck)
  - ✅ Tests: Added 3 passing dynamite-death tests
  - ⚠️ Issue: Discovered NEW flaky test (Volcanic weapon - 40% failure rate)
  - **PM Decision Pending:** Merge with known flaky test or fix flaky test first?

### 📦 Branches Ready for Review (Not Yet Evaluated)
- **agent-4/feature/server-and-cicd** - Status unknown, needs PM review
  - NOTE: CI/CD work was included in agent-1/fix/flaky-tests merge
  - May be duplicate or may have additional work

---

## 🎯 Agent Task Assignments (PM Prioritization)

### **Agent 1 - Next Task: FIX FLAKY VOLCANIC TEST** 🔴 HIGH PRIORITY
**Assigned Task:** Fix flaky Volcanic weapon tests (blocks death-rewards merge)

**Context:**
- During PM review, discovered Volcanic weapon test failing 40% of the time (2/5 runs)
- Affects TWO tests:
  - `src/test/e2e/bang-response.test.ts` - "should allow unlimited BANGs with Volcanic weapon"
  - `src/test/unit/moves.test.ts` - "should allow unlimited BANGs with Volcanic"
- Similar issue to distance-abilities flakiness (random state causing intermittent failures)

**Action Required:**
1. Investigate root cause (likely random character/equipment assignment)
2. Apply same fix pattern as distance-abilities (explicit state setup)
3. Verify 20/20 consecutive runs pass
4. Create branch: `agent-1/fix/flaky-volcanic-test`
5. Push for PM review

**After This:** death-rewards branch can be merged cleanly

---

### **Agent 3 - Next Task: BROWSER TESTING SUITE** 🟢 HIGH PRIORITY
**Assigned Task:** Manual QA testing of core gameplay in browser

**Context:**
- All unit/E2E tests passing (20/20)
- Core game mechanics implemented (BANG, Missed, Equipment, etc.)
- Need browser verification that everything works end-to-end
- Tests can pass while browser behavior differs (framework integration)

**Action Required:**
1. Test BANG! card with target selection in browser
2. Test Missed! response to BANG! attacks
3. Verify Equipment properly equips and shows in play area
4. Verify Weapon changes attack range (distance calculations)
5. Verify Barrel can be used to dodge BANG!
6. Document findings in `.docs/BROWSER_TEST_REPORT.md`
7. Create branch: `agent-3/test/browser-qa`
8. File issues for any bugs discovered

**Testing Checklist:**
- [ ] Start local game with 4 players
- [ ] Player can draw cards
- [ ] Player can play BANG! and select target
- [ ] Target player can respond with Missed!
- [ ] Equipment cards show in play area when equipped
- [ ] Weapon equipment changes attack range display
- [ ] Barrel triggers dodge prompt when attacked
- [ ] Character abilities work as expected
- [ ] Turn order progresses correctly
- [ ] Game ends with winner announcement

**Follow-up Tasks (After Browser Testing):**
- Test all 16 character abilities in browser
- Test advanced card interactions (Indians, Gatling, Duel, etc.)
- Performance testing with multiple concurrent games

---

### **Agent 4 - COMPLETED: TEST NETWORK MULTIPLAYER** ✅
**Status:** COMPLETE - Comprehensive test report created

**Completed Actions:**
1. ✅ Tested network multiplayer setup
2. ✅ Verified server functionality with various ports
3. ✅ Tested API endpoints (/games returns ["bang"])
4. ✅ Reviewed NetworkLobby UI (excellent!)
5. ✅ Created comprehensive test report (`.docs/NETWORK_MULTIPLAYER_TEST_REPORT.md`)
6. ✅ Identified 10 issues and provided prioritized recommendations
7. ✅ Updated TODO.md with detailed findings

**Key Findings:**
- 🟡 Overall Status: FUNCTIONAL but INCOMPLETE
- ✅ Core functionality works
- ⚠️ Several improvements needed (see report)
- Estimated effort to production-ready: 20-35 days

**Next Priority Tasks for Agent 4:**
1. 🔴 HIGH: Fix IP detection (shows wrong IP for LAN play)
2. 🟡 MEDIUM: Add match browser UI
3. 🟡 MEDIUM: Implement lobby waiting room with real-time updates
4. 🟡 MEDIUM: Display player names in game

---

## Architecture Status

- [x] **Events Parameter Refactoring** ✅ - Completed systematic refactoring to use events as separate parameter
  - ✅ All move functions updated to receive `{ G, ctx, events }` instead of accessing `ctx.events`
  - ✅ Phase hooks (onBegin, onEnd) updated to pass `events: ctx.events` when calling move functions
  - ✅ Stage moves updated to pass events parameter correctly
  - ✅ Eliminated all direct `ctx.events` usage in move functions
  - ✅ Added safety guards in phase hooks for undefined ctx during transitions
  - **Result**: 20/20 project tests passing ✅

- [x] **CI/CD Pipeline** ✅ - Complete GitHub Actions workflow
  - ✅ ci.yml: Test matrix (Node 18/20), coverage, type checking, builds
  - ✅ pr-checks.yml: PR validation, conventional commits, branch naming
  - ✅ code-quality.yml: Quality checks, security audit, test coverage
  - ✅ deploy.yml: Production deployment workflow
  - ✅ Multi-agent coordination checks integrated
  - See `.docs/CI_CD_GUIDE.md` for details

- [ ] **Future Architecture Review** - Consider comprehensive design review
  - Review official Bang! rules to ensure all mechanics are correctly understood
  - Study boardgame.io v0.50 best practices for complex reactive gameplay
  - Document patterns for reactive cards, AI handling, and state management
  - Evaluate if current architecture meets all game requirements

---

## Urgent

- [x] **Review agent-3/feature/new-work branch** ✅ - Branch doesn't exist, no work to review
- [x] **Fix gameFlow integration test** ✅ - Updated to test character selection phase (commit fd2ef14)
- [x] **Fix flaky distance-abilities tests** ✅ - Fixed by agent-1/fix/flaky-tests (merged to main)
- [ ] **Fix flaky Volcanic weapon tests** 🔴 - NEW ISSUE: 40% failure rate, blocks death-rewards merge (AGENT 1 ASSIGNED)

## High Priority

### 🎮 Gameplay Testing (Browser Required) - AGENT 3 ASSIGNED 🟢
- [ ] **Test BANG! card works** with target selection - Browser QA testing
- [ ] **Test Missed! response** to BANG! attacks - Browser QA testing
- [ ] Verify: Equipment properly equips and shows in play area
- [ ] Verify: Weapon changes attack range
- [ ] Verify: Barrel can be used to dodge BANG!
- **See Agent 3 task assignment above for complete testing checklist**

### 🎨 UI/UX Improvements
- [x] **Turn timer/waiting indicator** ✅ - Shows whose turn it is, waiting status, pending actions (commit 1f313ca)
- [x] **Action alerts for other players** ✅ - Real-time notifications for opponent actions (commit e1a4f22)

### 🐛 Bug Fixes
- [x] **Server connection bug** ✅ - Fixed with `npm run start:host` for network play (commit e36462c, see NETWORK_SETUP.md)
- [x] **AI takeDamage bug** ✅ - INVESTIGATED: Cannot reproduce. takeDamage available in respondToBang stage (phases.ts:179-182), all E2E tests pass (5/5), AIManager code correct. Likely fixed by events refactoring. Optional: browser verification.

---

## Medium Priority

### 👤 Character Abilities
**Status:** 16/16 tested ✅ (COMPLETE!)

**All Characters Tested:**
- ✅ Willy the Kid, Slab the Killer, Calamity Janet, Jourdonnais
- ✅ Paul Regret, Rose Doolan (distance modifiers)
- ✅ Bart Cassidy, Suzy Lafayette, El Gringo, Vulture Sam (triggered)
- ✅ Sid Ketchum (manual heal), Lucky Duke (draw!)
- ✅ Black Jack - Show 2nd card, if red draw 3rd (NEW)
- ✅ Jesse Jones - Draw 1st from player's hand (NEW)
- ✅ Kit Carlson - Look at top 3, choose 2 (NEW)
- ✅ Pedro Ramirez - Draw 1st from discard (NEW)

**Helper Functions Implemented:**
- `blackJackDraw(G, playerId)` - Automatic draw with red card bonus
- `jesseJonesDraw(G, playerId, targetId)` - Steal from player
- `kitCarlsonDraw(G, playerId, chosenCards)` - Choose 2 of 3 cards
- `pedroRamirezDraw(G, playerId)` - Draw from discard pile

**Note:** The draw phase helper functions are ready for UI integration when needed. UI can call these functions with player choices as parameters.

**UI:**
- [ ] **Character selection UI** - Add interactive UI phase for players to choose between 2 options (data structure exists, currently auto-assigns first)

---

## Low Priority

### 📚 Learning & Research
- [ ] **Check boardgame.io notable projects** - Review projects at https://boardgame.io/documentation/#/notable_projects for implementation patterns and best practices

### ✨ Polish
- [ ] Animations for card play, damage, death
- [ ] Sound effects (card play, BANG!, damage, death)
- [ ] Better card art (currently using placeholders)
- [ ] Victory screen with winner announcement
- [ ] Game log/history panel
- [ ] Undo/Redo support (if boardgame.io supports it)

### 🌐 Multiplayer
- [x] **Test network multiplayer** ✅ - Comprehensive testing complete (see `.docs/NETWORK_MULTIPLAYER_TEST_REPORT.md`)
  - **Status:** 🟡 FUNCTIONAL but INCOMPLETE
  - ✅ Server works correctly with custom port
  - ✅ NetworkLobby UI excellent
  - ✅ API endpoints functional
  - ⚠️ Issues identified (see report for details)
- [ ] **Fix server port conflict** 🔴 HIGH - Server crashes on EADDRINUSE (fix available in `agent-4/feature/server-and-cicd` PR - needs merge)
- [ ] **Fix IP detection** 🟡 MEDIUM - Shows public IP instead of local IP for LAN play
- [ ] **Add match browser** 🟡 MEDIUM - List and join available games
- [ ] **Implement lobby waiting room** 🟡 MEDIUM - Real-time player list, ready status
- [ ] **Display player names in game** 🟡 MEDIUM - Essential for multiplayer identity
- [ ] Add server URL configuration 🟠 LOW - Input field for custom server URL
- [ ] Add chat system 🟠 LOW
- [ ] Add spectator mode 🟠 LOW
- [ ] Add reconnection handling 🟠 LOW

### 🧪 Testing
- [x] **Fix fullGameScenario.test.tsx E2E tests** ✅ - All 20 tests passing! Previous failures appear to have been resolved by events refactoring and character selection implementation.
- [ ] Test all character abilities in browser

---

## Rule Clarifications Needed

- [ ] **Beer targeting rules** - Can Beer be given to myself OR other players? Check if there's a difference in when beer can be given to self vs others (Currently implemented as self-only per standard Bang! rules)
- [ ] Can you steal/discard cards in play or only in hand? (Rule: BOTH)
- [ ] Does Barrel stack with character abilities? (Rule: YES)
- [ ] Can Dynamite be voluntarily passed? (Rule: NO, automatic at start of turn)

---

## Known Issues

### Critical
- 🔴 **Flaky Volcanic weapon tests** - 40% failure rate (Agent 1 assigned to fix)
  - Affects: `src/test/e2e/bang-response.test.ts` and `src/test/unit/moves.test.ts`
  - Likely cause: Random state/character assignment (similar to distance-abilities)
  - Blocks: agent-1/feature/death-rewards merge

### Non-Critical
- ~~**Server port conflict**~~ ✅ - FIXED: Server auto-finds available port
- ~~**Flaky distance-abilities tests**~~ ✅ - FIXED: Explicitly set neutral characters
- Some items require browser testing vs unit tests

---

## DevOps Status

### CI/CD Pipeline ✅
- [x] **GitHub Actions CI/CD** - Complete pipeline set up (Merged via agent-1/fix/flaky-tests)
  - ✅ ci.yml: Test matrix (Node 18/20), coverage, type checking, builds
  - ✅ pr-checks.yml: PR validation, conventional commits, branch naming
  - ✅ code-quality.yml: Quality checks, security audit, test coverage
  - ✅ deploy.yml: Production deployment workflow
  - ✅ Multi-agent coordination checks integrated
  - See `.docs/CI_CD_GUIDE.md` for complete documentation

---

## Quick Reference

**Run Tests:**
```bash
npm test                    # All tests
npm test -- --watch        # Watch mode
npm test -- src/test/unit/moves.test.ts  # Specific file
```

**Run Dev Server:**
```bash
npm run dev                # Local development
npm run preview            # Preview production build
```

**Documentation:**
- `CLAUDE.md` - Golden rules and patterns
- `.docs/HOW_TO_ADD_CARDS.md` - Card implementation guide
- `.docs/HOW_TO_ADD_CHARACTERS.md` - Character ability guide
- `.docs/DEPLOYMENT.md` - Production deployment
- `.docs/PLAYER_INSTRUCTIONS.md` - Complete how-to-play

**Archives:**
- `.docs/archive/COMPLETED_TODOS.md` - Completed work archive
- `.docs/archive/old-sessions/` - Historical session files
- `.docs/archive/old-guides/` - Superseded documentation
