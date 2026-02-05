// Role badge display

import React from 'react';
import { Role } from '../data/roles';

interface RoleBadgeProps {
  role: Role | 'HIDDEN';
  size?: 'small' | 'medium' | 'large';
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role, size = 'medium' }) => {
  const sizeClasses = {
    small: 'w-8 h-8 text-xs',
    medium: 'w-12 h-12 text-sm',
    large: 'w-16 h-16 text-base',
  };

  if (role === 'HIDDEN') {
    return (
      <div
        className={`${sizeClasses[size]} rounded-full bg-gray-600 flex items-center justify-center text-white font-bold`}
      >
        ?
      </div>
    );
  }

  const roleInfo = {
    sheriff: { emoji: '⭐', bg: 'bg-yellow-500', label: 'Sheriff' },
    deputy: { emoji: '🛡️', bg: 'bg-blue-500', label: 'Deputy' },
    outlaw: { emoji: '💀', bg: 'bg-red-600', label: 'Outlaw' },
    renegade: { emoji: '🎭', bg: 'bg-purple-600', label: 'Renegade' },
  };

  const info = roleInfo[role];

  return (
    <div
      className={`${sizeClasses[size]} ${info.bg} rounded-full flex items-center justify-center text-white font-bold shadow-lg`}
      title={info.label}
    >
      <span className={size === 'small' ? 'text-base' : size === 'medium' ? 'text-xl' : 'text-3xl'}>
        {info.emoji}
      </span>
    </div>
  );
};
