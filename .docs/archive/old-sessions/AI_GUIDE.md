# AI Player Guide

## Overview

The game now includes **intelligent AI opponents** that automatically play for all non-human players. You can play solo against AI, with friends against AI, or use AI to fill in missing players.

## How It Works

### Automatic Play
- When it's an AI player's turn, they automatically make moves after a 1-second delay
- The delay allows you to see what the AI is doing
- AI players use strategic decision-making based on their role

### AI Strategy

The AI uses a sophisticated strategy system that considers:

1. **Role-Based Tactics**
   - **Sheriff**: Targets known outlaws, protects deputies
   - **Deputies**: Support sheriff, eliminate outlaws
   - **Outlaws**: Focus on eliminating sheriff, coordinate implicitly
   - **Renegade**: Complex strategy - help eliminate outlaws early, target sheriff late game

2. **Survival Priority**
   - Heal when health is low (2 or less)
   - Equip defensive equipment (Barrel, Mustang)
   - Draw cards when hand is depleted

3. **Equipment Management**
   - Automatically equip better weapons
   - Prioritize Barrel for defense
   - Equip Mustang to increase distance from enemies

4. **Attack Strategy**
   - Target enemies based on role and situation
   - Prefer low-health targets (easier to eliminate)
   - Consider range and defensive equipment
   - Use BANG! efficiently (respects turn limits)

5. **Card Efficiency**
   - Play Stagecoach/Wells Fargo when hand is low
   - Use Panic! against adjacent enemies
   - Use Cat Balou to remove threats
   - Save important cards for critical moments

### Target Priority Scoring

AI calculates a score for each potential target based on:

- **Role alignment** (+100 to +200 for enemies)
- **Health status** (+20 per missing health point)
- **Range** (+40 if in range, -30 if out of range)
- **Defensive equipment** (+15 without Barrel, +10 without Mustang)
- **Strategic position** (varies by game stage)

## Using AI in Your Game

### Starting a Game with AI

1. Click "Start Game"
2. Select number of players (4-7)
3. Choose which player you want to control
4. Click "Start Game"

All other players are automatically AI-controlled!

### Playing Against AI

**Your Turn:**
- Draw cards (click "Draw Cards" button)
- Play cards from your hand
- Click cards to select, then click targets if needed
- Click "End Turn" when done

**AI Turns:**
- AI automatically plays after a 1-second delay
- Watch the game log to see what AI players do
- AI will draw, play cards, and attack strategically

## AI Implementation Details

### Files

- `src/ai/AIPlayer.ts` - Main AI logic and decision making
- `src/ai/BangBot.ts` - Strategy scoring and target selection
- `src/components/AIManager.tsx` - Automatic turn execution

### Decision Flow

```
1. Check if draw phase → Draw cards
2. Check health → Heal if low (≤2 health)
3. Check equipment → Equip better weapons/defense
4. Check hand size → Draw more cards if low
5. Select targets → Score all enemies
6. Attack highest priority target
7. Play support cards
8. End turn
```

### Difficulty Levels

Current AI is **Medium difficulty**:
- Makes strategic decisions
- Understands role objectives
- Prioritizes survival
- Attacks intelligently

**Future improvements could add:**
- Easy mode: Random moves, simple logic
- Hard mode: Card counting, advanced bluffing
- Expert mode: Psychological modeling, table talk analysis

## AI Strengths

✅ **Never forgets** to draw cards
✅ **Always plays** BANG! when beneficial
✅ **Consistent** strategy execution
✅ **Fast** decision making
✅ **Role-aware** targeting
✅ **Efficient** card management

## AI Weaknesses

⚠️ **No bluffing** - plays straightforwardly
⚠️ **Limited memory** - doesn't remember past turns deeply
⚠️ **Predictable** patterns in similar situations
⚠️ **No negotiation** - can't form alliances explicitly
⚠️ **Telegraphs** intentions through targets

## Tips for Playing Against AI

1. **Watch patterns**: AI prioritizes survival, then attack
2. **Exploit timing**: AI takes 1 second per turn - plan ahead
3. **Role deduction**: AI targets reveal their likely role
4. **Equipment advantage**: Get Barrel/Mustang before AI targets you
5. **Range control**: Stay out of range during enemy turns
6. **Card advantage**: AI draws when low - attack then
7. **Role strategy**: Play to your role's win condition

## Customizing AI Behavior

Want to modify AI strategy? Edit `src/ai/AIPlayer.ts`:

```typescript
// Example: Make AI more aggressive
if (player.health <= 2) {  // Change to: if (player.health <= 1)
  // Heal only at 1 health instead of 2
}

// Example: Change target priorities in getTargetPriority()
if (role === 'outlaw') {
  if (targetId === sheriffId) score += 300;  // Increased from 150
}
```

## Debugging AI

Enable debug mode to see AI decision making:

```typescript
// In src/App.tsx
const client = Client({
  game: BangGame as any,
  board: GameBoard,
  numPlayers: numPlayers,
  debug: true,  // Set to true
});
```

This shows:
- Game state
- Current player
- Available moves
- AI actions in console

## Performance

AI makes decisions in **< 100ms** typically:
- Very fast on modern hardware
- 1-second delay is artificial (for visibility)
- No noticeable lag even with 7 players

## Future Enhancements

Planned AI improvements:

- [ ] Difficulty levels (Easy/Medium/Hard)
- [ ] Character ability optimization
- [ ] Advanced role deduction
- [ ] Card counting and probability
- [ ] Multi-turn planning
- [ ] Bluffing mechanics
- [ ] Alliance formation (for Outlaws)
- [ ] Renegade end-game optimization

## Known Limitations

1. **No reactive cards**: AI doesn't play Missed! optimally yet
2. **No Barrel usage**: AI can't use Barrel during enemy turns
3. **No special cards**: Duel, Indians!, Gatling not fully implemented
4. **Simple equipment**: Doesn't optimize Jail/Dynamite

These will be addressed as the game mechanics are completed.

## Conclusion

The AI provides a **challenging and fun opponent** for solo play or filling in missing players. It understands the game's core mechanics and plays strategically, making it suitable for:

- **Learning the game**: Practice against AI
- **Solo play**: Play anytime without friends
- **Mixed games**: Combine human and AI players
- **Testing**: Verify game mechanics work correctly

Enjoy playing Bang! against your AI opponents! 🤖🤠
