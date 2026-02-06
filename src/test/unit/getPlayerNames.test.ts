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
