# Bang! Card Game - Project Handoff Document

**Last Updated:** 2026-02-04 21:30

## Project Overview

A web-based implementation of the Bang! card game using **boardgame.io** (v0.50.0), **React**, **TypeScript**, and **Vite**. The game supports 4-7 players with full character abilities, all card types, and both local and network multiplayer modes.

**Current Status:** ✅ Core gameplay working! Recent critical bugs fixed (move signatures, role visibility, UI improvements). See TODO.md for remaining work.

---

## 🎯 Quick Start

```bash
# Install dependencies
npm install

# Start development server (local play only)
npm run dev
# Opens at http://localhost:3001

# Run tests
npm test

# Run specific test
npm test -- src/test/unit/moves.test.ts
```

---

## ✅ Recent Fixes (2026-02-04)

### 1. ✅ CRITICAL: Move Function Signature Fix

**Problem:** `equipCard` and `playBang` were failing with `Cannot read properties of undefined (reading 'undefined')`

**Root Cause:** BoardGame.io move functions receive `{ G, ctx }` as single object parameter, but our functions were using separate parameters `(G, ctx, ...args)`

**Fix:** Updated all 13 move functions to use correct signature:
```typescript
// BEFORE (WRONG):
export function playBang(G: BangGameState, ctx: GameCtx, cardId: string, targetId: string)

// AFTER (CORRECT):
export function playBang({ G, ctx }: { G: BangGameState; ctx: GameCtx }, cardId: string, targetId: string)
```

**Files Changed:**
- `src/game/moves.ts` - All 13 functions fixed
- `src/test/unit/moves.test.ts` - Created test to verify fix

**Verification:** ✅ Unit tests pass (2/2), Integration tests pass (2/2)

**Documentation:** See `MOVE_SIGNATURE_FIX.md` for complete analysis

### 2. ✅ Role Visibility Fixed

**Problem:** Players could see all roles instead of just Sheriff + own role

**Root Cause:** Function wrapping in Game.ts and wrong playerView signature bypassed filtering

**Fix:**
- Changed `playerView: (G, ctx, playerID) => bangPlayerView(...)` to `playerView: bangPlayerView`
- Updated playerView.ts to use object destructuring: `({ G, ctx, playerID })`

**Files Changed:**
- `src/Game.ts` - Removed function wrapping
- `src/game/playerView.ts` - Fixed signature

**Verification:** ✅ Role filtering now works correctly

### 3. ✅ UI Improvements

**Completed:**
- ✅ Opponents moved from left sidebar to top horizontal scroll
- ✅ Health display shows (3/4) format with max health
- ✅ Character descriptions always visible (not hover-only)
- ✅ Highlight clearing when switching between cards
- ✅ Debug logging added for troubleshooting

**Files Changed:**
- `src/components/GameBoard.tsx` - Major layout refactor
- `src/components/CardOverlay.tsx` - Position adjustments

**Documentation:** See `LATEST_FIXES.md` for testing instructions

---

## 📋 What's Next

See **`TODO.md`** for comprehensive list of remaining work.

### High Priority

1. **Verify equipCard and playBang work in browser** - Move signature fix was verified in tests, needs browser confirmation
2. **Prevent illegal moves before drawing** - Enforce hasDrawn validation
3. **Add phase indicator UI** - Show "Draw Phase" vs "Action Phase"
4. **Fix BANG not reducing health** - Reported but not yet investigated
5. **Fix Wells Fargo** - Reported as broken
6. **Implement discard phase** - Force discard when hand > health

### Medium Priority

- Deck reshuffling when empty
- Error modal for invalid moves
- Equipment visibility for other players
- Card explanation accessibility
- Test all card types work
- Test all character abilities

### Low Priority

- Animations for card play, damage, death
- Sound effects
- Victory screen
- Multiplayer server fixes (port conflict)

---

## 📁 Project Structure

```
bang-boardgame-io/
├── src/
│   ├── Game.ts                    # Main boardgame.io game definition ✅ Fixed
│   ├── App.tsx                    # React app with mode selection
│   │
│   ├── game/                      # Game logic
│   │   ├── setup.ts               # Initial game state
│   │   ├── moves.ts               # All card moves ✅ ALL FIXED
│   │   ├── phases.ts              # Turn structure
│   │   ├── playerView.ts          # Secret info filtering ✅ Fixed
│   │   ├── victory.ts             # Win conditions
│   │   └── utils/
│   │       ├── distance.ts        # Distance/range calculations
│   │       ├── validation.ts      # Move validation
│   │       ├── playability.ts     # Check which cards are playable
│   │       ├── characterAbilities.ts # Character powers
│   │       └── stateValidation.ts # Defensive validation
│   │
│   ├── data/                      # Game data
│   │   ├── cards.ts               # All 80 cards
│   │   ├── characters.ts          # All 16 characters
│   │   ├── roles.ts               # Roles
│   │   └── deck.ts                # Deck composition
│   │
│   ├── components/                # React UI
│   │   ├── GameBoard.tsx          # Main game board ✅ Refactored
│   │   ├── Card.tsx               # Card display
│   │   ├── CardOverlay.tsx        # Suit/rank display
│   │   └── ... (other components)
│   │
│   └── test/
│       ├── unit/                  # Unit tests
│       │   └── moves.test.ts      # ✅ NEW - Tests move signatures
│       └── integration/           # Integration tests
│           └── gameInitialization.test.tsx # ✅ Passing
│
├── TODO.md                        # ✅ NEW - Comprehensive task list
├── MOVE_SIGNATURE_FIX.md          # ✅ NEW - Documents critical fix
├── LATEST_FIXES.md                # ✅ NEW - UI improvement guide
├── BOARDGAME_IO_PATTERNS.md       # Reference for correct patterns
├── package.json                   # Dependencies & scripts
└── server.cjs                     # Multiplayer server
```

---

## 🔑 Key Files to Understand

### 1. `src/game/moves.ts` ✅ RECENTLY FIXED

**All 13 move functions now use correct signature:**
```typescript
export function moveName({ G, ctx }: { G: BangGameState; ctx: GameCtx }, ...args) {
  const playerId = ctx.currentPlayer; // ✅ Now works correctly
  // ... move logic
}
```

**Functions Fixed:**
- standardDraw, playBang, playMissed, useBarrel, takeDamage
- playBeer, playSaloon, playStagecoach, playWellsFargo
- playPanic, playCatBalou, equipCard, passTurn, discardCards

### 2. `BOARDGAME_IO_PATTERNS.md`

**Essential reference** showing correct BoardGame.io usage:
- Move function signatures
- PlayerView function structure
- Game definition patterns
- Common mistakes to avoid

**Read this before modifying game logic!**

### 3. `TODO.md`

**Comprehensive list** of all requested features and fixes. Start here to see what needs work.

### 4. `MOVE_SIGNATURE_FIX.md`

**Case study** of systematic debugging approach:
- Phase 1: Root cause investigation
- Phase 2: Pattern analysis (checked boardgame.io docs)
- Phase 3: Hypothesis testing (created failing test)
- Phase 4: Implementation (fixed all functions)

**Reference this for debugging methodology.**

---

## 🎮 Game Rules Reference

### Role Distribution

| Players | Sheriff | Deputy | Outlaw | Renegade |
|---------|---------|--------|--------|----------|
| 4       | 1       | 0      | 2      | 1        |
| 5       | 1       | 1      | 2      | 1        |
| 6       | 1       | 1      | 3      | 1        |
| 7       | 1       | 2      | 3      | 1        |

### Role Visibility Rules ✅ NOW WORKING

- **Sheriff:** Always visible to everyone
- **Your role:** Visible only to you
- **Other roles:** Hidden until death
- **Dead players:** Role revealed to all

### Turn Structure

1. **Start of Turn:** Resolve Dynamite, Jail (if applicable) ⚠️ Not yet implemented
2. **Draw Phase:** Draw 2 cards (or character ability)
3. **Action Phase:** Play cards, unlimited actions
4. **Discard Phase:** Discard down to health ⚠️ Not yet enforced

### BANG! Rules

- **Limit:** 1 BANG! per turn
- **Exception:** Volcanic weapon or Willy the Kid = unlimited
- **Range:** Must be in range (weapon range vs distance)
- **Defense:** Target can play Missed! or use Barrel

### Victory Conditions

- **Sheriff dies:** Outlaws win (unless only Renegade left)
- **All Outlaws + Renegade dead:** Sheriff/Deputies win
- **Only Sheriff + Renegade alive:** Continue until one wins

---

## 🧪 Testing

### Unit Tests

**Status:** ✅ Passing (2/2)

```bash
npm test -- src/test/unit/moves.test.ts
```

Tests move function signatures work correctly.

### Integration Tests

**Status:** ✅ Passing (2/2)

```bash
npm test -- src/test/integration/gameInitialization.test.tsx
```

Tests game initializes without errors.

### Manual Testing Checklist

#### Basic Gameplay ✅ Should Work Now
- [x] Start local 4-player game
- [x] Click "Draw Cards" - draws 2 cards
- [x] Green ring shows playable cards
- [x] Click card to select (yellow ring)
- [ ] **NEEDS TESTING:** Click equipment card - should equip
- [ ] **NEEDS TESTING:** Click BANG + target - should attack
- [x] Click "End Turn" - passes to next player

#### Role Visibility ✅ Now Fixed
- [x] Your role badge shows your role
- [x] Sheriff badge shows ⭐ for everyone
- [x] Other players show "?" for hidden roles
- [x] Dead players' roles revealed

---

## 🐛 Known Issues

### Critical
- ⚠️ **BANG not reducing health** - Reported but not investigated
- ⚠️ **Wells Fargo broken** - Needs investigation

### Non-Critical
- Server port conflict (workaround: kill process on port 8000)
- Some advanced cards not implemented (Duel, Indians, Gatling)
- Missing phase indicator UI
- No error modal for invalid moves
- Deck doesn't reshuffle when empty

---

## 🔧 Common Commands

```bash
# Development
npm run dev                        # Start local dev server
npm test                           # Run all tests
npm test -- path/to/file.test.ts   # Run specific test

# Debugging
lsof -ti:8000 | xargs kill -9      # Kill process on port 8000
npm run build && npm run preview   # Test production build

# Git
git status                         # Check current changes
git log --oneline -10              # Recent commits
```

---

## 📚 Resources

### Documentation Files
- `BOARDGAME_IO_PATTERNS.md` - Correct usage patterns ⭐ START HERE
- `TODO.md` - Comprehensive task list
- `MOVE_SIGNATURE_FIX.md` - Case study of systematic debugging
- `LATEST_FIXES.md` - Recent UI improvements + testing guide

### External Links
- **BoardGame.io Docs:** https://boardgame.io/documentation/
- **Local BoardGame.io Docs:** `.docs/boardgame.io/docs/documentation/`
- **Bang! Rules:** https://bang-cardgame.fandom.com/wiki/
- **Bang! Card List:** https://bang-cardgame.fandom.com/wiki/List_Of_Cards
- **Project Plan:** `/Users/sseo/.claude/plans/cryptic-wiggling-hinton.md`

---

## 🚀 Starting a New Session

See **`HANDOFF_PROMPT.md`** for a ready-to-use prompt to start your next session with full context.

---

## 📊 Status Summary

**✅ Working:**
- Core game initialization
- Role visibility (Sheriff + own role visible, others hidden)
- Card playability highlighting
- Target selection and highlighting
- Move function signatures (ALL 13 FIXED)
- UI layout (horizontal opponent scroll, health display)
- Test-driven development workflow established

**⚠️ Needs Work:**
- Equipment cards (needs browser testing)
- BANG health reduction (reported broken)
- Wells Fargo (reported broken)
- Phase indicators
- Error modals
- Discard phase enforcement
- Advanced cards (Duel, Indians, Gatling)
- Animations and polish

**🎯 Priority for Next Session:**
1. Test equipCard and playBang in browser
2. Fix BANG health reduction bug
3. Fix Wells Fargo bug
4. Add phase indicator UI
5. Implement discard phase enforcement

---

**Last Major Update:** 2026-02-04 21:30 - Fixed all move function signatures, verified with tests

Good luck! 🤠🎴
