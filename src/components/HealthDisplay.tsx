// Health display with heart icons

import React from 'react';

interface HealthDisplayProps {
  current: number;
  max: number;
  size?: 'small' | 'medium' | 'large';
}

export const HealthDisplay: React.FC<HealthDisplayProps> = ({
  current,
  max,
  size = 'medium',
}) => {
  const sizeClasses = {
    small: 'text-sm',
    medium: 'text-lg',
    large: 'text-2xl',
  };

  const hearts = [];
  for (let i = 0; i < max; i++) {
    hearts.push(
      <span
        key={i}
        className={sizeClasses[size]}
        style={{ color: i < current ? '#DC2626' : '#9CA3AF' }}
      >
        ❤️
      </span>
    );
  }

  return <div className="flex gap-1">{hearts}</div>;
};
