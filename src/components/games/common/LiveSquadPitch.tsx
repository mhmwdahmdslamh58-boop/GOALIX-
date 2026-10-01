import React, { useState } from 'react';
import { Player, PositionType, GameMode } from '../../../types/game';
import { getPositionLabelAr } from '../../../services/positions';
import { Shield, User, Bot, Sparkles, Check, ChevronRight } from 'lucide-react';

interface LiveSquadPitchProps {
  p1Name: string;
  p2Name: string;
  p1Squad: Player[];
  p2Squad: Player[];
  positions: PositionType[];
  currentRoundIndex: number;
  mode: GameMode;
  isCpu?: boolean;
}

export const LiveSquadPitch: React.FC<LiveSquadPitchProps> = ({
  p1Name,
  p2Name,
  p1Squad,
  p2Squad,
  positions,
  currentRoundIndex,
  isCpu = false
}) => {
  const [activeTab, setActiveTab] = useState<'p1' | 'p2'>('p1');

  // Calculate Average OVR for each squad
  const p1Avg = p1Squad.length > 0 
    ? Math.round(p1Squad.reduce((acc, p) => acc + p.ovr, 0) / p1Squad.length) 
    : 0;

  const p2Avg = p2Squad.length > 0 
    ? Math.round(p2Squad.reduce((acc, p) => acc + p.ovr, 0) / p2Squad.length) 
    : 0;

  const currentActiveSquad = activeTab === 'p1' ? p1Squad : p2Squad;
  const currentActiveName = activeTab === 'p1' ? p1Name : p2Name;

  return (
    <div className="w-full bg-[#0b0d13]/90 border border-zinc-800/80 rounded-2xl p-3 shadow-lg select-none font-tajawal space-y-2.5">
      {/* Top Header: Team Switcher & Live Stats */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <h4 className="text-xs font-black text-white font-tajawal">
            التشكيلة الحية للمباراة
          </h4>
        </div>

        {/* Team Selector Tabs */}
        <div className="flex items-center gap-1 bg-black/60 p-0.5 rounded-xl border border-zinc-800">
          <button
            type="button"
            onClick={() => setActiveTab('p1')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              activeTab === 'p1'
                ? 'bg-amber-500 text-black shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <User className="w-3 h-3" />
            <span className="truncate max-w-[80px]">{p1Name}</span>
            {p1Avg > 0 && (
              <span className="text-[10px] font-chakra font-black px-1 rounded bg-black/30 text-current">
                {p1Avg}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('p2')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              activeTab === 'p2'
                ? 'bg-amber-500 text-black shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            {isCpu ? <Bot className="w-3 h-3" /> : <User className="w-3 h-3" />}
            <span className="truncate max-w-[80px]">{p2Name}</span>
            {p2Avg > 0 && (
              <span className="text-[10px] font-chakra font-black px-1 rounded bg-black/30 text-current">
                {p2Avg}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* MINI FOOTBALL PITCH WITH LIVE SLOTS */}
      <div className="relative w-full rounded-xl bg-gradient-to-b from-[#0e2718] via-[#091a10] to-[#040d07] border border-emerald-500/20 p-2.5 overflow-hidden shadow-inner">
        {/* Pitch Field Markings */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="w-full h-full border border-white/40" />
          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[1px] bg-white/40" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full border border-white/40" />
        </div>

        {/* Live Position Slots Row */}
        <div className="relative z-10 grid grid-flow-col auto-cols-fr gap-1.5 items-center justify-center">
          {positions.map((pos, idx) => {
            const player = currentActiveSquad[idx];
            const isCurrentRound = idx === currentRoundIndex;
            const isFilled = !!player;

            return (
              <div
                key={idx}
                className={`relative flex flex-col items-center justify-between rounded-xl p-1.5 transition-all text-center min-w-[56px] ${
                  isCurrentRound
                    ? 'bg-amber-500/15 border-2 border-amber-400 shadow-[0_0_12px_rgba(212,175,55,0.4)] scale-105'
                    : isFilled
                    ? 'bg-black/60 border border-emerald-500/50'
                    : 'bg-black/40 border border-zinc-700/60 opacity-60'
                }`}
              >
                {/* Current Round Indicator Badge */}
                {isCurrentRound && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-amber-400 text-black text-[8px] font-chakra font-black px-1.5 py-0.2 rounded-full uppercase shadow">
                    الآن
                  </span>
                )}

                {/* Player Card or Position Icon */}
                {player ? (
                  <div className="w-full flex flex-col items-center space-y-0.5">
                    {/* Player Image / Avatar */}
                    <div className="w-9 h-9 rounded-lg overflow-hidden border border-amber-400/60 bg-zinc-900 shadow">
                      <img
                        src={player.image}
                        alt={player.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {/* Player Name */}
                    <span className="text-[10px] font-bold text-white truncate max-w-[54px] block">
                      {player.name}
                    </span>
                    {/* OVR Rating */}
                    <span className="text-[9px] font-chakra font-black text-amber-300 bg-black/60 px-1 rounded border border-amber-400/30">
                      {player.ovr} OVR
                    </span>
                  </div>
                ) : (
                  <div className="w-full flex flex-col items-center py-1 space-y-1">
                    {/* Empty Slot Silhouette */}
                    <div
                      className={`w-9 h-9 rounded-lg border-2 border-dashed flex items-center justify-center ${
                        isCurrentRound
                          ? 'border-amber-400 text-amber-400 animate-pulse'
                          : 'border-zinc-600 text-zinc-500'
                      }`}
                    >
                      <span className="font-chakra font-black text-xs">{pos}</span>
                    </div>
                    <span className="text-[9px] text-zinc-400 font-tajawal">
                      {getPositionLabelAr(pos)}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Info: Completed Count & Hint */}
      <div className="flex items-center justify-between text-[11px] text-zinc-400 px-1">
        <span>
          مكتمل: <strong className="text-white font-chakra">{currentActiveSquad.length}</strong> / {positions.length}
        </span>
        <span className="text-amber-300 font-tajawal text-[10px]">
          فريق: {currentActiveName}
        </span>
      </div>
    </div>
  );
};
