// Main card component with image and overlay

import React from 'react';
import { Card as CardType } from '../data/cards';
import { CardImage } from './CardImage';
import { CardOverlay } from './CardOverlay';

interface CardProps {
  card: CardType;
  size?: 'small' | 'medium' | 'large';
  onClick?: () => void;
  selected?: boolean;
  disabled?: boolean;
  playable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  card,
  size = 'medium',
  onClick,
  selected = false,
  disabled = false,
  playable = false,
}) => {
  const sizeClasses = {
    small: 'w-16 h-24',
    medium: 'w-24 h-36',
    large: 'w-32 h-48',
  };

  return (
    <div
      className={`
        ${sizeClasses[size]}
        relative
        cursor-pointer
        transition-all
        duration-200
        hover:scale-105
        ${selected ? 'ring-4 ring-yellow-400 scale-105' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${playable && !selected ? 'ring-2 ring-green-400 shadow-lg shadow-green-400/50' : ''}
      `}
      onClick={!disabled ? onClick : undefined}
    >
      <CardImage card={card} size={size} />
      <CardOverlay suit={card.suit} rank={card.rank} />

      {/* Playable indicator */}
      {playable && !selected && (
        <div className="absolute top-1 right-1 bg-green-500 rounded-full w-3 h-3 animate-pulse" />
      )}

      {/* Card description tooltip on hover */}
      <div
        className="absolute bottom-0 left-0 right-0 bg-black/90 text-white text-xs p-2 rounded-b-lg opacity-0 hover:opacity-100 transition-opacity pointer-events-none z-10"
        style={{ maxWidth: '200px' }}
      >
        <div className="font-bold">{card.name}</div>
        <div className="text-gray-300 mt-1">{card.description}</div>
        {card.range && <div className="text-yellow-400 mt-1">Range: {card.range}</div>}
      </div>
    </div>
  );
};
