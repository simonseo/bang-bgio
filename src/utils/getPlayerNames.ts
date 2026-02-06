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
