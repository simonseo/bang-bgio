# Handoff Prompt for New Session

Copy and paste this prompt when starting a new Claude Code session to continue work on the Bang! card game project.

---

## 📋 Full Context Prompt

```
I'm continuing work on the Bang! card game implementation using boardgame.io, React, and TypeScript.

### Project Context

Working directory: /Users/sseo/Documents/bang-boardgame-io

This is a web-based Bang! card game with:
- BoardGame.io v0.50.0 framework
- React + TypeScript + Vite
- 4-7 player support
- All 80 cards and 16 characters from base game
- Local and network multiplayer

### Recent Work (2026-02-04)

**Critical fixes completed:**
1. ✅ Fixed all move function signatures (equipCard, playBang, etc.) - they now use correct `({ G, ctx }, ...args)` pattern
2. ✅ Fixed role visibility - Sheriff + own role visible, others hidden
3. ✅ UI improvements - horizontal opponent scroll, health display (3/4), always-visible character descriptions

**Verification status:**
- ✅ Unit tests passing (2/2)
- ✅ Integration tests passing (2/2)
- ⚠️ Need to test equipCard and playBang in actual browser

### Key Documentation

**Read these first:**
1. `TODO.md` - Comprehensive list of remaining work (high/medium/low priority)
2. `BOARDGAME_IO_PATTERNS.md` - Correct BoardGame.io usage patterns (essential reference!)
3. `MOVE_SIGNATURE_FIX.md` - Case study of recent systematic debugging
4. `HANDOFF.md` - Full project documentation

### Critical Patterns

**Move functions must use object destructuring:**
```typescript
// ✅ CORRECT
export function playBang({ G, ctx }: { G: BangGameState; ctx: GameCtx }, cardId: string, targetId: string)

// ❌ WRONG
export function playBang(G: BangGameState, ctx: GameCtx, cardId: string, targetId: string)
```

**PlayerView must use object destructuring:**
```typescript
// ✅ CORRECT
export function playerView({ G, ctx, playerID }: { G: BangGameState; ctx: any; playerID: string | null })
```

### Known Issues to Fix

**High Priority:**
1. BANG not reducing health points (reported broken, needs investigation)
2. Wells Fargo broken (needs investigation)
3. Prevent playing cards before drawing (hasDrawn validation not enforced)
4. Add phase indicator UI (Draw Phase vs Action Phase)
5. Implement discard phase (force discard when hand > health)

**Medium Priority:**
- Deck reshuffling when empty
- Error modal for invalid moves
- Equipment visibility for other players
- Card explanation accessibility
- Test all card types and character abilities

### Development Approach

**Follow test-driven development:**
1. When user reports a bug, create a failing test first
2. Reproduce the issue in the test
3. Fix the issue
4. Verify the test passes

**Follow systematic debugging (see superpowers:systematic-debugging skill):**
1. Root cause investigation
2. Pattern analysis
3. Hypothesis testing
4. Implementation with verification

### Quick Start Commands

```bash
npm run dev              # Start dev server at http://localhost:3001
npm test                 # Run all tests
npm test -- <file>       # Run specific test file
```

### What I Need

[Describe what you want to work on, e.g.:]
- "Fix the BANG not reducing health bug"
- "Add phase indicator UI"
- "Test equipCard and playBang in browser"
- "Implement discard phase"

Please read the TODO.md and relevant documentation before starting work.
```

---

## 🎯 Quick Start for Common Tasks

### Task 1: Verify Recent Fixes Work in Browser

```
Please help me verify that equipCard and playBang work in the browser after the recent move signature fixes.

Context: All 13 move functions were fixed to use correct ({ G, ctx }, ...args) signature. Unit tests pass, but need browser verification.

Test procedure:
1. Start dev server: npm run dev
2. Open http://localhost:3001/
3. Start local game
4. Draw cards
5. Click equipment card - should equip
6. Click BANG card - should show green highlights on valid targets
7. Click target - should attack and prompt for response

Check browser console for:
- [Calling] moves.equipCard <cardId>
- [Calling] moves.playBang <cardId> <targetId>

If errors appear, read MOVE_SIGNATURE_FIX.md and TODO.md for context.
```

### Task 2: Fix BANG Health Bug

```
User reported: "BANG does not reduce health points"

Use test-driven approach:
1. Read TODO.md line 117 for context
2. Create failing test in src/test/unit/moves.test.ts
3. Test: Player plays BANG, target doesn't play Missed, health should decrease
4. Reproduce the bug
5. Find root cause (check takeDamage function, pendingAction handling)
6. Fix it
7. Verify test passes

Reference: MOVE_SIGNATURE_FIX.md for systematic debugging example.
```

### Task 3: Fix Wells Fargo Bug

```
User reported: "Wells Fargo is broken. Check the rules."

Wells Fargo rule: Draw 3 cards

Investigation needed:
1. Check src/game/moves.ts - playWellsFargo function
2. Check src/data/cards.ts - Wells Fargo card definition
3. Create test to verify draws 3 cards
4. Identify what's broken
5. Fix and verify

Current implementation: Line 307-318 in moves.ts
```

### Task 4: Add Phase Indicator UI

```
Add UI element showing current turn phase.

Requirements (from TODO.md line 26):
- Show "Draw Phase" when hasDrawn = false
- Show "Action Phase" when hasDrawn = true
- Show "Discard Phase" when hand.length > health at end of turn

Location: Add to src/components/GameBoard.tsx
Style: Use existing Tailwind classes

Reference player.hasDrawn from G.players[playerID]
```

### Task 5: Implement Discard Phase

```
Implement forced discard when hand size exceeds health at end of turn.

Requirements (from TODO.md line 19):
- At end of turn, if hand.length > health, force discard
- Player selects cards to discard
- Use discardCards move (already exists in moves.ts)
- Update turn phases to include discard stage

Files to modify:
- src/game/phases.ts - Add discard stage
- src/components/GameBoard.tsx - Add discard UI
- Test in browser

Reference: BOARDGAME_IO_PATTERNS.md for phase/stage syntax
```

---

## 🔧 Alternative: Minimal Prompt

If you know exactly what you're doing:

```
Continuing Bang! (boardgame.io + React + TypeScript)
Working dir: /Users/sseo/Documents/bang-boardgame-io

Recent fixes (2026-02-04): All move signatures fixed, role visibility fixed, UI improved

Read: TODO.md, BOARDGAME_IO_PATTERNS.md

Task: [describe specific work]
```

---

## 📚 Important Files Reference

| File | Purpose |
|------|---------|
| `TODO.md` | Comprehensive task list - START HERE |
| `HANDOFF.md` | Full project documentation |
| `BOARDGAME_IO_PATTERNS.md` | Correct usage patterns - essential! |
| `MOVE_SIGNATURE_FIX.md` | Case study of systematic debugging |
| `LATEST_FIXES.md` | Recent UI improvements + testing |
| `src/game/moves.ts` | All card moves (recently fixed) |
| `src/Game.ts` | Main game definition |
| `src/components/GameBoard.tsx` | Main UI component |

---

## ⚠️ Critical Reminders

**Before modifying game logic:**
- Read `BOARDGAME_IO_PATTERNS.md` first
- Move functions use `({ G, ctx }, ...args)` signature
- PlayerView uses `({ G, ctx, playerID })` signature

**When user reports bug:**
1. Use superpowers:systematic-debugging skill
2. Create failing test first (test-driven development)
3. Root cause investigation before proposing fixes
4. Verify with tests before claiming success

**Before claiming something works:**
- Run tests: `npm test`
- Check browser console for errors
- Follow verification checklist
- Don't say "should work" - verify it works

---

## 🎮 Common Test Commands

```bash
# Start development
npm run dev

# Run all tests
npm test

# Run specific test file
npm test -- src/test/unit/moves.test.ts

# Run tests in watch mode
npm test -- --watch

# Kill port 8000 if needed
lsof -ti:8000 | xargs kill -9
```

---

## 🚀 Getting Started Checklist

When starting a new session:
- [ ] Read TODO.md to understand current priorities
- [ ] Check HANDOFF.md for project status
- [ ] Reference BOARDGAME_IO_PATTERNS.md before touching game logic
- [ ] Run tests to verify current state: `npm test`
- [ ] Start dev server: `npm run dev`
- [ ] Choose a task from TODO.md (high priority first)
- [ ] Follow test-driven approach: test → fix → verify

---

**Last Updated:** 2026-02-04 21:30

Good luck! 🤠🎴
