# Asset Download Guide

## Quick Start

```bash
# Run the helper script to create directories
./scripts/downloadAssets.sh
```

This creates the folder structure needed for assets. The game **works perfectly with placeholder cards**, so adding real images is optional!

## Option 1: Manual Download (Recommended)

### Step 1: Visit Image Sources

**Primary Source:**
- Bang! Wiki: https://bang-cardgame.fandom.com/wiki/List_Of_Cards
- Click on each card to see the full image

**Alternative Sources:**
- WeeWabbit Guide: https://weewabbit.com/bang-card-game-simplified-rules-strategy-guide/
- BoardGameGeek: https://boardgamegeek.com/boardgame/3955/bang/images
- Google Images: Search "Bang card game [card name]"

### Step 2: Download Images

Right-click each card image and "Save Image As..."

### Step 3: Rename Files

Use lowercase with hyphens. Examples:
- "Bang!" → `bang.png`
- "Missed!" → `missed.png`
- "Cat Balou" → `cat-balou.png`
- "Wells Fargo" → `wells-fargo.png`
- "Rev. Carabine" → `rev-carabine.png`

### Step 4: Organize by Folder

```
public/assets/cards/
├── playing/          # Brown border instant cards
│   ├── bang.png
│   ├── missed.png
│   ├── beer.png
│   ├── saloon.png
│   ├── stagecoach.png
│   ├── wells-fargo.png
│   ├── panic.png
│   ├── cat-balou.png
│   ├── duel.png
│   ├── indians.png
│   ├── gatling.png
│   └── general-store.png
│
├── weapons/          # Blue border weapons
│   ├── volcanic.png
│   ├── schofield.png
│   ├── remington.png
│   ├── rev-carabine.png
│   └── winchester.png
│
├── equipment/        # Blue border equipment
│   ├── barrel.png
│   ├── dynamite.png
│   ├── jail.png
│   ├── mustang.png
│   └── scope.png
│
└── characters/       # Character portraits
    ├── bart-cassidy.png
    ├── black-jack.png
    ├── calamity-janet.png
    ├── el-gringo.png
    ├── jesse-jones.png
    ├── jourdonnais.png
    ├── kit-carlson.png
    ├── lucky-duke.png
    ├── paul-regret.png
    ├── pedro-ramirez.png
    ├── rose-doolan.png
    ├── sid-ketchum.png
    ├── slab-the-killer.png
    ├── suzy-lafayette.png
    ├── vulture-sam.png
    └── willy-the-kid.png
```

## Complete Card List by Type

### Playing Cards (12 types)

1. **bang.png** - BANG! (25 copies in deck)
2. **missed.png** - Missed! (12 copies)
3. **beer.png** - Beer (6 copies)
4. **saloon.png** - Saloon (1 copy)
5. **stagecoach.png** - Stagecoach (2 copies)
6. **wells-fargo.png** - Wells Fargo (1 copy)
7. **panic.png** - Panic! (4 copies)
8. **cat-balou.png** - Cat Balou (4 copies)
9. **duel.png** - Duel (3 copies)
10. **indians.png** - Indians! (2 copies)
11. **gatling.png** - Gatling (1 copy)
12. **general-store.png** - General Store (2 copies)

### Weapons (5 types)

1. **volcanic.png** - Volcanic (2 copies)
2. **schofield.png** - Schofield (3 copies)
3. **remington.png** - Remington (1 copy)
4. **rev-carabine.png** - Rev. Carabine (1 copy)
5. **winchester.png** - Winchester (1 copy)

### Equipment (5 types)

1. **barrel.png** - Barrel (2 copies)
2. **dynamite.png** - Dynamite (1 copy)
3. **jail.png** - Jail (3 copies)
4. **mustang.png** - Mustang (2 copies)
5. **scope.png** - Scope (1 copy)

### Characters (16 unique)

1. **bart-cassidy.png**
2. **black-jack.png**
3. **calamity-janet.png**
4. **el-gringo.png**
5. **jesse-jones.png**
6. **jourdonnais.png**
7. **kit-carlson.png**
8. **lucky-duke.png**
9. **paul-regret.png**
10. **pedro-ramirez.png**
11. **rose-doolan.png**
12. **sid-ketchum.png**
13. **slab-the-killer.png**
14. **suzy-lafayette.png**
15. **vulture-sam.png**
16. **willy-the-kid.png**

**Total: 38 unique images needed** (22 cards + 16 characters)

## Option 2: Semi-Automated Download

If you find a source with consistent URLs, you can use wget or curl:

```bash
# Example (URLs need to be updated with real sources)
cd public/assets/cards/playing

# Download a card
curl -O "https://example.com/images/bang.png"

# Or use wget
wget "https://example.com/images/bang.png"
```

## Option 3: Use Placeholders (Current Setup)

The game already works beautifully with placeholder cards! Each card shows:
- Card type name
- Emoji icon (💥 for BANG!, 🛡️ for Missed!, etc.)
- Color-coded background
- Range information (for weapons)

**No images needed to play!**

## How Images Are Loaded

The game uses an automatic fallback system:

```typescript
// From src/components/CardImage.tsx
1. Try to load image from public/assets/cards/
2. If image missing or fails → show placeholder card
3. Placeholder cards are styled with colors and emojis
```

This means:
- ✅ Game works immediately with no images
- ✅ Add images gradually (one at a time)
- ✅ Missing images don't break anything

## Testing Your Images

After downloading images:

1. Place them in the correct folders
2. Restart dev server: `npm run dev`
3. Images should appear automatically
4. If not, check:
   - File names match exactly (lowercase, hyphens)
   - Files are PNG or JPG format
   - Files are in correct folder
   - Browser cache (hard refresh: Cmd+Shift+R)

## Image Specifications

### Recommended:
- **Format**: PNG (for transparency) or JPG
- **Size**: 300-600px width
- **Aspect Ratio**: 2:3 (standard playing card)
- **File Size**: < 500KB each

### The game will resize automatically!

## Quick Start (5 Minutes)

Want to test with just a few images?

1. Download these 3 essential cards:
   - `bang.png`
   - `missed.png`
   - `beer.png`

2. Download 1 character:
   - `bart-cassidy.png`

3. Place in folders:
   ```
   public/assets/cards/playing/bang.png
   public/assets/cards/playing/missed.png
   public/assets/cards/playing/beer.png
   public/assets/cards/characters/bart-cassidy.png
   ```

4. Refresh browser - these cards now show real images!
5. All other cards continue using placeholders

## Troubleshooting

### Image not showing?

1. Check browser console (F12) for errors
2. Verify file path: `public/assets/cards/[type]/[name].png`
3. Check file name matches mapping in `src/utils/assetMapping.ts`
4. Try hard refresh (Cmd+Shift+R or Ctrl+Shift+R)

### Wrong image showing?

1. Clear browser cache
2. Check file name is exact match
3. Restart dev server

### Still using placeholders?

That's fine! The game is fully playable with placeholders. They're actually quite nice with emojis and colors!

## Legal Note

Bang! is a copyrighted game by daVinci Games. Only download images for personal, non-commercial use. If distributing this project, ensure you have proper rights or use only placeholders.

## Summary

**You don't need to download any images right now!**

The game works perfectly with the beautiful placeholder cards. Download real images only if you want to, and you can do it gradually over time.

```bash
# Start playing immediately
npm run dev

# Add images later when you have time
# The game will automatically use them
```
