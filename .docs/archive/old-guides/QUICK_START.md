# Quick Start Guide

## Get Playing in 3 Steps

### 1. Start the Server

```bash
npm run dev
```

Wait for:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:3000/
```

### 2. Open Your Browser

Go to: **http://localhost:3000**

You'll see the game setup screen:
```
Bang! Card Game
---------------
Number of Players: [4-7]
Play as Player: [0-3]
[Start Game]
```

### 3. Configure & Play

**Select Options:**
- Choose 4-7 players (4 is good for first game)
- Choose which player you are (Player 0 is fine)
- Click "Start Game"

**Play Your Turn:**
1. Click "Draw Cards" button (you must draw first)
2. Click cards in your hand to play them
3. Click opponents to target when needed
4. Click "End Turn" when done

**Watch AI Play:**
- AI automatically plays for other players
- Wait 1 second between AI moves
- Watch the top bar to see whose turn it is

## Game Flow

```
Turn → Draw (required) → Play Cards (optional) → End Turn
       ↓
    AI Turn → AI Turn → AI Turn → Your Turn Again
```

## Your First Game

**Objective:** Eliminate all enemies based on your role

**Roles:**
- 🌟 **Sheriff** (you?) - Eliminate all Outlaws and Renegade
- 🛡️ **Deputy** - Help the Sheriff
- 💀 **Outlaw** - Eliminate the Sheriff
- 🎭 **Renegade** - Be the last player alive

**Basic Cards:**
- 💥 **BANG!** - Attack someone in range
- 🛡️ **Missed!** - Block a BANG!
- 🍺 **Beer** - Heal 1 health
- 🔫 **Weapons** - Increase your attack range
- 🛢️ **Barrel** - Chance to dodge BANG!

## Tips

1. **Draw First**: You MUST draw 2 cards at the start of your turn
2. **BANG! Limit**: You can only play 1 BANG! per turn (unless you have Volcanic or are Willy the Kid)
3. **Range Matters**: You can only BANG! players in your weapon's range
4. **Watch Health**: Don't forget to play Beer when low on health
5. **Role Deduction**: Watch who attacks whom to figure out roles
6. **AI is Smart**: The AI will target you strategically!

## Controls

### Mouse
- **Click card** - Select it
- **Click opponent** - Target them (if card requires target)
- **Click "Draw Cards"** - Draw 2 cards (required first)
- **Click "End Turn"** - Pass turn to next player

### Visual Feedback
- **Yellow ring** - Selected card
- **Glowing border** - Targetable opponent
- **Red hearts** - Your health
- **Gray hearts** - Missing health

## Troubleshooting

### "Loading game..." forever
- Refresh the page (F5)
- Check browser console for errors (F12)
- Make sure you clicked "Start Game"

### Game not rendering
- Clear browser cache (Ctrl+Shift+R)
- Check that build succeeded: `npm run build`
- Restart dev server: Ctrl+C then `npm run dev`

### AI not playing
- Wait 1 second for AI delay
- Check browser console for errors
- Make sure it's actually AI's turn (check top bar)

### Cards not showing
- Images are loading (may take a moment)
- Placeholders show if images missing (this is OK!)
- Check `public/assets/cards/` has images

## Next Steps

After your first game:

1. **Try different player counts** (5-7 players is more chaotic!)
2. **Read character abilities** in `README.md`
3. **Learn all cards** in `ASSET_GUIDE.md`
4. **Understand AI strategy** in `AI_GUIDE.md`
5. **Invite friends** (open multiple browser tabs for hot-seat play)

## Common Questions

**Q: How do I win?**
A: Depends on your role (see Roles above). Check your role badge!

**Q: Can I play multiple BANGs?**
A: Only with Volcanic weapon or as Willy the Kid character.

**Q: What's the range system?**
A: Distance is calculated around the table. Weapons extend your range.

**Q: Why can't I target someone?**
A: They might be out of range, dead, or the card doesn't allow that target.

**Q: How do I use Missed!?**
A: It's automatic when you're targeted by BANG! (reactive cards not fully implemented yet).

**Q: Can I play with friends?**
A: Yes! Open multiple browser windows and control different players.

**Q: Is online multiplayer available?**
A: Not yet. Currently local/hot-seat only.

## Having Fun?

Check out the full documentation:
- `README.md` - Complete game features
- `AI_GUIDE.md` - How the AI works
- `ASSET_GUIDE.md` - Card images and assets
- `PROJECT_STATUS.md` - Implementation details

Enjoy playing Bang! 🤠🎴
