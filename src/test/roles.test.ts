// Unit tests for role system

import { describe, it, expect } from 'vitest';
import { assignRoles, ROLE_DISTRIBUTION, ROLE_INFO } from '../data/roles';

describe('Role Distribution', () => {
  it('should have distributions for 4-7 players', () => {
    expect(ROLE_DISTRIBUTION[4]).toBeDefined();
    expect(ROLE_DISTRIBUTION[5]).toBeDefined();
    expect(ROLE_DISTRIBUTION[6]).toBeDefined();
    expect(ROLE_DISTRIBUTION[7]).toBeDefined();
  });

  it('should always have exactly one sheriff', () => {
    [4, 5, 6, 7].forEach(num => {
      const roles = ROLE_DISTRIBUTION[num];
      const sheriffs = roles.filter(r => r === 'sheriff');
      expect(sheriffs).toHaveLength(1);
    });
  });

  it('should always have exactly one renegade', () => {
    [4, 5, 6, 7].forEach(num => {
      const roles = ROLE_DISTRIBUTION[num];
      const renegades = roles.filter(r => r === 'renegade');
      expect(renegades).toHaveLength(1);
    });
  });

  it('should have correct total count for each player number', () => {
    expect(ROLE_DISTRIBUTION[4]).toHaveLength(4);
    expect(ROLE_DISTRIBUTION[5]).toHaveLength(5);
    expect(ROLE_DISTRIBUTION[6]).toHaveLength(6);
    expect(ROLE_DISTRIBUTION[7]).toHaveLength(7);
  });

  it('should have sheriff at index 0', () => {
    [4, 5, 6, 7].forEach(num => {
      const roles = ROLE_DISTRIBUTION[num];
      expect(roles[0]).toBe('sheriff');
    });
  });

  it('should have correct outlaw count', () => {
    expect(ROLE_DISTRIBUTION[4].filter(r => r === 'outlaw')).toHaveLength(2);
    expect(ROLE_DISTRIBUTION[5].filter(r => r === 'outlaw')).toHaveLength(2);
    expect(ROLE_DISTRIBUTION[6].filter(r => r === 'outlaw')).toHaveLength(3);
    expect(ROLE_DISTRIBUTION[7].filter(r => r === 'outlaw')).toHaveLength(3);
  });

  it('should have correct deputy count', () => {
    expect(ROLE_DISTRIBUTION[4].filter(r => r === 'deputy')).toHaveLength(0);
    expect(ROLE_DISTRIBUTION[5].filter(r => r === 'deputy')).toHaveLength(1);
    expect(ROLE_DISTRIBUTION[6].filter(r => r === 'deputy')).toHaveLength(1);
    expect(ROLE_DISTRIBUTION[7].filter(r => r === 'deputy')).toHaveLength(2);
  });
});

describe('Role Assignment', () => {
  it('should return correct number of roles', () => {
    expect(assignRoles(4)).toHaveLength(4);
    expect(assignRoles(5)).toHaveLength(5);
    expect(assignRoles(6)).toHaveLength(6);
    expect(assignRoles(7)).toHaveLength(7);
  });

  it('should always put sheriff first', () => {
    [4, 5, 6, 7].forEach(num => {
      const roles = assignRoles(num);
      expect(roles[0]).toBe('sheriff');
    });
  });

  it('should shuffle non-sheriff roles', () => {
    const assignments = Array.from({ length: 10 }, () => assignRoles(5));

    // Check if position 1 varies (should not always be the same)
    const position1Roles = assignments.map(a => a[1]);
    const uniqueRoles = new Set(position1Roles);

    // Should have at least 2 different roles at position 1 after 10 shuffles
    expect(uniqueRoles.size).toBeGreaterThan(1);
  });

  it('should throw error for invalid player count', () => {
    expect(() => assignRoles(3)).toThrow('Invalid player count');
    expect(() => assignRoles(8)).toThrow('Invalid player count');
    expect(() => assignRoles(0)).toThrow('Invalid player count');
  });

  it('should maintain role distribution after shuffling', () => {
    const roles = assignRoles(6);
    expect(roles.filter(r => r === 'sheriff')).toHaveLength(1);
    expect(roles.filter(r => r === 'renegade')).toHaveLength(1);
    expect(roles.filter(r => r === 'outlaw')).toHaveLength(3);
    expect(roles.filter(r => r === 'deputy')).toHaveLength(1);
  });
});

describe('Role Information', () => {
  it('should have info for all role types', () => {
    expect(ROLE_INFO.sheriff).toBeDefined();
    expect(ROLE_INFO.deputy).toBeDefined();
    expect(ROLE_INFO.outlaw).toBeDefined();
    expect(ROLE_INFO.renegade).toBeDefined();
  });

  it('should have correct team assignments', () => {
    expect(ROLE_INFO.sheriff.team).toBe('law');
    expect(ROLE_INFO.deputy.team).toBe('law');
    expect(ROLE_INFO.outlaw.team).toBe('outlaw');
    expect(ROLE_INFO.renegade.team).toBe('renegade');
  });

  it('should have goals defined for all roles', () => {
    Object.values(ROLE_INFO).forEach(info => {
      expect(info.goal).toBeTruthy();
      expect(info.goal.length).toBeGreaterThan(0);
    });
  });

  it('should have reveal on death set for all roles', () => {
    Object.values(ROLE_INFO).forEach(info => {
      expect(info.revealOnDeath).toBe(true);
    });
  });
});
