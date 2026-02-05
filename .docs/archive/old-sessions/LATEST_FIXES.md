# Latest Fixes - 2026-02-04 21:20

## Issues Fixed

### 1. ✅ Highlight Not Clearing When Switching Cards
**Problem:** Clicking BANG then Stagecoach kept target highlights on players

**Fix:** Added logic to clear selection state when clicking a different card
```typescript
// Clear previous selection when clicking different card
if (selectedCard && selectedCard !== cardId) {
  setSelectedCard(null);
  setTargetingMode(false);
  setValidTargets([]);
}
```

### 2. ✅ Opponents Layout Changed to Top Horizontal Scroll
**Problem:** Opponents were in left sidebar, hard to see

**Fix:**
- Moved opponents section from left sidebar to top
- Made horizontally scrollable
- Each opponent card is `w-64` and `flex-shrink-0`
- Uses `overflow-x-auto` for scrolling

**Before:**
```
[Opponents]  [Game Table]
[Sidebar  ]  [  Center  ]
```

**After:**
```
[Opponents → → → → scrollable]
[    Game Table Center       ]
```

### 3. 🔍 Added Debug Logging for equipCard and playBang
**Problem:** Can't equipCard or playBang - need to see what's happening

**Fix:** Added extensive console.log statements:
- When card is clicked: Shows card type, requiresTarget, isEquipment
- When playing card: Shows which move function is being called
- When handling targets: Shows valid target list

**Check browser console for:**
```
[Card Click] { cardId, cardType, requiresTarget, isEquipment }
[Valid Targets] [array of player IDs]
[Calling] moves.equipCard <cardId>
[Calling] moves.playBang <cardId> <targetId>
```

## How to Test

### Refresh and Open Console
1. Refresh http://localhost:3001/
2. Open Browser Console (F12 or Cmd+Option+I)
3. Start a local game

### Test 1: Highlight Clearing
1. Draw cards
2. Click a BANG! card → Should see green highlights on valid targets
3. Click a Stagecoach card → Green highlights should CLEAR
4. Check console for: `[Card Click]` logs

### Test 2: Horizontal Opponent Scroll
1. Look at top of screen
2. Opponents should be in a horizontal row
3. If more than fit on screen, scroll left/right
4. Each opponent shows:
   - Role badge
   - Health (3/4)
   - Character name (bold)
   - Character description (italic gray)
   - Cards count
   - Weapon (if equipped)

### Test 3: Equipment Debug
1. Find an equipment card in your hand (Barrel, Mustang, Scope, weapon)
2. Click it
3. Check console - should see:
   ```
   [Card Click] { cardId: "...", cardType: "BARREL", requiresTarget: false, isEquipment: true }
   [Playing card without target] <cardId>
   [Calling] moves.equipCard <cardId>
   ```
4. If you see error or "INVALID_MOVE", note the exact message

### Test 4: BANG! Debug
1. Draw cards first
2. Click a BANG! card
3. Should see green highlights on opponents in range
4. Check console:
   ```
   [Card Click] { cardId: "...", cardType: "BANG", requiresTarget: true, isEquipment: false }
   [Valid Targets] ["1", "2"]  // or whatever players are in range
   ```
5. Click a highlighted opponent
6. Check console:
   ```
   [Calling] moves.playBang <cardId> <targetId>
   ```

## Expected Behavior

### Equipment Should:
- Click equipment card
- See `[Calling] moves.equipCard`
- Card moves from hand to "Equipment:" section
- Old equipment of same type is replaced

### BANG! Should:
- Click BANG!
- See green highlights on opponents in range
- Click highlighted opponent
- See `[Calling] moves.playBang`
- Target should be prompted to respond with Missed or take damage

## If Still Not Working

### For Equipment:
Check console for:
- `[Unknown card type]` - Card data might be wrong
- `INVALID_MOVE` - Validation failing
- No `[Calling]` message - Not reaching move call

### For BANG!:
Check console for:
- `[Valid Targets] []` - No one in range (need weapon or closer players)
- `[BANG requires target but none provided]` - Target not selected
- `INVALID_MOVE` - Validation failing (check hasDrawn, BANG limit)

## Files Changed

1. `src/components/GameBoard.tsx`
   - Fixed highlight clearing logic
   - Moved opponents to top with horizontal scroll
   - Added debug logging throughout
   - Updated layout structure

## Next Steps

Based on console logs, we can:
1. Identify exact point of failure
2. Check if validation is too strict
3. Verify card data is correct
4. Fix the root cause

**Please test and share console output!** 🎮
