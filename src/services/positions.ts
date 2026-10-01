import { PositionType, GameMode } from '../types/game';

/**
 * GOALIX Centralized Position-Order System
 * 
 * Strict sequence:
 * QUICK FIVE:
 * 1. GK
 * 2. DEF
 * 3. MID
 * 4. ATT
 * 5. ATT
 * 
 * FULL ELEVEN:
 * 1. GK
 * 2. DEF
 * 3. DEF
 * 4. DEF
 * 5. DEF
 * 6. MID
 * 7. MID
 * 8. MID
 * 9. ATT
 * 10. ATT
 * 11. ATT
 */

export const QUICK_FIVE_POSITIONS: readonly PositionType[] = [
  'GK', 
  'DEF', 
  'MID', 
  'ATT', 
  'ATT'
] as const;

export const FULL_ELEVEN_POSITIONS: readonly PositionType[] = [
  'GK', 
  'DEF', 
  'DEF', 
  'DEF', 
  'DEF', 
  'MID', 
  'MID', 
  'MID', 
  'ATT', 
  'ATT', 
  'ATT'
] as const;

export function getPositionOrder(mode: GameMode): PositionType[] {
  return mode === 'quick_five' ? [...QUICK_FIVE_POSITIONS] : [...FULL_ELEVEN_POSITIONS];
}

export function getCurrentRoundPosition(mode: GameMode, roundIndex: number): PositionType {
  const list = getPositionOrder(mode);
  const clampedIndex = Math.min(Math.max(0, roundIndex), list.length - 1);
  return list[clampedIndex];
}

export function getPositionLabelAr(position: PositionType): string {
  switch (position) {
    case 'GK': return 'حارس مرمى (GK)';
    case 'DEF': return 'مدافع (DEF)';
    case 'MID': return 'لاعب وسط (MID)';
    case 'ATT': return 'مهاجم (ATT)';
    default: return position;
  }
}

/**
 * Validates that an awarded player strictly matches the expected position of the current round.
 * Never allows giving a player from another position phase.
 */
export function validateAwardedPlayerPosition(playerPosition: PositionType, expectedPosition: PositionType): boolean {
  return playerPosition === expectedPosition;
}

/**
 * Formations coordinates for Live SANTRA and Pitch screens
 * Provides positions on 2D tactical field normalized (0-100%).
 */
export interface TacticalSlotCoord {
  index: number;
  position: PositionType;
  label: string;
  x: number; // percentage left (0 - 100)
  y: number; // percentage top (0 - 100)
}

export function getTacticalSlotsForMode(mode: GameMode): TacticalSlotCoord[] {
  if (mode === 'quick_five') {
    return [
      { index: 0, position: 'GK', label: 'GK', x: 50, y: 84 },
      { index: 1, position: 'DEF', label: 'DEF', x: 50, y: 64 },
      { index: 2, position: 'MID', label: 'MID', x: 50, y: 44 },
      { index: 3, position: 'ATT', label: 'ATT', x: 30, y: 22 },
      { index: 4, position: 'ATT', label: 'ATT', x: 70, y: 22 }
    ];
  }

  // Full Eleven: 4-3-3 tactical distribution matching the 11 sequential positions
  return [
    { index: 0, position: 'GK', label: 'GK', x: 50, y: 88 },
    { index: 1, position: 'DEF', label: 'LB', x: 18, y: 70 },
    { index: 2, position: 'DEF', label: 'CB', x: 38, y: 72 },
    { index: 3, position: 'DEF', label: 'CB', x: 62, y: 72 },
    { index: 4, position: 'DEF', label: 'RB', x: 82, y: 70 },
    { index: 5, position: 'MID', label: 'CM', x: 26, y: 50 },
    { index: 6, position: 'MID', label: 'CDM', x: 50, y: 54 },
    { index: 7, position: 'MID', label: 'CM', x: 74, y: 50 },
    { index: 8, position: 'ATT', label: 'LW', x: 20, y: 24 },
    { index: 9, position: 'ATT', label: 'ST', x: 50, y: 18 },
    { index: 10, position: 'ATT', label: 'RW', x: 80, y: 24 }
  ];
}
