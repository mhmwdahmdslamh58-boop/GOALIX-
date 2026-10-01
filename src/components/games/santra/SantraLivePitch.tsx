import React, { useState, useEffect } from 'react';
import { Player, PositionType, GameMode } from '../../../types/game';
import { getTacticalSlotsForMode, TacticalSlotCoord, getPositionLabelAr } from '../../../services/positions';
import { Users, Eye } from 'lucide-react';

interface SantraLivePitchProps {
  mode: GameMode;
  currentRoundPosition: PositionType;
  player1Name: string;
  player2Name: string;
  p1Squad: Player[];
  p2Squad: Player[];
  activeHighlightPlayerId?: string | null;
  activeTurn?: 'p1' | 'p2';
}

export const SantraLivePitch: React.FC<SantraLivePitchProps> = ({
  mode,
  currentRoundPosition,
  player1Name,
  player2Name,
  p1Squad,
  p2Squad,
  activeHighlightPlayerId,
  activeTurn = 'p1'
}) => {
  const [activeTab, setActiveTab] = useState<'p1' | 'p2'>(activeTurn);
  const [viewMode, setViewMode] = useState<'single' | 'both'>('single');
  const slots: TacticalSlotCoord[] = getTacticalSlotsForMode(mode);

  // Sync active tab with active turn unless manually switched during inactive phase
  useEffect(() => {
    setActiveTab(activeTurn);
  }, [activeTurn]);

  const currentSquad = activeTab === 'p1' ? p1Squad : p2Squad;
  const currentTeamName = activeTab === 'p1' ? player1Name : player2Name;

  const renderPitchForSquad = (squad: Player[], teamName: string, isP1: boolean) => {
    return (
      <div className="relative w-full aspect-[16/11] rounded-2xl tactical-pitch overflow-hidden border border-emerald-800/80 p-2 shadow-2xl select-none bg-gradient-to-b from-[#0c281e] via-[#091f17] to-[#071711]">
        {/* Striped grass pitch texture overlay */}
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.25)_0px,rgba(0,0,0,0.25)_24px,transparent_24px,transparent_48px)]" />

        {/* Pitch line markings */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-35" xmlns="http://www.w3.org/2000/svg">
          <rect x="3%" y="3%" width="94%" height="94%" fill="none" stroke="#ffffff" strokeWidth="1.2" />
          <line x1="3%" y1="50%" x2="97%" y2="50%" stroke="#ffffff" strokeWidth="1.2" />
          <circle cx="50%" cy="50%" r="16%" fill="none" stroke="#ffffff" strokeWidth="1.2" />
          <circle cx="50%" cy="50%" r="1.5%" fill="#ffffff" />
          {/* Top Penalty Box */}
          <rect x="24%" y="3%" width="52%" height="16%" fill="none" stroke="#ffffff" strokeWidth="1.2" />
          <rect x="36%" y="3%" width="28%" height="6%" fill="none" stroke="#ffffff" strokeWidth="1.2" />
          {/* Bottom Penalty Box (Goal keeper area) */}
          <rect x="24%" y="81%" width="52%" height="16%" fill="none" stroke="#ffffff" strokeWidth="1.2" />
          <rect x="36%" y="91%" width="28%" height="6%" fill="none" stroke="#ffffff" strokeWidth="1.2" />
          {/* Corner arcs */}
          <path d="M 3% 6% A 3% 3% 0 0 0 6% 3%" stroke="#ffffff" strokeWidth="1.2" fill="none" />
          <path d="M 94% 3% A 3% 3% 0 0 0 97% 6%" stroke="#ffffff" strokeWidth="1.2" fill="none" />
          <path d="M 3% 94% A 3% 3% 0 0 0 6% 97%" stroke="#ffffff" strokeWidth="1.2" fill="none" />
          <path d="M 94% 97% A 3% 3% 0 0 0 97% 94%" stroke="#ffffff" strokeWidth="1.2" fill="none" />
        </svg>

        {/* Team Watermark on Pitch */}
        <div className="absolute top-2 right-3 pointer-events-none text-right">
          <span className="text-[11px] font-tajawal font-bold text-emerald-300/80 px-2 py-0.5 bg-black/40 rounded-lg backdrop-blur-xs border border-emerald-500/20">
            {teamName} ({squad.length}/{slots.length})
          </span>
        </div>

        {/* Tactical Slots with Real Player Data */}
        {slots.map((slot) => {
          const player = squad[slot.index] || null;
          const isCurrentActiveRoundSlot = slot.position === currentRoundPosition && !player;
          const isNewlyAdded = player && player.id === activeHighlightPlayerId;

          return (
            <div
              key={slot.index}
              style={{
                position: 'absolute',
                left: `${slot.x}%`,
                top: `${slot.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
              className="flex flex-col items-center justify-center transition-all duration-300"
            >
              {/* Player Token or Slot Marker */}
              <div
                className={`relative rounded-full p-[2px] transition-all duration-300 ${
                  isNewlyAdded
                    ? 'ring-4 ring-amber-400 scale-120 z-30 shadow-[0_0_20px_rgba(251,191,36,0.9)] animate-pulse'
                    : isCurrentActiveRoundSlot
                    ? 'ring-2 ring-amber-400/90 animate-pulse scale-110 z-20 shadow-[0_0_12px_rgba(251,191,36,0.6)]'
                    : 'shadow-md shadow-black/80'
                }`}
              >
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden flex items-center justify-center relative border ${
                    player
                      ? player.cardType === 'ICON'
                        ? 'border-yellow-300 bg-black'
                        : player.cardType === 'ELITE'
                        ? 'border-amber-400 bg-black'
                        : 'border-zinc-500 bg-zinc-950'
                      : isCurrentActiveRoundSlot
                      ? 'border-amber-400 border-dashed bg-amber-500/20'
                      : 'border-zinc-700/80 border-dashed bg-zinc-900/70'
                  }`}
                >
                  {player ? (
                    <img
                      src={player.image || `/players/${player.id}.jpg`}
                      alt={player.name}
                      className="w-full h-full object-cover object-top"
                    />
                  ) : (
                    <span className={`text-[10px] font-chakra font-black ${isCurrentActiveRoundSlot ? 'text-amber-300' : 'text-zinc-500'}`}>
                      {slot.label}
                    </span>
                  )}

                  {/* OVR Badge */}
                  {player && (
                    <div className="absolute -top-1 -right-1 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-chakra font-black text-[8px] sm:text-[9px] px-1 py-0.2 rounded-sm border border-amber-300 shadow leading-none">
                      {player.ovr}
                    </div>
                  )}
                </div>
              </div>

              {/* Player Name & Position Label Container */}
              <div className="mt-0.5 px-1 py-0.2 rounded bg-black/85 backdrop-blur-xs border border-white/10 max-w-[68px] sm:max-w-[76px] text-center shadow flex flex-col items-center">
                <span className="text-[7.5px] sm:text-[8px] font-chakra font-bold text-amber-400 leading-none">
                  {player ? (player.detailedPosition || player.position) : slot.label}
                </span>
                <p className="text-[8.5px] sm:text-[9.5px] font-tajawal font-medium text-zinc-100 truncate leading-none mt-0.5 max-w-[64px] sm:max-w-[72px]">
                  {player ? player.name.split(' ').pop() : isCurrentActiveRoundSlot ? 'المركز الحالي' : slot.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-zinc-900/95 rounded-2xl p-3 border border-zinc-800 shadow-xl space-y-2.5">
      {/* Top Header & Team Controls */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <h4 className="text-xs font-bold font-tajawal text-zinc-200">
            تشكيلة الملعب الحية (Live 2D Formation)
          </h4>
        </div>

        {/* View Switcher: Single Tab or Both Pitches */}
        <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-zinc-800">
          <button
            onClick={() => {
              setViewMode('single');
              setActiveTab('p1');
            }}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-tajawal font-bold transition-all ${
              viewMode === 'single' && activeTab === 'p1'
                ? 'bg-amber-500 text-black shadow'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {player1Name} ({p1Squad.length}/{slots.length})
          </button>
          <button
            onClick={() => {
              setViewMode('single');
              setActiveTab('p2');
            }}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-tajawal font-bold transition-all ${
              viewMode === 'single' && activeTab === 'p2'
                ? 'bg-amber-500 text-black shadow'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {player2Name} ({p2Squad.length}/{slots.length})
          </button>
          <button
            onClick={() => setViewMode(viewMode === 'both' ? 'single' : 'both')}
            title="عرض الفريقين معاً"
            className={`p-1 rounded-lg text-[11px] font-tajawal transition-all ${
              viewMode === 'both'
                ? 'bg-amber-500 text-black shadow'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Render Pitch Views */}
      {viewMode === 'single' ? (
        renderPitchForSquad(currentSquad, currentTeamName, activeTab === 'p1')
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {renderPitchForSquad(p1Squad, player1Name, true)}
          {renderPitchForSquad(p2Squad, player2Name, false)}
        </div>
      )}

      {/* Footer Legend */}
      <div className="flex items-center justify-between text-[10px] text-zinc-400 font-tajawal pt-1 border-t border-zinc-800/80 px-1">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full border border-amber-400 bg-amber-500/30" />
          <span>المركز النشط للجولة: <strong className="text-amber-300">{currentRoundPosition}</strong> ({getPositionLabelAr(currentRoundPosition)})</span>
        </div>
        <span className="text-zinc-500 font-mono">
          {activeTab === 'p1' ? player1Name : player2Name}
        </span>
      </div>
    </div>
  );
};
