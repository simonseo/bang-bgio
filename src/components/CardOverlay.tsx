// SVG overlay for card suit and rank

import React from 'react';
import { Suit, Rank } from '../data/cards';
import { getSuitSymbol, getSuitColor } from '../utils/cardHelpers';

interface CardOverlayProps {
  suit: Suit;
  rank: Rank;
}

export const CardOverlay: React.FC<CardOverlayProps> = ({ suit, rank }) => {
  const suitSymbol = getSuitSymbol(suit);
  const suitColor = getSuitColor(suit);

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Bottom left corner only - pushed further left and down */}
      <div className="absolute bottom-1 left-1 flex flex-col items-center bg-white/90 rounded px-1 py-0.5">
        <span className="text-lg font-bold leading-none" style={{ color: suitColor }}>
          {rank}
        </span>
        <span className="text-xl leading-none" style={{ color: suitColor }}>
          {suitSymbol}
        </span>
      </div>
    </div>
  );
};
