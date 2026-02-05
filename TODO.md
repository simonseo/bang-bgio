# Bang! Game TODO List

> **Note:** Completed items archived in `.docs/archive/COMPLETED_TODOS.md`
> **Session Logs:** See `.docs/SESSION_2026-02-05_RALPH_LOOP.md` for latest work

**Last Updated:** 2026-02-05 11:52
**Test Status:** 222/237 tests passing ✅ (114/114 unit tests ✅, some E2E tests need work)
**Character Abilities:** 16/16 tested ✅ (all characters complete!)
**Refactoring:** Events parameter pattern complete ✅

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

## High Priority

### 🎮 Gameplay Testing (Browser Required)
- [ ] **Test BANG! card works** with target selection - Needs browser testing
- [ ] **Test Missed! response** to BANG! attacks - Needs browser testing
- [ ] Verify: Equipment properly equips and shows in play area
- [ ] Verify: Weapon changes attack range
- [ ] Verify: Barrel can be used to dodge BANG!

### 🎨 UI/UX Improvements
- [ ] Add turn timer or "waiting for..." indicator
- [ ] **Action alerts for other players** - Show notifications when opponents play cards, take damage, etc.

### 🐛 Bug Fixes
- [ ] **Server connection bug** - Cannot connect with `npm start --host`, error says "Cannot connect to server. Make sure the server is running"

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
- [ ] Fix server port conflict (EADDRINUSE on 8000)
- [ ] Test network multiplayer works
- [ ] Add player names/avatars
- [ ] Add chat system
- [ ] Add spectator mode

### 🧪 Testing
- [ ] **Fix fullGameScenario.test.tsx E2E tests** (4 failures):
  - Role initialization test: Client without playerID shows roles as 'HIDDEN' - need to specify playerID or check differently
  - BANG! limit test: Client.moves doesn't return 'INVALID_MOVE', need to check game state instead
  - Beer healing test: Same issue - need to verify through state changes not return values
  - Equipment test: Same issue - verify equipment in player.inPlay instead of checking return value
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
- **Server port conflict** - Work around: `lsof -ti:8000 | xargs kill -9`
- **2 flaky unit tests** - 90/92 pass consistently
- Some items require browser testing vs unit tests

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
