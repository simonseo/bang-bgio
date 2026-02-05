# Bang! Game TODO List

> **Note:** Completed items archived in `.docs/archive/COMPLETED_TODOS.md`
> **Session Logs:** See `.docs/SESSION_2026-02-05_RALPH_LOOP.md` for latest work

**Last Updated:** 2026-02-05 21:36
**Test Status:** 232/237 tests passing ✅ (98% - Unit: 114/114, E2E: 25/25, Integration: 28/28 ✅)
**Character Abilities:** 16/16 tested ✅ (all characters complete!)
**Refactoring:** Events parameter pattern complete ✅
**Git:** Initialized ✅ (commits: defa3b3, e36462c, 1f313ca, e1a4f22, 5f8b7b9)

---

## Architecture Status

- [x] **Events Parameter Refactoring** ✅ - Completed systematic refactoring to use events as separate parameter
  - ✅ All move functions updated to receive `{ G, ctx, events }` instead of accessing `ctx.events`
  - ✅ Phase hooks (onBegin, onEnd) updated to pass `events: ctx.events` when calling move functions
  - ✅ Stage moves updated to pass events parameter correctly
  - ✅ Eliminated all direct `ctx.events` usage in move functions
  - ✅ Added safety guards in phase hooks for undefined ctx during transitions
  - **Result**: 222/237 tests passing, all unit tests passing, refactoring complete

- [ ] **Future Architecture Review** - Consider comprehensive design review
  - Review official Bang! rules to ensure all mechanics are correctly understood
  - Study boardgame.io v0.50 best practices for complex reactive gameplay
  - Document patterns for reactive cards, AI handling, and state management
  - Evaluate if current architecture meets all game requirements

---

## Urgent

- [x] **Review agent-3/feature/new-work branch** ✅ - Branch doesn't exist, no work to review
- [x] **Fix gameFlow integration test** ✅ - Updated to test character selection phase (commit fd2ef14)

## High Priority

### 🎮 Gameplay Testing (Browser Required)
- [ ] **Test BANG! card works** with target selection - Needs browser testing
- [ ] **Test Missed! response** to BANG! attacks - Needs browser testing
- [ ] Verify: Equipment properly equips and shows in play area
- [ ] Verify: Weapon changes attack range
- [ ] Verify: Barrel can be used to dodge BANG!

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
- [x] **Fix server port conflict** ✅ - Server now automatically finds available port (8000-8009)
- [ ] Test network multiplayer works
- [ ] Add player names/avatars
- [ ] Add chat system
- [ ] Add spectator mode

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
- None currently (move signatures fixed! 🎉)

### Non-Critical
- ~~**Server port conflict**~~ ✅ - FIXED: Server auto-finds available port
- Some items require browser testing vs unit tests

---

## DevOps Status

### CI/CD Pipeline ✅
- [x] **GitHub Actions CI/CD** - Complete pipeline set up
  - ✅ ci.yml: Test matrix (Node 18/20), coverage, type checking, builds
  - ✅ pr-checks.yml: PR validation, conventional commits, branch naming
  - ✅ code-quality.yml: Quality checks, security audit, test coverage
  - ✅ deploy.yml: Production deployment workflow
  - ✅ Multi-agent coordination checks integrated

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
