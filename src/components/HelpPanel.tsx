// Help panel with game instructions

import React, { useState } from 'react';

export const HelpPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Help button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 right-4 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg text-xl font-bold"
        title="Help"
      >
        ?
      </button>

      {/* Help overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-40 flex items-center justify-center p-4"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-gradient-to-br from-amber-900 to-red-900 rounded-2xl p-8 max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-white">How to Play</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-gray-300 text-3xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-6 text-white">
              {/* Basic gameplay */}
              <section>
                <h3 className="text-xl font-bold mb-2 text-yellow-400">🎮 Basic Controls</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li><strong>Click "Draw Cards"</strong> to draw 2 cards at start of your turn</li>
                  <li><strong>Click a card in your hand</strong> to select it</li>
                  <li>Cards with a <strong className="text-green-400">green ring and pulsing dot</strong> can be played</li>
                  <li>If the card requires a target, <strong className="text-green-400">click a highlighted player</strong></li>
                  <li>Cards without targets play immediately when clicked</li>
                  <li><strong>Click "End Turn"</strong> when you're done</li>
                </ul>
              </section>

              {/* Card types */}
              <section>
                <h3 className="text-xl font-bold mb-2 text-yellow-400">🎴 Card Types</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li><strong>BANG!</strong> - Attack a player in range (limit 1 per turn unless you have Volcanic)</li>
                  <li><strong>Missed!</strong> - Defend against BANG! attacks</li>
                  <li><strong>Beer</strong> - Restore 1 health (only if not at max health)</li>
                  <li><strong>Equipment</strong> - Weapons increase range, Barrel/Mustang/Scope help defense</li>
                  <li><strong>Action cards</strong> - Special effects like drawing cards or stealing</li>
                </ul>
              </section>

              {/* Visual indicators */}
              <section>
                <h3 className="text-xl font-bold mb-2 text-yellow-400">👁️ Visual Indicators</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li><strong className="text-green-400">Green ring + pulsing dot</strong> = Card can be played now</li>
                  <li><strong className="text-yellow-400">Yellow ring</strong> = Currently selected card</li>
                  <li><strong className="text-green-400">Green highlight on player</strong> = Valid target</li>
                  <li><strong className="text-gray-400">Grayed out</strong> = Cannot target this player</li>
                  <li><strong>❤️ Hearts</strong> = Health (red = alive, gray = lost)</li>
                </ul>
              </section>

              {/* Tips */}
              <section>
                <h3 className="text-xl font-bold mb-2 text-yellow-400">💡 Tips</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>Hover over any card to see its name and description</li>
                  <li>Hover over opponents to see their character abilities</li>
                  <li>Watch the role badges - Sheriff is always visible, others hidden until death</li>
                  <li>Distance matters! Weapons increase your attack range</li>
                  <li>Equipment like Mustang makes you harder to hit</li>
                </ul>
              </section>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
