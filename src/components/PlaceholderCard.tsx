// Placeholder card component with colored background

import React from 'react';
import { Card } from '../data/cards';
import { getCardTypeColor } from '../utils/cardHelpers';

interface PlaceholderCardProps {
  card: Card;
  size?: 'small' | 'medium' | 'large';
}

export const PlaceholderCard: React.FC<PlaceholderCardProps> = ({ card, size = 'medium' }) => {
  const bgColor = getCardTypeColor(card);

  const sizeClasses = {
    small: 'w-16 h-24 text-xs',
    medium: 'w-24 h-36 text-sm',
    large: 'w-32 h-48 text-base',
  };

  return (
    <div
      className={`${sizeClasses[size]} rounded-lg border-2 border-gray-800 flex flex-col items-center justify-center p-2 text-white font-bold shadow-lg`}
      style={{ backgroundColor: bgColor }}
    >
      <div className="text-center mb-2">
        <div className="text-2xl mb-1">
          {getCardIcon(card)}
        </div>
        <div className="leading-tight">{card.name}</div>
      </div>
      {card.range && (
        <div className="text-xs mt-auto">Range: {card.range}</div>
      )}
    </div>
  );
};

function getCardIcon(card: Card): string {
  switch (card.type) {
    case 'BANG':
      return '💥';
    case 'MISSED':
      return '🛡️';
    case 'BEER':
      return '🍺';
    case 'SALOON':
      return '🏠';
    case 'STAGECOACH':
      return '🚂';
    case 'WELLS_FARGO':
      return '🏦';
    case 'PANIC':
      return '😱';
    case 'CAT_BALOU':
      return '🐱';
    case 'DUEL':
      return '⚔️';
    case 'INDIANS':
      return '🏹';
    case 'GATLING':
      return '🔫';
    case 'GENERAL_STORE':
      return '🏪';
    case 'BARREL':
      return '🛢️';
    case 'DYNAMITE':
      return '💣';
    case 'JAIL':
      return '⛓️';
    case 'MUSTANG':
      return '🐴';
    case 'SCOPE':
      return '🔭';
    default:
      if (card.isWeapon) return '🔫';
      return '📄';
  }
}
