// Role definitions and distribution

export type Role = 'sheriff' | 'deputy' | 'outlaw' | 'renegade';

export interface RoleInfo {
  role: Role;
  team: 'law' | 'outlaw' | 'renegade';
  goal: string;
  revealOnDeath: boolean;
}

export const ROLE_INFO: Record<Role, RoleInfo> = {
  sheriff: {
    role: 'sheriff',
    team: 'law',
    goal: 'Eliminate all Outlaws and the Renegade',
    revealOnDeath: true,
  },
  deputy: {
    role: 'deputy',
    team: 'law',
    goal: 'Protect the Sheriff and eliminate Outlaws',
    revealOnDeath: true,
  },
  outlaw: {
    role: 'outlaw',
    team: 'outlaw',
    goal: 'Eliminate the Sheriff',
    revealOnDeath: true,
  },
  renegade: {
    role: 'renegade',
    team: 'renegade',
    goal: 'Be the last player alive',
    revealOnDeath: true,
  },
};

// Role distribution by player count
export const ROLE_DISTRIBUTION: Record<number, Role[]> = {
  4: ['sheriff', 'renegade', 'outlaw', 'outlaw'],
  5: ['sheriff', 'renegade', 'outlaw', 'outlaw', 'deputy'],
  6: ['sheriff', 'renegade', 'outlaw', 'outlaw', 'outlaw', 'deputy'],
  7: ['sheriff', 'renegade', 'outlaw', 'outlaw', 'outlaw', 'deputy', 'deputy'],
};

// Shuffle and assign roles
export function assignRoles(playerCount: number): Role[] {
  const roles = ROLE_DISTRIBUTION[playerCount];
  if (!roles) {
    throw new Error(`Invalid player count: ${playerCount}. Must be 4-7.`);
  }

  // Shuffle roles (keeping sheriff at index 0)
  const nonSheriffRoles = roles.slice(1);
  for (let i = nonSheriffRoles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [nonSheriffRoles[i], nonSheriffRoles[j]] = [nonSheriffRoles[j], nonSheriffRoles[i]];
  }

  return ['sheriff', ...nonSheriffRoles];
}
