// Unit tests for character abilities

import { describe, it, expect } from 'vitest';
import { CHARACTERS, getCharacterById, shuffleCharacters } from '../data/characters';

describe('Character Data', () => {
  it('should have exactly 16 characters', () => {
    expect(CHARACTERS).toHaveLength(16);
  });

  it('should have all characters with unique IDs', () => {
    const ids = CHARACTERS.map(c => c.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(16);
  });

  it('should have all characters with valid health (3-4)', () => {
    CHARACTERS.forEach(char => {
      expect(char.health).toBeGreaterThanOrEqual(3);
      expect(char.health).toBeLessThanOrEqual(4);
    });
  });

  it('should have all characters with abilities', () => {
    CHARACTERS.forEach(char => {
      expect(char.ability).toBeTruthy();
      expect(char.description).toBeTruthy();
    });
  });

  it('should have correct character names', () => {
    const expectedNames = [
      'Bart Cassidy',
      'Black Jack',
      'Calamity Janet',
      'El Gringo',
      'Jesse Jones',
      'Jourdonnais',
      'Kit Carlson',
      'Lucky Duke',
      'Paul Regret',
      'Pedro Ramirez',
      'Rose Doolan',
      'Sid Ketchum',
      'Slab the Killer',
      'Suzy Lafayette',
      'Vulture Sam',
      'Willy the Kid',
    ];

    const actualNames = CHARACTERS.map(c => c.name).sort();
    expect(actualNames).toEqual(expectedNames.sort());
  });

  it('should find character by ID', () => {
    const char = getCharacterById('willy-the-kid');
    expect(char).toBeDefined();
    expect(char?.name).toBe('Willy the Kid');
    expect(char?.ability).toBe('unlimited-bangs');
  });

  it('should return undefined for invalid ID', () => {
    const char = getCharacterById('non-existent');
    expect(char).toBeUndefined();
  });
});

describe('Character Shuffling', () => {
  it('should maintain character count after shuffling', () => {
    const shuffled = shuffleCharacters();
    expect(shuffled).toHaveLength(16);
  });

  it('should contain same characters after shuffling', () => {
    const shuffled = shuffleCharacters();
    const originalIds = CHARACTERS.map(c => c.id).sort();
    const shuffledIds = shuffled.map(c => c.id).sort();
    expect(shuffledIds).toEqual(originalIds);
  });

  it('should produce different order (probabilistically)', () => {
    const shuffled = shuffleCharacters();

    let differentPositions = 0;
    for (let i = 0; i < CHARACTERS.length; i++) {
      if (CHARACTERS[i].id !== shuffled[i].id) {
        differentPositions++;
      }
    }

    // Expect at least 8 characters to be in different positions
    expect(differentPositions).toBeGreaterThan(8);
  });
});

describe('Character Abilities', () => {
  describe('Willy the Kid', () => {
    it('should have unlimited-bangs ability', () => {
      const char = getCharacterById('willy-the-kid');
      expect(char?.ability).toBe('unlimited-bangs');
      expect(char?.timing).toBe('passive');
    });
  });

  describe('Bart Cassidy', () => {
    it('should have draw-on-damage ability', () => {
      const char = getCharacterById('bart-cassidy');
      expect(char?.ability).toBe('draw-on-damage');
      expect(char?.timing).toBe('onDamage');
    });
  });

  describe('Paul Regret', () => {
    it('should have distance-plus-one ability', () => {
      const char = getCharacterById('paul-regret');
      expect(char?.ability).toBe('distance-plus-one');
      expect(char?.timing).toBe('passive');
      expect(char?.health).toBe(3); // Lower health for powerful ability
    });
  });

  describe('El Gringo', () => {
    it('should have draw-from-attacker ability', () => {
      const char = getCharacterById('el-gringo');
      expect(char?.ability).toBe('draw-from-attacker');
      expect(char?.timing).toBe('onDamage');
      expect(char?.health).toBe(3); // Lower health
    });
  });

  describe('Rose Doolan', () => {
    it('should have distance-minus-one ability', () => {
      const char = getCharacterById('rose-doolan');
      expect(char?.ability).toBe('distance-minus-one');
      expect(char?.timing).toBe('passive');
    });
  });

  describe('Vulture Sam', () => {
    it('should have take-dead-cards ability', () => {
      const char = getCharacterById('vulture-sam');
      expect(char?.ability).toBe('take-dead-cards');
      expect(char?.timing).toBe('onDeath');
    });
  });
});
