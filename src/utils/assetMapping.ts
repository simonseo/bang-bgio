// Map card types to image paths

import { CardType } from '../data/cards';

export const cardImageMap: Record<CardType, string> = {
  BANG: '/assets/cards/playing/bang.png',
  MISSED: '/assets/cards/playing/missed.png',
  BEER: '/assets/cards/playing/beer.png',
  SALOON: '/assets/cards/playing/saloon.png',
  STAGECOACH: '/assets/cards/playing/stagecoach.png',
  WELLS_FARGO: '/assets/cards/playing/wells-fargo.png',
  PANIC: '/assets/cards/playing/panic.png',
  CAT_BALOU: '/assets/cards/playing/cat-balou.png',
  DUEL: '/assets/cards/playing/duel.png',
  INDIANS: '/assets/cards/playing/indians.png',
  GATLING: '/assets/cards/playing/gatling.png',
  GENERAL_STORE: '/assets/cards/playing/general-store.png',
  VOLCANIC: '/assets/cards/weapons/volcanic.png',
  SCHOFIELD: '/assets/cards/weapons/schofield.png',
  REMINGTON: '/assets/cards/weapons/remington.png',
  REV_CARABINE: '/assets/cards/weapons/rev-carabine.png',
  WINCHESTER: '/assets/cards/weapons/winchester.png',
  BARREL: '/assets/cards/equipment/barrel.png',
  DYNAMITE: '/assets/cards/equipment/dynamite.png',
  JAIL: '/assets/cards/equipment/jail.png',
  MUSTANG: '/assets/cards/equipment/mustang.png',
  SCOPE: '/assets/cards/equipment/scope.png',
};

export const characterImageMap: Record<string, string> = {
  'bart-cassidy': '/assets/cards/characters/bart-cassidy.png',
  'black-jack': '/assets/cards/characters/black-jack.png',
  'calamity-janet': '/assets/cards/characters/calamity-janet.png',
  'el-gringo': '/assets/cards/characters/el-gringo.png',
  'jesse-jones': '/assets/cards/characters/jesse-jones.png',
  'jourdonnais': '/assets/cards/characters/jourdonnais.png',
  'kit-carlson': '/assets/cards/characters/kit-carlson.png',
  'lucky-duke': '/assets/cards/characters/lucky-duke.png',
  'paul-regret': '/assets/cards/characters/paul-regret.png',
  'pedro-ramirez': '/assets/cards/characters/pedro-ramirez.png',
  'rose-doolan': '/assets/cards/characters/rose-doolan.png',
  'sid-ketchum': '/assets/cards/characters/sid-ketchum.png',
  'slab-the-killer': '/assets/cards/characters/slab-the-killer.png',
  'suzy-lafayette': '/assets/cards/characters/suzy-lafayette.png',
  'vulture-sam': '/assets/cards/characters/vulture-sam.png',
  'willy-the-kid': '/assets/cards/characters/willy-the-kid.png',
};

export function getCardImage(cardType: CardType): string | null {
  return cardImageMap[cardType] || null;
}

export function getCharacterImage(characterId: string): string | null {
  return characterImageMap[characterId] || null;
}
