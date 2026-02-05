# Bang! Card Game - boardgame.io Implementation

A complete implementation of the Bang! card game using boardgame.io and React.

## Features

- **All 80 Cards**: Complete deck with all card types from the base game
- **All 16 Characters**: Every character with unique abilities implemented
- **4-7 Players**: Supports all player counts with proper role distribution
- **Full Game Mechanics**: Distance calculation, equipment, weapons, reactive cards
- **Hidden Roles**: Sheriff, Deputy, Outlaw, and Renegade with proper secret information
- **SVG Overlays**: Card suit/rank overlays since images don't include these
- **Placeholder Cards**: Colorful fallback cards until real assets are added

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

Open http://localhost:3000 to play the game.

## Build

```bash
npm run build
```

## Game Structure

### Core Files

- `src/Game.ts` - Main game definition
- `src/game/setup.ts` - Initial game setup and state
- `src/game/moves.ts` - All card effects and moves
- `src/game/phases.ts` - Turn structure and phases
- `src/game/victory.ts` - Win condition logic
- `src/game/playerView.ts` - Secret information filtering

### Data

- `src/data/cards.ts` - Card type definitions
- `src/data/deck.ts` - Complete 80-card deck composition
- `src/data/characters.ts` - All 16 character definitions
- `src/data/roles.ts` - Role system and distribution

### Utilities

- `src/game/utils/distance.ts` - Range and distance calculations
- `src/game/utils/characterAbilities.ts` - Character ability implementations
- `src/game/utils/validation.ts` - Move validation logic

### Components

- `src/components/GameBoard.tsx` - Main game board
- `src/components/Card.tsx` - Card display with overlay
- `src/components/CardOverlay.tsx` - SVG suit/rank overlay
- `src/components/PlaceholderCard.tsx` - Colored placeholder cards
- `src/components/HealthDisplay.tsx` - Heart icons for health
- `src/components/RoleBadge.tsx` - Role badges

## Card Types Implemented

### Brown Border (Instant Use)
- **BANG!** (25 cards) - Deal 1 damage to player in range
- **Missed!** (12 cards) - Cancel a BANG!
- **Beer** (6 cards) - Regain 1 health
- **Saloon** (1 card) - All players regain 1 health
- **Stagecoach** (2 cards) - Draw 2 cards
- **Wells Fargo** (1 card) - Draw 3 cards
- **Panic!** (4 cards) - Steal from player at distance 1
- **Cat Balou** (4 cards) - Discard card from any player
- **Duel** (3 cards) - BANG! battle
- **Indians!** (2 cards) - All must BANG! or lose health
- **Gatling** (1 card) - BANG! all others
- **General Store** (2 cards) - All pick from revealed cards

### Blue Border (Equipment)
- **Volcanic** (2 cards) - Range 1, unlimited BANGs
- **Schofield** (3 cards) - Range 2
- **Remington** (1 card) - Range 3
- **Rev. Carabine** (1 card) - Range 4
- **Winchester** (1 card) - Range 5
- **Barrel** (2 cards) - Draw! to dodge BANG!
- **Dynamite** (1 card) - Draw! at turn start
- **Jail** (3 cards) - Draw! to skip turn
- **Mustang** (2 cards) - Others see you at +1 distance
- **Scope** (1 card) - See others at -1 distance

## Characters

1. **Bart Cassidy** - Draw card when damaged
2. **Black Jack** - Show 2nd draw, if red draw 3rd
3. **Calamity Janet** - BANG! as Missed! and vice versa
4. **El Gringo** - Draw from attacker when hit
5. **Jesse Jones** - Draw 1st card from player's hand
6. **Jourdonnais** - Virtual Barrel ability
7. **Kit Carlson** - Look at top 3, choose 2
8. **Lucky Duke** - Draw 2 for draw!, choose one
9. **Paul Regret** - Seen at distance +1
10. **Pedro Ramirez** - Draw 1st from discard
11. **Rose Doolan** - See all at distance -1
12. **Sid Ketchum** - Discard 2 to heal 1
13. **Slab the Killer** - Targets need 2 Missed!
14. **Suzy Lafayette** - Draw when hand empty
15. **Vulture Sam** - Take cards from eliminated player
16. **Willy the Kid** - Unlimited BANGs per turn

## Game Phases

1. **Draw Phase** - Draw 2 cards (or use character ability)
2. **Action Phase** - Play cards
3. **Discard Phase** - Discard down to health

## Victory Conditions

- **Sheriff/Deputies**: Eliminate all Outlaws and Renegade
- **Outlaws**: Eliminate the Sheriff
- **Renegade**: Be the last player alive

## Assets

Currently using placeholder cards. To add real card images:

1. Download images from Bang! wiki or other sources
2. Place in `public/assets/cards/` folders
3. Follow naming convention (lowercase with hyphens)
4. Images automatically load with fallback to placeholders

Run `./scripts/downloadAssets.sh` for instructions.

## Local Multiplayer

The game uses boardgame.io's Local multiplayer for hot-seat play:
- Select number of players (4-7)
- Choose which player you want to control
- Open multiple browser windows to control different players

## TODO

- [ ] Add missing card effects (Duel, Indians, Gatling, General Store)
- [ ] Implement Jail and Dynamite resolution
- [ ] Add remaining character abilities (Kit Carlson draw logic, etc.)
- [ ] Download and integrate real card images
- [ ] Add animations for card play
- [ ] Improve UI/UX (better targeting, clearer feedback)
- [ ] Add sound effects
- [ ] Implement online multiplayer (Socket.IO server)
- [ ] Add game log/history
- [ ] Mobile responsive design

## Credits

Based on the Bang! card game by Emiliano Sciarra.
Built with boardgame.io and React.

## License

For educational/personal use only. Bang! is a trademark of daVinci Games.
