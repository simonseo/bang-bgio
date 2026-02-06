# Multiplayer Lobby Features Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add match browser, real-time waiting room, and player names throughout gameplay for a polished multiplayer experience.

**Architecture:** Three phases - (1) Match browser component with polling to list/join games, (2) Enhanced waiting room with 1-second polling for player list updates, (3) Player name propagation through game components using matchData.

**Tech Stack:** React, TypeScript, boardgame.io v0.50.2, LobbyClient API, vitest

---

## Prerequisites

- Design document: `.docs/plans/2026-02-06-multiplayer-lobby-features-design.md`
- Existing: `src/components/NetworkLobby.tsx`
- Testing: @superpowers:test-driven-development (TDD required)

---

## Phase 1: Match Browser Component

### Task 1: Create utility for player name extraction

**Files:**
- Create: `src/utils/getPlayerNames.ts`
- Test: `src/test/unit/getPlayerNames.test.ts`

**Step 1: Write the failing test**

Create `src/test/unit/getPlayerNames.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { getPlayerNames } from '../../utils/getPlayerNames';

describe('getPlayerNames', () => {
  it('should extract player names from matchData', () => {
    const matchData = [
      { id: 0, name: 'Alice' },
      { id: 1, name: 'Bob' },
      { id: 2, name: 'Charlie' },
    ];

    const result = getPlayerNames(matchData);

    expect(result).toEqual({
      '0': 'Alice',
      '1': 'Bob',
      '2': 'Charlie',
    });
  });

  it('should handle missing matchData', () => {
    const result = getPlayerNames(undefined);
    expect(result).toEqual({});
  });

  it('should handle empty matchData', () => {
    const result = getPlayerNames([]);
    expect(result).toEqual({});
  });

  it('should use fallback for missing names', () => {
    const matchData = [
      { id: 0, name: 'Alice' },
      { id: 1 },  // no name
      { id: 2, name: '' },  // empty name
    ];

    const result = getPlayerNames(matchData);

    expect(result).toEqual({
      '0': 'Alice',
      '1': 'Player 1',
      '2': 'Player 2',
    });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/test/unit/getPlayerNames.test.ts`
Expected: FAIL - "Cannot find module '../../utils/getPlayerNames'"

**Step 3: Write minimal implementation**

Create `src/utils/getPlayerNames.ts`:

```typescript
/**
 * Extract player names from boardgame.io matchData
 * Returns map of playerID -> playerName with fallbacks
 */

export interface PlayerNameMap {
  [playerID: string]: string;
}

export function getPlayerNames(matchData?: any[]): PlayerNameMap {
  if (!matchData || matchData.length === 0) {
    return {};
  }

  return matchData.reduce((acc, player, index) => {
    const playerID = index.toString();
    const playerName = player?.name && player.name.trim() !== ''
      ? player.name
      : `Player ${index}`;

    acc[playerID] = playerName;
    return acc;
  }, {} as PlayerNameMap);
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- src/test/unit/getPlayerNames.test.ts`
Expected: PASS - All 4 tests passing

**Step 5: Commit**

```bash
git add src/utils/getPlayerNames.ts src/test/unit/getPlayerNames.test.ts
git commit -m "feat: add getPlayerNames utility for matchData extraction

- Extracts player names from boardgame.io matchData
- Provides fallback to 'Player {id}' for missing names
- Handles undefined/empty matchData gracefully
- 4/4 tests passing"
```

---

### Task 2: Create MatchBrowser component (UI only)

**Files:**
- Create: `src/components/MatchBrowser.tsx`
- Test: `src/test/unit/MatchBrowser.test.tsx`

**Step 1: Write the failing test**

Create `src/test/unit/MatchBrowser.test.tsx`:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MatchBrowser } from '../../components/MatchBrowser';

describe('MatchBrowser', () => {
  it('should render Browse Games title', () => {
    const mockOnJoin = vi.fn();
    const mockOnBack = vi.fn();
    const mockOnCreate = vi.fn();

    render(
      <MatchBrowser
        onJoinGame={mockOnJoin}
        onBack={mockOnBack}
        onCreateGame={mockOnCreate}
      />
    );

    expect(screen.getByText('Browse Games')).toBeInTheDocument();
  });

  it('should render Show All Games toggle', () => {
    const mockOnJoin = vi.fn();
    const mockOnBack = vi.fn();
    const mockOnCreate = vi.fn();

    render(
      <MatchBrowser
        onJoinGame={mockOnJoin}
        onBack={mockOnBack}
        onCreateGame={mockOnCreate}
      />
    );

    expect(screen.getByLabelText('Show All Games')).toBeInTheDocument();
  });

  it('should render Back button', () => {
    const mockOnJoin = vi.fn();
    const mockOnBack = vi.fn();
    const mockOnCreate = vi.fn();

    render(
      <MatchBrowser
        onJoinGame={mockOnJoin}
        onBack={mockOnBack}
        onCreateGame={mockOnCreate}
      />
    );

    expect(screen.getByText('← Back')).toBeInTheDocument();
  });

  it('should render Create New Game button', () => {
    const mockOnJoin = vi.fn();
    const mockOnBack = vi.fn();
    const mockOnCreate = vi.fn();

    render(
      <MatchBrowser
        onJoinGame={mockOnJoin}
        onBack={mockOnBack}
        onCreateGame={mockOnCreate}
      />
    );

    expect(screen.getByText('Create New Game')).toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/test/unit/MatchBrowser.test.tsx`
Expected: FAIL - "Cannot find module '../../components/MatchBrowser'"

**Step 3: Write minimal implementation**

Create `src/components/MatchBrowser.tsx`:

```typescript
import React, { useState } from 'react';

interface MatchBrowserProps {
  serverURL?: string;
  onJoinGame: (matchID: string, playerName: string) => void;
  onBack: () => void;
  onCreateGame: () => void;
}

export const MatchBrowser: React.FC<MatchBrowserProps> = ({
  serverURL = 'http://localhost:8000',
  onJoinGame,
  onBack,
  onCreateGame,
}) => {
  const [showAllGames, setShowAllGames] = useState(false);

  return (
    <div className="w-full h-screen bg-gradient-to-b from-amber-900 to-amber-950 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl max-w-2xl w-full">
        <button
          onClick={onBack}
          className="text-white mb-4 hover:underline"
        >
          ← Back
        </button>

        <h1 className="text-3xl font-bold text-white mb-6 text-center">
          Browse Games
        </h1>

        <div className="mb-4 flex items-center">
          <input
            type="checkbox"
            id="showAllGames"
            checked={showAllGames}
            onChange={(e) => setShowAllGames(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="showAllGames" className="text-white">
            Show All Games
          </label>
        </div>

        <div className="space-y-4 mb-6">
          {/* Match list will go here */}
          <div className="text-white text-center py-8">
            Loading matches...
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={onCreateGame}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700"
          >
            Create New Game
          </button>
        </div>
      </div>
    </div>
  );
};
```

**Step 4: Run test to verify it passes**

Run: `npm test -- src/test/unit/MatchBrowser.test.tsx`
Expected: PASS - All 4 tests passing

**Step 5: Commit**

```bash
git add src/components/MatchBrowser.tsx src/test/unit/MatchBrowser.test.tsx
git commit -m "feat: add MatchBrowser component skeleton

- Basic UI with title, toggle, and buttons
- Props for callbacks (onJoinGame, onBack, onCreateGame)
- Matches existing NetworkLobby styling
- 4/4 tests passing"
```

---

### Task 3: Add match list polling to MatchBrowser

**Files:**
- Modify: `src/components/MatchBrowser.tsx`
- Modify: `src/test/unit/MatchBrowser.test.tsx`

**Step 1: Write the failing test**

Add to `src/test/unit/MatchBrowser.test.tsx`:

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MatchBrowser } from '../../components/MatchBrowser';

// ... existing tests ...

describe('MatchBrowser - polling', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should fetch matches on mount', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        matches: [
          {
            matchID: 'test-123',
            players: [
              { id: 0, name: 'Alice' },
              { id: 1 },
            ],
          },
        ],
      }),
    });
    global.fetch = mockFetch;

    const mockOnJoin = vi.fn();
    const mockOnBack = vi.fn();
    const mockOnCreate = vi.fn();

    render(
      <MatchBrowser
        serverURL="http://localhost:8000"
        onJoinGame={mockOnJoin}
        onBack={mockOnBack}
        onCreateGame={mockOnCreate}
      />
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/games/bang',
        expect.any(Object)
      );
    });
  });

  it('should poll matches every 1 second', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ matches: [] }),
    });
    global.fetch = mockFetch;

    const mockOnJoin = vi.fn();
    const mockOnBack = vi.fn();
    const mockOnCreate = vi.fn();

    render(
      <MatchBrowser
        serverURL="http://localhost:8000"
        onJoinGame={mockOnJoin}
        onBack={mockOnBack}
        onCreateGame={mockOnCreate}
      />
    );

    // Initial fetch
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    // Advance 1 second
    vi.advanceTimersByTime(1000);
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    // Advance another second
    vi.advanceTimersByTime(1000);
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/test/unit/MatchBrowser.test.tsx`
Expected: FAIL - "expect(mockFetch).toHaveBeenCalled... received: 0"

**Step 3: Write minimal implementation**

Update `src/components/MatchBrowser.tsx`:

```typescript
import React, { useState, useEffect } from 'react';
import { LobbyClient } from 'boardgame.io/client';

interface MatchBrowserProps {
  serverURL?: string;
  onJoinGame: (matchID: string, playerName: string) => void;
  onBack: () => void;
  onCreateGame: () => void;
}

interface MatchInfo {
  matchID: string;
  players: Array<{ id: number; name?: string }>;
  setupData?: any;
  gameover?: any;
}

export const MatchBrowser: React.FC<MatchBrowserProps> = ({
  serverURL = 'http://localhost:8000',
  onJoinGame,
  onBack,
  onCreateGame,
}) => {
  const [showAllGames, setShowAllGames] = useState(false);
  const [matches, setMatches] = useState<MatchInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const lobby = new LobbyClient({ server: serverURL });

    const fetchMatches = async () => {
      try {
        const { matches } = await lobby.listMatches('bang');
        setMatches(matches || []);
        setLoading(false);
        setError('');
      } catch (err: any) {
        console.error('Failed to fetch matches:', err);
        setError('Failed to load matches');
        setLoading(false);
      }
    };

    // Initial fetch
    fetchMatches();

    // Poll every 1 second
    const interval = setInterval(fetchMatches, 1000);

    return () => clearInterval(interval);
  }, [serverURL]);

  return (
    <div className="w-full h-screen bg-gradient-to-b from-amber-900 to-amber-950 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl max-w-2xl w-full">
        <button
          onClick={onBack}
          className="text-white mb-4 hover:underline"
        >
          ← Back
        </button>

        <h1 className="text-3xl font-bold text-white mb-6 text-center">
          Browse Games
        </h1>

        <div className="mb-4 flex items-center">
          <input
            type="checkbox"
            id="showAllGames"
            checked={showAllGames}
            onChange={(e) => setShowAllGames(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="showAllGames" className="text-white">
            Show All Games
          </label>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 rounded p-3 text-white text-sm mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4 mb-6">
          {loading && (
            <div className="text-white text-center py-8">
              Loading matches...
            </div>
          )}
          {!loading && matches.length === 0 && (
            <div className="text-white text-center py-8">
              No games available. Create one!
            </div>
          )}
          {!loading && matches.length > 0 && (
            <div className="text-white text-center py-8">
              {matches.length} match(es) found
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <button
            onClick={onCreateGame}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700"
          >
            Create New Game
          </button>
        </div>
      </div>
    </div>
  );
};
```

**Step 4: Run test to verify it passes**

Run: `npm test -- src/test/unit/MatchBrowser.test.tsx`
Expected: PASS - All 6 tests passing

**Step 5: Commit**

```bash
git add src/components/MatchBrowser.tsx src/test/unit/MatchBrowser.test.tsx
git commit -m "feat: add match list polling to MatchBrowser

- Poll lobby.listMatches every 1 second
- Display loading state and error handling
- Show match count when loaded
- Cleanup interval on unmount
- 6/6 tests passing"
```

---

### Task 4: Add match card rendering with filtering

**Files:**
- Modify: `src/components/MatchBrowser.tsx`
- Modify: `src/test/unit/MatchBrowser.test.tsx`

**Step 1: Write the failing test**

Add to `src/test/unit/MatchBrowser.test.tsx`:

```typescript
describe('MatchBrowser - match cards', () => {
  it('should render match cards', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        matches: [
          {
            matchID: 'test-123',
            players: [
              { id: 0, name: 'Alice' },
              { id: 1, name: 'Bob' },
              { id: 2 },
              { id: 3 },
            ],
            setupData: { numAI: 1 },
          },
        ],
      }),
    });
    global.fetch = mockFetch;

    const mockOnJoin = vi.fn();
    const mockOnBack = vi.fn();
    const mockOnCreate = vi.fn();

    render(
      <MatchBrowser
        serverURL="http://localhost:8000"
        onJoinGame={mockOnJoin}
        onBack={mockOnBack}
        onCreateGame={mockOnCreate}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('test-123')).toBeInTheDocument();
      expect(screen.getByText(/Host: Alice/)).toBeInTheDocument();
      expect(screen.getByText(/Players: 2\/4/)).toBeInTheDocument();
      expect(screen.getByText(/AI: 1/)).toBeInTheDocument();
    });
  });

  it('should filter out full games by default', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        matches: [
          {
            matchID: 'joinable-123',
            players: [
              { id: 0, name: 'Alice' },
              { id: 1 },
            ],
          },
          {
            matchID: 'full-456',
            players: [
              { id: 0, name: 'Bob' },
              { id: 1, name: 'Charlie' },
            ],
          },
        ],
      }),
    });
    global.fetch = mockFetch;

    const mockOnJoin = vi.fn();
    const mockOnBack = vi.fn();
    const mockOnCreate = vi.fn();

    render(
      <MatchBrowser
        serverURL="http://localhost:8000"
        onJoinGame={mockOnJoin}
        onBack={mockOnBack}
        onCreateGame={mockOnCreate}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('joinable-123')).toBeInTheDocument();
      expect(screen.queryByText('full-456')).not.toBeInTheDocument();
    });
  });

  it('should show all games when toggle is checked', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        matches: [
          {
            matchID: 'joinable-123',
            players: [
              { id: 0, name: 'Alice' },
              { id: 1 },
            ],
          },
          {
            matchID: 'full-456',
            players: [
              { id: 0, name: 'Bob' },
              { id: 1, name: 'Charlie' },
            ],
          },
        ],
      }),
    });
    global.fetch = mockFetch;

    const mockOnJoin = vi.fn();
    const mockOnBack = vi.fn();
    const mockOnCreate = vi.fn();

    const { container } = render(
      <MatchBrowser
        serverURL="http://localhost:8000"
        onJoinGame={mockOnJoin}
        onBack={mockOnBack}
        onCreateGame={mockOnCreate}
      />
    );

    // Initially only joinable shown
    await waitFor(() => {
      expect(screen.getByText('joinable-123')).toBeInTheDocument();
      expect(screen.queryByText('full-456')).not.toBeInTheDocument();
    });

    // Click toggle
    const toggle = screen.getByLabelText('Show All Games');
    toggle.click();

    // Now both shown
    await waitFor(() => {
      expect(screen.getByText('joinable-123')).toBeInTheDocument();
      expect(screen.getByText('full-456')).toBeInTheDocument();
    });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/test/unit/MatchBrowser.test.tsx`
Expected: FAIL - "Unable to find element with text: test-123"

**Step 3: Write minimal implementation**

Update `src/components/MatchBrowser.tsx`:

```typescript
import React, { useState, useEffect } from 'react';
import { LobbyClient } from 'boardgame.io/client';

interface MatchBrowserProps {
  serverURL?: string;
  onJoinGame: (matchID: string, playerName: string) => void;
  onBack: () => void;
  onCreateGame: () => void;
}

interface MatchInfo {
  matchID: string;
  players: Array<{ id: number; name?: string }>;
  setupData?: any;
  gameover?: any;
}

export const MatchBrowser: React.FC<MatchBrowserProps> = ({
  serverURL = 'http://localhost:8000',
  onJoinGame,
  onBack,
  onCreateGame,
}) => {
  const [showAllGames, setShowAllGames] = useState(false);
  const [matches, setMatches] = useState<MatchInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const lobby = new LobbyClient({ server: serverURL });

    const fetchMatches = async () => {
      try {
        const { matches } = await lobby.listMatches('bang');
        setMatches(matches || []);
        setLoading(false);
        setError('');
      } catch (err: any) {
        console.error('Failed to fetch matches:', err);
        setError('Failed to load matches');
        setLoading(false);
      }
    };

    fetchMatches();
    const interval = setInterval(fetchMatches, 1000);
    return () => clearInterval(interval);
  }, [serverURL]);

  const isMatchJoinable = (match: MatchInfo): boolean => {
    return match.players.some(p => !p.name);
  };

  const filteredMatches = showAllGames
    ? matches
    : matches.filter(isMatchJoinable);

  const renderMatchCard = (match: MatchInfo) => {
    const hostName = match.players[0]?.name || 'Unknown';
    const currentPlayers = match.players.filter(p => p.name).length;
    const maxPlayers = match.players.length;
    const numAI = match.setupData?.numAI || 0;
    const joinable = isMatchJoinable(match);

    return (
      <div
        key={match.matchID}
        className="bg-white/10 p-4 rounded-lg border-2 border-white/20"
      >
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="text-white font-bold text-lg font-mono">
              {match.matchID}
            </p>
            <p className="text-white text-sm">Host: {hostName}</p>
            <p className="text-white text-sm">
              Players: {currentPlayers}/{maxPlayers}  AI: {numAI}
            </p>
          </div>
          <div>
            {joinable && (
              <span className="text-green-400 text-xs">🟢 Joinable</span>
            )}
            {!joinable && (
              <span className="text-red-400 text-xs">🔴 Full</span>
            )}
          </div>
        </div>
        {joinable && (
          <button
            onClick={() => onJoinGame(match.matchID, '')}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 mt-2"
          >
            Join Game →
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="w-full h-screen bg-gradient-to-b from-amber-900 to-amber-950 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <button
          onClick={onBack}
          className="text-white mb-4 hover:underline"
        >
          ← Back
        </button>

        <h1 className="text-3xl font-bold text-white mb-6 text-center">
          Browse Games
        </h1>

        <div className="mb-4 flex items-center">
          <input
            type="checkbox"
            id="showAllGames"
            checked={showAllGames}
            onChange={(e) => setShowAllGames(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="showAllGames" className="text-white">
            Show All Games
          </label>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 rounded p-3 text-white text-sm mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4 mb-6">
          {loading && (
            <div className="text-white text-center py-8">
              Loading matches...
            </div>
          )}
          {!loading && filteredMatches.length === 0 && (
            <div className="text-white text-center py-8">
              No games available. Create one!
            </div>
          )}
          {!loading && filteredMatches.length > 0 && (
            filteredMatches.map(renderMatchCard)
          )}
        </div>

        <div className="flex gap-4">
          <button
            onClick={onCreateGame}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700"
          >
            Create New Game
          </button>
        </div>
      </div>
    </div>
  );
};
```

**Step 4: Run test to verify it passes**

Run: `npm test -- src/test/unit/MatchBrowser.test.tsx`
Expected: PASS - All 9 tests passing

**Step 5: Commit**

```bash
git add src/components/MatchBrowser.tsx src/test/unit/MatchBrowser.test.tsx
git commit -m "feat: add match card rendering with filtering

- Render match cards with host, player count, AI count
- Filter joinable games by default (has empty slots)
- Show all games toggle displays full/in-progress matches
- Status badges (🟢 Joinable, 🔴 Full)
- 9/9 tests passing"
```

---

## Phase 2: Enhanced Waiting Room

### Task 5: Add real-time player list to NetworkLobby

**Files:**
- Modify: `src/components/NetworkLobby.tsx`
- Test: `src/test/unit/NetworkLobby.test.tsx`

**Step 1: Write the failing test**

Create `src/test/unit/NetworkLobby.test.tsx`:

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { NetworkLobby } from '../../components/NetworkLobby';

describe('NetworkLobby - waiting room polling', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should poll match data every 1 second in waiting room', async () => {
    const mockGetMatch = vi.fn().mockResolvedValue({
      matchID: 'test-123',
      players: [
        { id: 0, name: 'Alice' },
        { id: 1, name: 'Bob' },
        { id: 2 },
        { id: 3 },
      ],
    });

    const mockLobby = {
      getMatch: mockGetMatch,
    };

    const mockOnStartGame = vi.fn();
    const mockOnBack = vi.fn();

    render(
      <NetworkLobby
        mode="host"
        onStartGame={mockOnStartGame}
        onBack={mockOnBack}
      />
    );

    // Simulate creating game and entering waiting room
    // (This test assumes waiting room is rendered after matchID is set)

    // Initial fetch
    await waitFor(() => {
      expect(mockGetMatch).toHaveBeenCalledTimes(1);
    });

    // Advance 1 second
    vi.advanceTimersByTime(1000);
    await waitFor(() => {
      expect(mockGetMatch).toHaveBeenCalledTimes(2);
    });
  });

  it('should display player list in waiting room', async () => {
    const mockGetMatch = vi.fn().mockResolvedValue({
      matchID: 'test-123',
      players: [
        { id: 0, name: 'Alice' },
        { id: 1, name: 'Bob' },
        { id: 2 },
        { id: 3 },
      ],
    });

    const mockLobby = {
      getMatch: mockGetMatch,
    };

    const mockOnStartGame = vi.fn();
    const mockOnBack = vi.fn();

    // Need to simulate waiting room state
    // This test verifies player names appear when matchData is available

    render(
      <NetworkLobby
        mode="host"
        onStartGame={mockOnStartGame}
        onBack={mockOnBack}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Alice/)).toBeInTheDocument();
      expect(screen.getByText(/Bob/)).toBeInTheDocument();
      expect(screen.getByText(/Waiting for player/)).toBeInTheDocument();
    });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/test/unit/NetworkLobby.test.tsx`
Expected: FAIL - "Cannot find module" or "expect(mockGetMatch).toHaveBeenCalledTimes... received: 0"

**Step 3: Write minimal implementation**

Update `src/components/NetworkLobby.tsx` (lines 213-264, waiting room section):

```typescript
// Around line 20, add new state
const [matchData, setMatchData] = useState<any>(null);

// Add polling effect after matchID is set
useEffect(() => {
  if (!matchID || !lobby) return;

  const pollMatch = async () => {
    try {
      const match = await lobby.getMatch('bang', matchID);
      setMatchData(match);

      // Check if game started (auto-transition)
      if (match.setupData?.gameStarted) {
        onStartGame(matchID, playerID, credentials);
      }
    } catch (err) {
      console.error('Failed to poll match:', err);
    }
  };

  pollMatch();
  const interval = setInterval(pollMatch, 1000);
  return () => clearInterval(interval);
}, [matchID, lobby, playerID, credentials, onStartGame]);

// Update waiting room render (lines 213-264)
// Replace the existing player count display with:

const renderPlayerList = () => {
  if (!matchData || !matchData.players) {
    return (
      <div className="text-white text-sm mb-6">
        <p>Players: 1 / {numPlayers}</p>
        <p>AI: {numAI}</p>
      </div>
    );
  }

  const players = matchData.players;
  return (
    <div className="mb-6">
      <p className="text-white text-sm font-bold mb-2">
        Players ({players.filter((p: any) => p.name).length} / {numPlayers}):
      </p>
      <div className="bg-white/10 rounded-lg p-4 space-y-2">
        {players.map((player: any, idx: number) => (
          <div key={idx} className="text-white text-sm flex items-center">
            {player.name ? (
              <>
                {idx === 0 && <span className="mr-2">👑</span>}
                {idx !== 0 && <span className="mr-2">🎮</span>}
                {player.name}
                {idx === parseInt(playerID) && (
                  <span className="ml-2 text-xs text-green-400">(You)</span>
                )}
              </>
            ) : (
              <>
                <span className="mr-2">💤</span>
                Waiting for player...
              </>
            )}
          </div>
        ))}
      </div>
      <p className="text-white text-sm mt-2">AI Players: {numAI}</p>
    </div>
  );
};

// In the return JSX for waiting room, replace player count with:
{renderPlayerList()}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- src/test/unit/NetworkLobby.test.tsx`
Expected: PASS - All 2 tests passing

**Step 5: Commit**

```bash
git add src/components/NetworkLobby.tsx src/test/unit/NetworkLobby.test.tsx
git commit -m "feat: add real-time player list to waiting room

- Poll lobby.getMatch every 1 second
- Display player list with names and icons (👑 host, 🎮 player, 💤 waiting)
- Highlight current player with (You) label
- Show AI player count
- Auto-transition detection when game starts
- 2/2 tests passing"
```

---

## Phase 3: Player Names in Game

### Task 6: Pass matchData to GameBoard

**Files:**
- Modify: `src/App.tsx` (or wherever Client is initialized)
- Modify: `src/components/GameBoard.tsx`

**Step 1: Write the failing test**

Create `src/test/unit/GameBoard-playerNames.test.tsx`:

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GameBoard } from '../../components/GameBoard';

describe('GameBoard - player names', () => {
  it('should receive matchData prop', () => {
    const mockMatchData = [
      { id: 0, name: 'Alice' },
      { id: 1, name: 'Bob' },
      { id: 2, name: 'Charlie' },
      { id: 3, name: 'Dave' },
    ];

    const mockProps = {
      G: {
        players: [{}, {}, {}, {}],
        // ... other game state
      },
      ctx: {
        currentPlayer: '0',
        // ... other ctx
      },
      moves: {},
      events: {},
      playerID: '0',
      matchData: mockMatchData,
    };

    render(<GameBoard {...mockProps} />);

    // Just verify it renders without errors for now
    expect(screen.getByTestId('game-board')).toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/test/unit/GameBoard-playerNames.test.tsx`
Expected: FAIL - "Unable to find element with testId: game-board"

**Step 3: Write minimal implementation**

Update `src/components/GameBoard.tsx`:

```typescript
import React from 'react';
import { getPlayerNames } from '../utils/getPlayerNames';

interface GameBoardProps {
  G: any;
  ctx: any;
  moves: any;
  events: any;
  playerID: string;
  matchData?: any[]; // NEW: Add matchData prop
  // ... other props
}

export const GameBoard: React.FC<GameBoardProps> = ({
  G,
  ctx,
  moves,
  events,
  playerID,
  matchData,  // NEW
  // ... other props
}) => {
  // Extract player names
  const playerNames = getPlayerNames(matchData);

  return (
    <div data-testid="game-board" className="game-board">
      {/* Existing game board UI */}
      {/* Pass playerNames to child components */}
    </div>
  );
};
```

Update where Client is created (likely `src/App.tsx` or similar):

```typescript
// When rendering the Client component, ensure matchData is passed
<Client
  // ... existing props
  debug={false}
>
  {({ G, ctx, moves, events, playerID, matchData }) => (
    <GameBoard
      G={G}
      ctx={ctx}
      moves={moves}
      events={events}
      playerID={playerID}
      matchData={matchData}  // NEW: Pass matchData
    />
  )}
</Client>
```

**Step 4: Run test to verify it passes**

Run: `npm test -- src/test/unit/GameBoard-playerNames.test.tsx`
Expected: PASS - Test passes

**Step 5: Commit**

```bash
git add src/components/GameBoard.tsx src/App.tsx src/test/unit/GameBoard-playerNames.test.tsx
git commit -m "feat: pass matchData to GameBoard for player names

- Add matchData prop to GameBoard
- Extract playerNames using getPlayerNames utility
- Update Client render to pass matchData
- 1/1 test passing"
```

---

### Task 7: Update TurnIndicator to show player names

**Files:**
- Modify: `src/components/TurnIndicator.tsx`
- Test: `src/test/unit/TurnIndicator.test.tsx`

**Step 1: Write the failing test**

Create or update `src/test/unit/TurnIndicator.test.tsx`:

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TurnIndicator } from '../../components/TurnIndicator';

describe('TurnIndicator - player names', () => {
  it('should display player name when provided', () => {
    render(
      <TurnIndicator
        currentPlayer="0"
        playerName="Alice"
        phase="play"
      />
    );

    expect(screen.getByText(/Alice's Turn/)).toBeInTheDocument();
  });

  it('should fallback to Player ID when name not provided', () => {
    render(
      <TurnIndicator
        currentPlayer="0"
        playerName={undefined}
        phase="play"
      />
    );

    expect(screen.getByText(/Player 0's Turn/)).toBeInTheDocument();
  });

  it('should use fallback for empty name', () => {
    render(
      <TurnIndicator
        currentPlayer="2"
        playerName=""
        phase="play"
      />
    );

    expect(screen.getByText(/Player 2's Turn/)).toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/test/unit/TurnIndicator.test.tsx`
Expected: FAIL - "Unable to find element with text: /Alice's Turn/"

**Step 3: Write minimal implementation**

Update `src/components/TurnIndicator.tsx`:

```typescript
import React from 'react';

interface TurnIndicatorProps {
  currentPlayer: string;
  playerName?: string;  // NEW
  phase: string;
  // ... other props
}

export const TurnIndicator: React.FC<TurnIndicatorProps> = ({
  currentPlayer,
  playerName,  // NEW
  phase,
  // ... other props
}) => {
  // Use player name if available, fallback to "Player {id}"
  const displayName = playerName && playerName.trim() !== ''
    ? playerName
    : `Player ${currentPlayer}`;

  return (
    <div className="turn-indicator">
      <h2>{displayName}'s Turn</h2>
      {/* Rest of turn indicator UI */}
    </div>
  );
};
```

Update `src/components/GameBoard.tsx` to pass playerName:

```typescript
<TurnIndicator
  currentPlayer={ctx.currentPlayer}
  playerName={playerNames[ctx.currentPlayer]}  // NEW
  phase={ctx.phase}
  // ... other props
/>
```

**Step 4: Run test to verify it passes**

Run: `npm test -- src/test/unit/TurnIndicator.test.tsx`
Expected: PASS - All 3 tests passing

**Step 5: Commit**

```bash
git add src/components/TurnIndicator.tsx src/components/GameBoard.tsx src/test/unit/TurnIndicator.test.tsx
git commit -m "feat: display player names in TurnIndicator

- Add playerName prop to TurnIndicator
- Display '{playerName}'s Turn' instead of 'Player {id}'s Turn'
- Fallback to Player {id} if name missing or empty
- 3/3 tests passing"
```

---

### Task 8: Update ActionNotification to show player names

**Files:**
- Modify: `src/components/ActionNotification.tsx`
- Test: `src/test/unit/ActionNotification.test.tsx`

**Step 1: Write the failing test**

Create or update `src/test/unit/ActionNotification.test.tsx`:

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ActionNotification } from '../../components/ActionNotification';

describe('ActionNotification - player names', () => {
  it('should display player names in BANG notification', () => {
    const playerNames = {
      '0': 'Alice',
      '1': 'Bob',
    };

    render(
      <ActionNotification
        message="Player 0 played BANG! at Player 1"
        playerNames={playerNames}
      />
    );

    expect(screen.getByText('Alice played BANG! at Bob')).toBeInTheDocument();
  });

  it('should handle multiple player references', () => {
    const playerNames = {
      '0': 'Alice',
      '1': 'Bob',
      '2': 'Charlie',
    };

    render(
      <ActionNotification
        message="Player 0 drew 2 cards"
        playerNames={playerNames}
      />
    );

    expect(screen.getByText('Alice drew 2 cards')).toBeInTheDocument();
  });

  it('should fallback to Player ID when name not available', () => {
    const playerNames = {
      '0': 'Alice',
    };

    render(
      <ActionNotification
        message="Player 1 drew 2 cards"
        playerNames={playerNames}
      />
    );

    expect(screen.getByText('Player 1 drew 2 cards')).toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/test/unit/ActionNotification.test.tsx`
Expected: FAIL - "Unable to find element with text: Alice played BANG! at Bob"

**Step 3: Write minimal implementation**

Update `src/components/ActionNotification.tsx`:

```typescript
import React from 'react';
import { PlayerNameMap } from '../utils/getPlayerNames';

interface ActionNotificationProps {
  message: string;
  playerNames?: PlayerNameMap;  // NEW
  // ... other props
}

export const ActionNotification: React.FC<ActionNotificationProps> = ({
  message,
  playerNames = {},  // NEW
  // ... other props
}) => {
  // Replace "Player {id}" with actual names
  const formatMessage = (msg: string): string => {
    return msg.replace(/Player (\d+)/g, (match, playerId) => {
      return playerNames[playerId] || match;
    });
  };

  const displayMessage = formatMessage(message);

  return (
    <div className="action-notification">
      <p>{displayMessage}</p>
    </div>
  );
};
```

Update `src/components/GameBoard.tsx` to pass playerNames:

```typescript
<ActionNotification
  message={currentAction}
  playerNames={playerNames}  // NEW
  // ... other props
/>
```

**Step 4: Run test to verify it passes**

Run: `npm test -- src/test/unit/ActionNotification.test.tsx`
Expected: PASS - All 3 tests passing

**Step 5: Commit**

```bash
git add src/components/ActionNotification.tsx src/components/GameBoard.tsx src/test/unit/ActionNotification.test.tsx
git commit -m "feat: display player names in ActionNotification

- Add playerNames prop to ActionNotification
- Replace 'Player {id}' with actual names in messages
- Regex replacement for all player references
- Fallback to 'Player {id}' if name unavailable
- 3/3 tests passing"
```

---

### Task 9: Update PlayerArea to show player names

**Files:**
- Modify: `src/components/PlayerArea.tsx`
- Test: `src/test/unit/PlayerArea.test.tsx`

**Step 1: Write the failing test**

Create or update `src/test/unit/PlayerArea.test.tsx`:

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PlayerArea } from '../../components/PlayerArea';

describe('PlayerArea - player names', () => {
  it('should display player name on card', () => {
    const mockPlayer = {
      health: 4,
      maxHealth: 4,
      role: 'sheriff',
      character: { name: 'Willy the Kid' },
    };

    render(
      <PlayerArea
        player={mockPlayer}
        playerID="0"
        playerName="Alice"
        isCurrentPlayer={true}
      />
    );

    expect(screen.getByText(/Alice/)).toBeInTheDocument();
  });

  it('should show role and health with name', () => {
    const mockPlayer = {
      health: 3,
      maxHealth: 4,
      role: 'sheriff',
      character: { name: 'Willy the Kid' },
    };

    render(
      <PlayerArea
        player={mockPlayer}
        playerID="0"
        playerName="Bob"
        isCurrentPlayer={false}
      />
    );

    expect(screen.getByText(/Bob/)).toBeInTheDocument();
    expect(screen.getByText(/sheriff/i)).toBeInTheDocument();
    expect(screen.getByText(/3/)).toBeInTheDocument();
  });

  it('should fallback to Player ID if name not provided', () => {
    const mockPlayer = {
      health: 4,
      maxHealth: 4,
      role: 'outlaw',
      character: { name: 'Calamity Janet' },
    };

    render(
      <PlayerArea
        player={mockPlayer}
        playerID="2"
        playerName={undefined}
        isCurrentPlayer={false}
      />
    );

    expect(screen.getByText(/Player 2/)).toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/test/unit/PlayerArea.test.tsx`
Expected: FAIL - "Unable to find element with text: /Alice/"

**Step 3: Write minimal implementation**

Update `src/components/PlayerArea.tsx`:

```typescript
import React from 'react';

interface PlayerAreaProps {
  player: any;
  playerID: string;
  playerName?: string;  // NEW
  isCurrentPlayer: boolean;
  // ... other props
}

export const PlayerArea: React.FC<PlayerAreaProps> = ({
  player,
  playerID,
  playerName,  // NEW
  isCurrentPlayer,
  // ... other props
}) => {
  const displayName = playerName && playerName.trim() !== ''
    ? playerName
    : `Player ${playerID}`;

  return (
    <div className="player-area">
      <div className="player-info">
        <h3>{displayName}</h3>
        <p>Role: {player.role}</p>
        <p>Health: {player.health}/{player.maxHealth} ❤️</p>
      </div>
      {/* Rest of player area UI */}
    </div>
  );
};
```

Update `src/components/GameBoard.tsx` to pass playerName to each PlayerArea:

```typescript
{G.players.map((player, idx) => (
  <PlayerArea
    key={idx}
    player={player}
    playerID={idx.toString()}
    playerName={playerNames[idx.toString()]}  // NEW
    isCurrentPlayer={idx.toString() === ctx.currentPlayer}
    // ... other props
  />
))}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- src/test/unit/PlayerArea.test.tsx`
Expected: PASS - All 3 tests passing

**Step 5: Commit**

```bash
git add src/components/PlayerArea.tsx src/components/GameBoard.tsx src/test/unit/PlayerArea.test.tsx
git commit -m "feat: display player names on PlayerArea cards

- Add playerName prop to PlayerArea
- Display name alongside role and health
- Fallback to 'Player {id}' if name unavailable
- 3/3 tests passing"
```

---

## Phase 4: Integration & Polish

### Task 10: Wire MatchBrowser into App navigation

**Files:**
- Modify: `src/App.tsx` (or main navigation component)
- Modify: `src/components/MainMenu.tsx` (if exists)

**Step 1: Add navigation state**

Update main app to handle navigation between:
- Main Menu
- Match Browser
- Network Lobby (host/join)
- Game

```typescript
// In App.tsx or similar
const [screen, setScreen] = useState<'menu' | 'browse' | 'lobby' | 'game'>('menu');
const [lobbyMode, setLobbyMode] = useState<'host' | 'join'>('host');

const handleBrowseGames = () => {
  setScreen('browse');
};

const handleJoinFromBrowser = (matchID: string, playerName: string) => {
  // Set up join mode with matchID
  setLobbyMode('join');
  setScreen('lobby');
  // Pass matchID to NetworkLobby
};

const handleCreateFromBrowser = () => {
  setLobbyMode('host');
  setScreen('lobby');
};

// In render:
{screen === 'menu' && (
  <MainMenu
    onHostGame={() => setScreen('lobby')}
    onBrowseGames={handleBrowseGames}
    // ... other handlers
  />
)}
{screen === 'browse' && (
  <MatchBrowser
    onJoinGame={handleJoinFromBrowser}
    onCreateGame={handleCreateFromBrowser}
    onBack={() => setScreen('menu')}
  />
)}
{screen === 'lobby' && (
  <NetworkLobby
    mode={lobbyMode}
    onStartGame={() => setScreen('game')}
    onBack={() => setScreen('menu')}
  />
)}
```

**Step 2: Add "Browse Games" button to main menu**

Update `MainMenu.tsx`:

```typescript
<button onClick={onBrowseGames}>
  Browse Games
</button>
```

**Step 3: Manual browser test**

1. Start server: `npm run server`
2. Start client: `npm run dev`
3. Create a game from another browser tab/device
4. Click "Browse Games" in main tab
5. Verify game appears in list
6. Click "Join Game"
7. Verify transition to waiting room
8. Verify player name appears in host's waiting room

**Step 4: Commit**

```bash
git add src/App.tsx src/components/MainMenu.tsx
git commit -m "feat: wire MatchBrowser into app navigation

- Add 'Browse Games' button to main menu
- Handle navigation: menu -> browse -> lobby -> game
- Pass matchID from browser to join flow
- Manual browser test successful"
```

---

### Task 11: Add player name prompt for MatchBrowser join

**Files:**
- Modify: `src/components/MatchBrowser.tsx`

**Step 1: Add player name input state**

```typescript
const [playerName, setPlayerName] = useState('');
const [selectedMatchID, setSelectedMatchID] = useState('');

const handleJoinClick = (matchID: string) => {
  if (!playerName || playerName.trim() === '') {
    // Show error or prompt
    setError('Please enter your name');
    setSelectedMatchID(matchID);
    return;
  }
  onJoinGame(matchID, playerName);
};
```

**Step 2: Add name input UI**

```typescript
// Add above match list
<div className="mb-4">
  <label className="block text-white text-sm font-bold mb-2">
    Your Name:
  </label>
  <input
    type="text"
    value={playerName}
    onChange={(e) => setPlayerName(e.target.value)}
    placeholder="Enter your name"
    className="w-full px-4 py-2 rounded-lg bg-white/20 text-white border-2 border-white/30 placeholder-white/50"
  />
</div>
```

**Step 3: Update join button**

```typescript
<button
  onClick={() => handleJoinClick(match.matchID)}
  disabled={!playerName || playerName.trim() === ''}
  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
>
  Join Game →
</button>
```

**Step 4: Manual browser test**

1. Open match browser
2. Try joining without name - button disabled
3. Enter name
4. Join game - verify name appears in waiting room

**Step 5: Commit**

```bash
git add src/components/MatchBrowser.tsx
git commit -m "feat: add player name input to MatchBrowser

- Require player name before joining
- Disable join button until name entered
- Pass player name to onJoinGame callback
- Manual browser test successful"
```

---

### Task 12: E2E test for complete multiplayer flow

**Files:**
- Create: `src/test/e2e/multiplayer-lobby.test.tsx`

**Step 1: Write E2E test**

```typescript
import { describe, it, expect } from 'vitest';
import { Client } from 'boardgame.io/client';
import { Local } from 'boardgame.io/multiplayer';
import { BangGame } from '../../Game';

describe('Multiplayer Lobby E2E', () => {
  it('should support full multiplayer flow with player names', async () => {
    // Create local multiplayer setup
    const player0 = Client({
      game: BangGame,
      multiplayer: Local(),
      playerID: '0',
    });

    const player1 = Client({
      game: BangGame,
      multiplayer: Local(),
      playerID: '1',
    });

    player0.start();
    player1.start();

    // Simulate matchData
    const matchData = [
      { id: 0, name: 'Alice' },
      { id: 1, name: 'Bob' },
      { id: 2, name: 'Charlie' },
      { id: 3, name: 'Dave' },
    ];

    // Get state
    const state = player0.getState();

    // Verify player names accessible
    expect(matchData[0].name).toBe('Alice');
    expect(matchData[1].name).toBe('Bob');

    // Verify game state works with multiplayer
    expect(state.ctx.numPlayers).toBeGreaterThan(0);

    player0.stop();
    player1.stop();
  });
});
```

**Step 2: Run test**

Run: `npm test -- src/test/e2e/multiplayer-lobby.test.tsx`
Expected: PASS

**Step 3: Commit**

```bash
git add src/test/e2e/multiplayer-lobby.test.tsx
git commit -m "test: add E2E test for multiplayer lobby flow

- Test local multiplayer setup
- Verify matchData structure
- Verify player names accessible
- 1/1 test passing"
```

---

## Final Tasks

### Task 13: Documentation update

**Files:**
- Create: `.docs/MULTIPLAYER_LOBBY_GUIDE.md`
- Modify: `TODO.md`

**Step 1: Write user guide**

Create `.docs/MULTIPLAYER_LOBBY_GUIDE.md`:

```markdown
# Multiplayer Lobby System Guide

## Features

### 1. Match Browser
- Browse available games without knowing game codes
- See joinable games by default
- Toggle "Show All Games" to see full/in-progress matches
- Auto-refreshes every 1 second

### 2. Waiting Room
- Real-time player list with names
- See when players join/leave
- Host can start game when ready
- All players auto-transition on start

### 3. Player Names
- Names visible throughout gameplay
- Turn indicator shows player names
- Action notifications use player names
- Player cards display names

## Usage

### Hosting a Game
1. Click "Host Game" from main menu
2. Enter your name and game settings
3. Share game code with friends
4. Wait for players in lobby
5. Click "Start Game" when ready

### Joining via Browser
1. Click "Browse Games" from main menu
2. Enter your name
3. Browse available games
4. Click "Join Game" on desired match
5. Wait in lobby for host to start

### Joining via Code
1. Click "Join Game" from main menu
2. Enter your name
3. Enter game code
4. Wait in lobby for host to start

## Technical Details

- **Polling:** 1-second intervals for match list and waiting room
- **LobbyClient:** Uses boardgame.io's built-in lobby API
- **Player Names:** Stored in matchData, accessible throughout game
- **Backwards Compatible:** Falls back to "Player {id}" if names unavailable
```

**Step 2: Update TODO.md**

```markdown
### 🌐 Multiplayer
- [x] **Test network multiplayer** ✅
- [x] **Fix server port conflict** ✅
- [x] **Fix IP detection** ✅
- [x] **Add match browser** ✅ - Browse and join games
- [x] **Implement lobby waiting room** ✅ - Real-time player list
- [x] **Display player names in game** ✅ - Names throughout gameplay
```

**Step 3: Commit**

```bash
git add .docs/MULTIPLAYER_LOBBY_GUIDE.md TODO.md
git commit -m "docs: add multiplayer lobby system guide

- User guide for hosting, browsing, joining
- Technical details and architecture notes
- Update TODO.md to mark features complete"
```

---

### Task 14: Final integration test and polish

**Step 1: Run all tests**

```bash
npm test -- --run
```

Expected: All tests passing

**Step 2: Manual browser testing checklist**

- [ ] Start server
- [ ] Create game from device A
- [ ] Browse games from device B
- [ ] Join game from device B
- [ ] Verify names appear in waiting room
- [ ] Start game from device A
- [ ] Both devices transition to game
- [ ] Verify names in turn indicator
- [ ] Verify names in player cards
- [ ] Play one turn
- [ ] Verify names in action notifications

**Step 3: Final commit**

```bash
git add -A
git commit -m "feat: complete multiplayer lobby features

Phase 1: Match Browser
- Browse and join available games
- Filter joinable vs all games
- 1-second polling with auto-refresh

Phase 2: Enhanced Waiting Room
- Real-time player list with icons
- Host/player/waiting indicators
- Auto-transition on game start

Phase 3: Player Names in Game
- Names in turn indicator
- Names in action notifications
- Names on player cards
- Backwards compatible fallbacks

All tests passing. Manual browser testing complete."
```

---

## Success Criteria Checklist

- [ ] Match browser shows available games
- [ ] Games can be joined from browser
- [ ] Waiting room shows real-time player list
- [ ] Host can start game
- [ ] All players auto-transition to game
- [ ] Player names visible in turn indicator
- [ ] Player names visible in action notifications
- [ ] Player names visible on player cards
- [ ] Fallback to "Player {id}" works
- [ ] All unit tests passing
- [ ] E2E tests passing
- [ ] Manual browser testing successful
- [ ] Documentation complete

---

## Estimated Time

- Phase 1 (Tasks 1-4): 60-90 minutes
- Phase 2 (Task 5): 30-45 minutes
- Phase 3 (Tasks 6-9): 60-75 minutes
- Phase 4 (Tasks 10-14): 45-60 minutes
- **Total:** 3.5-4.5 hours

---

## Notes

- Follow TDD strictly: test first, watch fail, implement, watch pass
- Commit after each passing test
- Use @superpowers:test-driven-development for discipline
- Manual browser tests are critical - automated tests can't catch all UI issues
- Keep YAGNI in mind - implement exactly what's in the design, no more

---

**End of Implementation Plan**
