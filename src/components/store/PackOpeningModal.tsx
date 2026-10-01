import React, { useState, useEffect } from 'react';
import { Player, CardTier } from '../../types/game';
import { PlayerCard } from '../common/PlayerCard';
import { GoldButton } from '../common/GoldButton';
import { sounds } from '../../services/audio';
import confetti from 'canvas-confetti';
import { Sparkles, FastForward, Check, Shield, ArrowRight } from 'lucide-react';

interface PackOpeningModalProps {
  tier: CardTier;
  rewardPlayer: Player;
  onAddToSquad: (player: Player) => void;
  onAddToBench: (player: Player) => void;
  onClose: () => void;
}

type WalkoutStage = 
  | 'PACK_3D_ROTATING'
  | 'PACK_OPENING'
  | 'FOG_SILHOUETTE'
  | 'REVEAL_INFO'
  | 'FULL_CARD_SHOWCASE';

export const PackOpeningModal: React.FC<PackOpeningModalProps> = ({
  tier,
  rewardPlayer,
  onAddToSquad,
  onAddToBench,
  onClose
}) => {
  const [stage, setStage] = useState<WalkoutStage>('PACK_3D_ROTATING');

  const packData = {
    WEEKLY: {
      name: 'WEEKLY PACK',
      glow: 'shadow-[0_0_30px_rgba(161,161,170,0.3)]',
      border: 'border-zinc-500/50',
      gradient: 'from-zinc-700 via-zinc-800 to-zinc-950',
      textColor: 'text-zinc-200'
    },
    ELITE: {
      name: 'ELITE RUSH',
      glow: 'shadow-[0_0_40px_rgba(212,175,55,0.4)]',
      border: 'border-amber-500/80',
      gradient: 'from-amber-700 via-[#1e1707] to-zinc-950',
      textColor: 'text-amber-400'
    },
    ICON: {
      name: 'ICON LEGACY',
      glow: 'shadow-[0_0_60px_rgba(252,226,137,0.6)]',
      border: 'border-yellow-300',
      gradient: 'from-amber-400 via-[#2f2208] to-black',
      textColor: 'text-yellow-300'
    }
  }[tier];

  // Progressive sequence timer
  useEffect(() => {
    sounds.playPackTension();

    // Stage 1 -> 2: Opening after 1.5s
    const t1 = setTimeout(() => {
      setStage('PACK_OPENING');
      sounds.playWhistle();
    }, 1500);

    // Stage 2 -> 3: Silhouette after 2.6s
    const t2 = setTimeout(() => {
      setStage('FOG_SILHOUETTE');
    }, 2600);

    // Stage 3 -> 4: Reveal Info (Flag, Position, OVR) after 3.8s
    const t3 = setTimeout(() => {
      setStage('REVEAL_INFO');
      sounds.playReveal();
    }, 3800);

    // Stage 4 -> 5: Full Player Card Showcase after 5.0s
    const t4 = setTimeout(() => {
      setStage('FULL_CARD_SHOWCASE');
      sounds.playGoalHorn();
      confetti({
        particleCount: tier === 'ICON' ? 120 : tier === 'ELITE' ? 80 : 50,
        spread: 70,
        origin: { y: 0.6 }
      });
    }, 5000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [tier]);

  const handleSkip = () => {
    sounds.playReveal();
    setStage('FULL_CARD_SHOWCASE');
    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.6 }
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 select-none overflow-hidden">
      {/* Skip button in corner */}
      {stage !== 'FULL_CARD_SHOWCASE' && (
        <button
          onClick={handleSkip}
          className="absolute top-6 left-6 z-50 flex items-center gap-1 px-3 py-1.5 rounded-full bg-zinc-900/80 border border-zinc-700 text-xs font-tajawal text-zinc-300 hover:text-amber-300 active:scale-95 transition-all"
        >
          <FastForward className="w-3.5 h-3.5" />
          <span>تخطي الرسوم (Skip)</span>
        </button>
      )}

      {/* Atmospheric lighting backdrop */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.12),transparent_70%)] pointer-events-none" />

      {/* ================= 1 & 2: 3D PACK ROTATION & OPENING ================= */}
      {(stage === 'PACK_3D_ROTATING' || stage === 'PACK_OPENING') && (
        <div className="flex flex-col items-center justify-center text-center space-y-6">
          <div
            className={`w-52 h-72 rounded-3xl p-5 border-2 ${packData.border} bg-gradient-to-b ${packData.gradient} ${packData.glow} flex flex-col justify-between items-center transition-all duration-700 ${
              stage === 'PACK_3D_ROTATING'
                ? 'animate-[bounce_3s_infinite] scale-100'
                : 'scale-125 opacity-0 blur-sm'
            }`}
          >
            <span className="font-chakra font-black text-amber-400 text-xs tracking-widest uppercase">
              GOALIX PACKS
            </span>

            <div className="w-20 h-20 rounded-full border border-amber-400/50 bg-black/40 flex items-center justify-center shadow-inner">
              <Sparkles className="w-10 h-10 text-amber-300 animate-spin" />
            </div>

            <div>
              <h3 className={`font-chakra font-black text-lg ${packData.textColor}`}>
                {packData.name}
              </h3>
              <p className="text-[10px] text-zinc-400 font-tajawal">حزمة كروية ممتازة</p>
            </div>
          </div>

          <p className="font-tajawal text-xs text-zinc-400 animate-pulse">
            جاري فتح الحزمة واستدعاء اللاعب...
          </p>
        </div>
      )}

      {/* ================= 3: GOLD VAULT BURST & REAL PLAYER TEASER ================= */}
      {stage === 'FOG_SILHOUETTE' && (
        <div className="flex flex-col items-center justify-center space-y-4 animate-fade-in">
          <div className="w-48 h-64 rounded-3xl bg-black/90 border-2 border-amber-400 p-4 flex flex-col items-center justify-center shadow-[0_0_50px_rgba(212,175,55,0.6)] relative overflow-hidden">
            <div className="w-32 h-32 rounded-2xl overflow-hidden border-2 border-amber-400/80 shadow-2xl relative">
              <img
                src={rewardPlayer.image || `/players/${rewardPlayer.id}.jpg`}
                alt={rewardPlayer.name}
                className="w-full h-full object-cover object-top filter brightness-95"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
            <div className="absolute inset-x-0 bottom-4 text-center">
              <span className="text-xs font-chakra font-black text-amber-400 tracking-widest uppercase">
                {rewardPlayer.cardType} REVEAL
              </span>
            </div>
          </div>
          <span className="text-xs font-tajawal text-amber-300 font-bold animate-pulse">
            كشف هوية اللاعب الحقيقي...
          </span>
        </div>
      )}

      {/* ================= 4: REVEAL INFO (Position, Nationality, OVR) ================= */}
      {stage === 'REVEAL_INFO' && (
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="flex items-center gap-4 text-center">
            {/* Nationality */}
            <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-4 w-24">
              <span className="text-3xl block">{rewardPlayer.flag || '⚽'}</span>
              <span className="text-[10px] text-zinc-400 font-tajawal mt-1 block">الجنسية</span>
            </div>

            {/* Position */}
            <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-4 w-24">
              <span className="text-2xl font-chakra font-black text-amber-400 block">
                {rewardPlayer.detailedPosition || rewardPlayer.position}
              </span>
              <span className="text-[10px] text-zinc-400 font-tajawal mt-1 block">المركز</span>
            </div>

            {/* Club */}
            <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-4 w-24">
              <span className="text-xs font-bold text-zinc-200 block truncate">
                {rewardPlayer.club}
              </span>
              <span className="text-[10px] text-zinc-400 font-tajawal mt-1 block">النادي</span>
            </div>
          </div>
          <p className="text-sm font-chakra font-black text-amber-400 animate-pulse">
            OVR: {rewardPlayer.ovr}
          </p>
        </div>
      )}

      {/* ================= 5: FULL PLAYER CARD SHOWCASE ================= */}
      {stage === 'FULL_CARD_SHOWCASE' && (
        <div className="flex flex-col items-center justify-center space-y-4 max-w-sm w-full">
          {/* Card Presentation */}
          <PlayerCard player={rewardPlayer} size="lg" showStats={true} />

          {/* Action Offers: Add to Squad / Add to Bench / Continue */}
          <div className="w-full space-y-2 pt-2">
            <GoldButton
              onClick={() => {
                sounds.playTap();
                onAddToSquad(rewardPlayer);
                onClose();
              }}
              fullWidth
              size="lg"
            >
              <Check className="w-4 h-4" />
              إضافة فورية للتشكيلة الأساسية
            </GoldButton>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  sounds.playTap();
                  onAddToBench(rewardPlayer);
                  onClose();
                }}
                className="py-2.5 px-3 rounded-xl bg-zinc-900 border border-zinc-700 text-xs font-tajawal text-zinc-200 hover:bg-zinc-800 transition-all font-medium"
              >
                إضافة لدكة البدلاء
              </button>

              <button
                onClick={() => {
                  sounds.playTap();
                  onClose();
                }}
                className="py-2.5 px-3 rounded-xl bg-zinc-900 border border-zinc-700 text-xs font-tajawal text-amber-400 hover:bg-zinc-800 transition-all font-bold"
              >
                المتابعة إلى المتجر
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
