import React, { useState } from 'react';
import { Player } from '../../types/game';
import { Shield } from 'lucide-react';

interface PlayerCardProps {
  player: Player;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  showStats?: boolean;
  highlighted?: boolean;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  size = 'md',
  onClick,
  showStats = true,
  highlighted = false
}) => {
  const [imgError, setImgError] = useState(false);

  const tierStyles = {
    WEEKLY: {
      border: 'border-zinc-700/80 hover:border-amber-400/60',
      bg: 'bg-gradient-to-b from-zinc-800 via-zinc-900 to-zinc-950',
      ovrBadge: 'bg-zinc-800 text-zinc-100 border border-zinc-600',
      accent: '#a1a1aa'
    },
    ELITE: {
      border: 'border-amber-500/70 hover:border-amber-400 shadow-[0_0_15px_rgba(212,175,55,0.2)]',
      bg: 'bg-gradient-to-b from-[#241c09] via-[#15120a] to-[#0c0a06]',
      ovrBadge: 'bg-gradient-to-b from-amber-400 to-amber-600 text-zinc-950 font-black border border-amber-300',
      accent: '#f59e0b'
    },
    ICON: {
      border: 'border-amber-300 hover:border-yellow-200 shadow-[0_0_20px_rgba(252,226,137,0.3)]',
      bg: 'bg-gradient-to-b from-[#2b220d] via-[#1a1408] to-[#090805]',
      ovrBadge: 'bg-gradient-to-b from-yellow-300 via-amber-400 to-amber-600 text-black font-black border border-amber-200',
      accent: '#fce289'
    }
  }[player.cardType || 'WEEKLY'];

  const containerSizes = {
    sm: 'w-28 h-40 text-xs',
    md: 'w-44 h-64 text-sm',
    lg: 'w-60 h-84 text-base'
  }[size];

  const imgSrc = player.image || `/players/${player.id}.jpg`;

  return (
    <div
      onClick={onClick}
      className={`relative select-none rounded-2xl p-2.5 transition-all duration-200 overflow-hidden flex flex-col justify-between cursor-pointer border ${tierStyles.border} ${tierStyles.bg} ${containerSizes} ${
        highlighted ? 'ring-2 ring-amber-400 scale-[1.02]' : ''
      }`}
    >
      {/* Subtle background texture lines */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_20%,#ffffff,transparent_60%)] pointer-events-none" />

      {/* Top Header: OVR + Position & Nationality */}
      <div className="relative z-10 flex items-start justify-between">
        <div className="flex flex-col items-center">
          <span
            className={`font-chakra font-black tracking-tighter rounded-md px-1.5 py-0.5 text-center leading-none tabular-nums ${
              size === 'sm' ? 'text-sm' : size === 'md' ? 'text-lg' : 'text-2xl'
            } ${tierStyles.ovrBadge}`}
          >
            {player.ovr}
          </span>
          <span className={`font-chakra font-bold text-zinc-300 mt-1 uppercase ${size === 'sm' ? 'text-[10px]' : 'text-xs'}`}>
            {player.detailedPosition || player.position}
          </span>
        </div>

        <div className="flex flex-col items-end gap-1">
          <span className="text-base select-none leading-none" title={player.nationality}>
            {player.flag || '⚽'}
          </span>
          <span className="text-[10px] text-zinc-400 truncate max-w-[75px] font-tajawal" title={player.club}>
            {player.club}
          </span>
        </div>
      </div>

      {/* Player Portrait with Resilient Fallback */}
      <div className="relative z-10 flex-1 flex items-center justify-center my-1 overflow-hidden rounded-xl bg-black/30">
        {!imgError && imgSrc ? (
          <img
            src={imgSrc}
            alt={player.name}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover object-top rounded-xl filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)]"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-amber-500/15 to-black/60 border border-amber-500/30 rounded-xl p-2 text-center">
            <Shield className="w-10 h-10 text-amber-400 mb-1" />
            <span className="font-chakra font-bold text-xs text-amber-300">{player.position}</span>
          </div>
        )}
      </div>

      {/* Player Name Banner */}
      <div className="relative z-10 text-center border-t border-white/10 pt-1.5">
        <h4 className={`font-bold font-tajawal text-zinc-100 truncate ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
          {player.name}
        </h4>
        <div className="flex items-center justify-center gap-1 text-[10px] text-amber-400/90 font-mono">
          <span>{player.cardType}</span>
          <span>·</span>
          <span className="truncate max-w-[85px]">{player.league || player.season || '2025'}</span>
        </div>
      </div>

      {/* 6 Core Stats (PAC, SHO, PAS, DRI, DEF, PHY) */}
      {showStats && size !== 'sm' && (
        <div className="relative z-10 grid grid-cols-6 gap-0.5 text-center mt-1.5 pt-1 border-t border-white/10 bg-black/30 rounded-lg py-1 font-chakra tabular-nums">
          <div>
            <div className="text-[9px] text-zinc-400">PAC</div>
            <div className="text-xs font-bold text-zinc-200">{player.stats.pac}</div>
          </div>
          <div>
            <div className="text-[9px] text-zinc-400">SHO</div>
            <div className="text-xs font-bold text-zinc-200">{player.stats.sho}</div>
          </div>
          <div>
            <div className="text-[9px] text-zinc-400">PAS</div>
            <div className="text-xs font-bold text-zinc-200">{player.stats.pas}</div>
          </div>
          <div>
            <div className="text-[9px] text-zinc-400">DRI</div>
            <div className="text-xs font-bold text-zinc-200">{player.stats.dri}</div>
          </div>
          <div>
            <div className="text-[9px] text-zinc-400">DEF</div>
            <div className="text-xs font-bold text-zinc-200">{player.stats.def}</div>
          </div>
          <div>
            <div className="text-[9px] text-zinc-400">PHY</div>
            <div className="text-xs font-bold text-zinc-200">{player.stats.phy}</div>
          </div>
        </div>
      )}
    </div>
  );
};
