import React from 'react';
import { Player, FormationType, PositionType } from '../../types/game';
import { Shield } from 'lucide-react';

interface PitchTacticsProps {
  formation: FormationType;
  players: (Player | null)[];
  onSlotClick?: (index: number) => void;
  selectedSlot?: number | null;
  interactive?: boolean;
}

// Normalized coordinate layout for formations (x: 0-100 left-right, y: 0-100 top-bottom from ATT to GK)
const FORMATION_LAYOUTS: Record<FormationType, { pos: PositionType; label: string; x: number; y: number }[]> = {
  '4-3-3': [
    { pos: 'GK', label: 'GK', x: 50, y: 88 },
    { pos: 'DEF', label: 'LB', x: 18, y: 70 },
    { pos: 'DEF', label: 'CB', x: 38, y: 73 },
    { pos: 'DEF', label: 'CB', x: 62, y: 73 },
    { pos: 'DEF', label: 'RB', x: 82, y: 70 },
    { pos: 'MID', label: 'CM', x: 26, y: 48 },
    { pos: 'MID', label: 'CDM', x: 50, y: 53 },
    { pos: 'MID', label: 'CM', x: 74, y: 48 },
    { pos: 'ATT', label: 'LW', x: 20, y: 22 },
    { pos: 'ATT', label: 'ST', x: 50, y: 16 },
    { pos: 'ATT', label: 'RW', x: 80, y: 22 }
  ],
  '4-4-2': [
    { pos: 'GK', label: 'GK', x: 50, y: 88 },
    { pos: 'DEF', label: 'LB', x: 18, y: 70 },
    { pos: 'DEF', label: 'CB', x: 38, y: 73 },
    { pos: 'DEF', label: 'CB', x: 62, y: 73 },
    { pos: 'DEF', label: 'RB', x: 82, y: 70 },
    { pos: 'MID', label: 'LM', x: 18, y: 46 },
    { pos: 'MID', label: 'CM', x: 38, y: 50 },
    { pos: 'MID', label: 'CM', x: 62, y: 50 },
    { pos: 'MID', label: 'RM', x: 82, y: 46 },
    { pos: 'ATT', label: 'ST', x: 36, y: 18 },
    { pos: 'ATT', label: 'ST', x: 64, y: 18 }
  ],
  '4-2-3-1': [
    { pos: 'GK', label: 'GK', x: 50, y: 88 },
    { pos: 'DEF', label: 'LB', x: 18, y: 72 },
    { pos: 'DEF', label: 'CB', x: 38, y: 75 },
    { pos: 'DEF', label: 'CB', x: 62, y: 75 },
    { pos: 'DEF', label: 'RB', x: 82, y: 72 },
    { pos: 'MID', label: 'CDM', x: 35, y: 56 },
    { pos: 'MID', label: 'CDM', x: 65, y: 56 },
    { pos: 'MID', label: 'LAM', x: 22, y: 35 },
    { pos: 'MID', label: 'CAM', x: 50, y: 33 },
    { pos: 'MID', label: 'RAM', x: 78, y: 35 },
    { pos: 'ATT', label: 'ST', x: 50, y: 15 }
  ],
  '3-5-2': [
    { pos: 'GK', label: 'GK', x: 50, y: 88 },
    { pos: 'DEF', label: 'CB', x: 25, y: 73 },
    { pos: 'DEF', label: 'CB', x: 50, y: 75 },
    { pos: 'DEF', label: 'CB', x: 75, y: 73 },
    { pos: 'MID', label: 'LWB', x: 15, y: 50 },
    { pos: 'MID', label: 'CM', x: 36, y: 52 },
    { pos: 'MID', label: 'CAM', x: 50, y: 40 },
    { pos: 'MID', label: 'CM', x: 64, y: 52 },
    { pos: 'MID', label: 'RWB', x: 85, y: 50 },
    { pos: 'ATT', label: 'ST', x: 36, y: 18 },
    { pos: 'ATT', label: 'ST', x: 64, y: 18 }
  ],
  '5-3-2': [
    { pos: 'GK', label: 'GK', x: 50, y: 88 },
    { pos: 'DEF', label: 'LWB', x: 14, y: 68 },
    { pos: 'DEF', label: 'CB', x: 32, y: 74 },
    { pos: 'DEF', label: 'CB', x: 50, y: 76 },
    { pos: 'DEF', label: 'CB', x: 68, y: 74 },
    { pos: 'DEF', label: 'RWB', x: 86, y: 68 },
    { pos: 'MID', label: 'CM', x: 28, y: 48 },
    { pos: 'MID', label: 'CM', x: 50, y: 52 },
    { pos: 'MID', label: 'CM', x: 72, y: 48 },
    { pos: 'ATT', label: 'ST', x: 36, y: 18 },
    { pos: 'ATT', label: 'ST', x: 64, y: 18 }
  ]
};

export const PitchTactics: React.FC<PitchTacticsProps> = ({
  formation,
  players,
  onSlotClick,
  selectedSlot,
  interactive = true
}) => {
  const layout = FORMATION_LAYOUTS[formation] || FORMATION_LAYOUTS['4-3-3'];

  return (
    <div className="relative w-full aspect-[4/5] max-w-md mx-auto tactical-pitch rounded-2xl overflow-hidden shadow-2xl p-2 select-none border border-emerald-900/50">
      {/* 2D Pitch Line Markings */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" xmlns="http://www.w3.org/2000/svg">
        {/* Outer boundary */}
        <rect x="5%" y="4%" width="90%" height="92%" fill="none" stroke="#ffffff" strokeWidth="1.5" />
        {/* Center line */}
        <line x1="5%" y1="50%" x2="95%" y2="50%" stroke="#ffffff" strokeWidth="1.5" />
        {/* Center circle */}
        <circle cx="50%" cy="50%" r="14%" fill="none" stroke="#ffffff" strokeWidth="1.5" />
        <circle cx="50%" cy="50%" r="1.5%" fill="#ffffff" />
        {/* Top penalty box */}
        <rect x="25%" y="4%" width="50%" height="16%" fill="none" stroke="#ffffff" strokeWidth="1.5" />
        <rect x="35%" y="4%" width="30%" height="6%" fill="none" stroke="#ffffff" strokeWidth="1.5" />
        {/* Bottom penalty box */}
        <rect x="25%" y="80%" width="50%" height="16%" fill="none" stroke="#ffffff" strokeWidth="1.5" />
        <rect x="35%" y="90%" width="30%" height="6%" fill="none" stroke="#ffffff" strokeWidth="1.5" />
      </svg>

      {/* Players on Pitch */}
      {layout.map((slot, index) => {
        const player = players[index] || null;
        const isSelected = selectedSlot === index;

        return (
          <div
            key={index}
            onClick={() => interactive && onSlotClick?.(index)}
            style={{
              position: 'absolute',
              left: `${slot.x}%`,
              top: `${slot.y}%`,
              transform: 'translate(-50%, -50%)'
            }}
            className={`flex flex-col items-center justify-center transition-transform cursor-pointer ${
              isSelected ? 'scale-115 z-20' : 'hover:scale-105 z-10'
            }`}
          >
            {/* Player Token (Not giant cards as required) */}
            <div
              className={`relative w-11 h-11 rounded-full p-[2px] transition-all ${
                isSelected
                  ? 'ring-2 ring-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.8)]'
                  : 'shadow-md shadow-black/60'
              } ${
                player
                  ? player.cardType === 'ICON'
                    ? 'bg-gradient-to-tr from-amber-400 via-yellow-200 to-amber-600'
                    : player.cardType === 'ELITE'
                    ? 'bg-gradient-to-tr from-amber-600 to-amber-400'
                    : 'bg-gradient-to-tr from-zinc-600 to-zinc-400'
                  : 'bg-zinc-800/80 border border-dashed border-zinc-500'
              }`}
            >
              <div className="w-full h-full rounded-full bg-zinc-900 overflow-hidden flex items-center justify-center relative">
                {player ? (
                  player.image ? (
                    <img
                      src={player.image}
                      alt={player.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-top"
                    />
                  ) : (
                    <Shield className="w-5 h-5 text-amber-400" />
                  )
                ) : (
                  <span className="text-[10px] font-chakra font-bold text-zinc-400">
                    {slot.label}
                  </span>
                )}

                {/* Micro OVR Badge */}
                {player && (
                  <div className="absolute -top-1 -right-1 bg-black/90 text-amber-300 font-chakra font-black text-[9px] px-1 rounded-sm border border-amber-500/40">
                    {player.ovr}
                  </div>
                )}
              </div>
            </div>

            {/* Micro Player Name label */}
            <div className="mt-1 px-1.5 py-0.5 rounded bg-black/75 backdrop-blur-xs border border-white/10 max-w-[70px] text-center shadow">
              <p className="text-[10px] font-tajawal font-medium text-zinc-200 truncate leading-none">
                {player ? player.name.split(' ').pop() : slot.label}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
