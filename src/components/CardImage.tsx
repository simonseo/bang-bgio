// Card image component with fallback to placeholder

import React, { useState } from 'react';
import { Card } from '../data/cards';
import { getCardImage } from '../utils/assetMapping';
import { PlaceholderCard } from './PlaceholderCard';

interface CardImageProps {
  card: Card;
  size?: 'small' | 'medium' | 'large';
}

export const CardImage: React.FC<CardImageProps> = ({ card, size = 'medium' }) => {
  const [error, setError] = useState(false);
  const imagePath = getCardImage(card.type);

  const sizeClasses = {
    small: 'w-16 h-24',
    medium: 'w-24 h-36',
    large: 'w-32 h-48',
  };

  // Use placeholder if no image or error
  if (error || !imagePath) {
    return <PlaceholderCard card={card} size={size} />;
  }

  return (
    <img
      src={imagePath}
      alt={card.name}
      className={`${sizeClasses[size]} rounded-lg object-cover`}
      onError={() => setError(true)}
    />
  );
};
