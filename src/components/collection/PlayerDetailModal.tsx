import React from 'react';
import { Player } from '../../types/game';
import { PlayerCard } from '../common/PlayerCard';
import { GoldButton } from '../common/GoldButton';
import { sounds } from '../../services/audio';
import { X, Plus, Shield } from 'lucide-react';

interface PlayerDetailModalProps {
  player: Player | null;
  onClose: () => void;
  onAddToSquad?: (player: Player) => void;
}

export const PlayerDetailModal: React.FC<PlayerDetailModalProps> = ({
  player,
  onClose,
  onAddToSquad
}) => {
  if (!player) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="max-w-sm w-full bg-[#111317] border border-amber-500/40 rounded-2xl p-5 shadow-2xl relative flex flex-col items-center">
        {/* Close Button */}
        <button
          onClick={() => {
            sounds.playTap();
            onClose();
          }}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-zinc-800 text-zinc-400 hover:text-zinc-200"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Card Component */}
        <div className="my-2">
          <PlayerCard player={player} size="lg" showStats={true} />
        </div>

        {/* Detailed Stats Bars */}
        <div className="w-full bg-black/40 rounded-xl p-3 border border-zinc-800 space-y-2 mt-2">
          <div className="flex justify-between text-xs text-zinc-400 font-tajawal pb-1 border-b border-zinc-800">
            <span>النادي: <b className="text-zinc-200">{player.club}</b></span>
            <span>الدوري: <b className="text-zinc-200">{player.league}</b></span>
          </div>

          <div className="space-y-1.5 font-chakra text-xs">
            {[
              { label: 'السرعة (PAC)', val: player.stats.pac },
              { label: 'التسديد (SHO)', val: player.stats.sho },
              { label: 'التمرير (PAS)', val: player.stats.pas },
              { label: 'المراوغة (DRI)', val: player.stats.dri },
              { label: 'الدفاع (DEF)', val: player.stats.def },
              { label: 'البدنية (PHY)', val: player.stats.phy }
            ].map(st => (
              <div key={st.label} className="space-y-0.5">
                <div className="flex justify-between text-[11px] text-zinc-300">
                  <span className="font-tajawal">{st.label}</span>
                  <span className="font-bold text-amber-400">{st.val}</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    style={{ width: `${Math.min(100, (st.val / 105) * 100)}%` }}
                    className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {onAddToSquad && (
          <GoldButton
            onClick={() => {
              sounds.playTap();
              onAddToSquad(player);
              onClose();
            }}
            fullWidth
            size="md"
            className="mt-4"
          >
            <Plus className="w-4 h-4" />
            إضافة إلى التشكيلة الأساسية
          </GoldButton>
        )}
      </div>
    </div>
  );
};
