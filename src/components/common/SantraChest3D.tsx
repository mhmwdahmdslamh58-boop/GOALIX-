import React, { useState, useRef } from 'react';
import { SantraChestTier, Player } from '../../types/game';
import { SantraChestRewardResult } from '../../data/players';
import { PlayerCard } from './PlayerCard';
import { GoldButton } from './GoldButton';
import { sounds } from '../../services/audio';
import confetti from 'canvas-confetti';
import { Lock, Unlock, Sparkles, Coins, CheckCircle2, Shield } from 'lucide-react';

export type ChestOpenStage =
  | 'IDLE'
  | 'PRESS'
  | 'SHAKE'
  | 'GLOW'
  | 'OPEN_LID'
  | 'LIGHT'
  | 'REWARD_REVEAL'
  | 'CLAIMED';

export const CHEST_TIER_CONFIG: Record<
  SantraChestTier,
  {
    nameEn: string;
    nameAr: string;
    bodyBg: string;
    lidBg: string;
    trimBorder: string;
    glowShadow: string;
    lightBeam: string;
    lockColor: string;
    badgeBg: string;
    coinsRange: string;
    ovrHint: string;
  }
> = {
  Bronze: {
    nameEn: 'BRONZE CHEST',
    nameAr: 'صندوق سانترا البرونزي',
    bodyBg: 'from-[#2b1a10] via-[#1a100a] to-[#0d0805]',
    lidBg: 'from-[#4a2c1a] via-[#2b1a10] to-[#170e08]',
    trimBorder: 'border-amber-700/80',
    glowShadow: 'shadow-[0_12px_30px_rgba(180,83,9,0.35)]',
    lightBeam: 'from-amber-600/50 via-amber-500/20 to-transparent',
    lockColor: 'text-amber-500 border-amber-600 bg-[#24150c]',
    badgeBg: 'bg-amber-900/50 text-amber-300 border-amber-700/60',
    coinsRange: '15–25 Coins',
    ovrHint: 'لاعب 77–84 OVR'
  },
  Silver: {
    nameEn: 'SILVER CHEST',
    nameAr: 'صندوق سانترا الفضي',
    bodyBg: 'from-[#272a30] via-[#16181d] to-[#0b0c0e]',
    lidBg: 'from-[#3f444e] via-[#252830] to-[#14161a]',
    trimBorder: 'border-zinc-400/80',
    glowShadow: 'shadow-[0_12px_35px_rgba(212,212,216,0.35)]',
    lightBeam: 'from-zinc-200/50 via-zinc-400/20 to-transparent',
    lockColor: 'text-zinc-200 border-zinc-400 bg-zinc-900',
    badgeBg: 'bg-zinc-800 text-zinc-200 border-zinc-500/60',
    coinsRange: '30–45 Coins',
    ovrHint: 'لاعب 84–86 OVR'
  },
  Gold: {
    nameEn: 'GOLD CHEST',
    nameAr: 'صندوق سانترا الذهبي',
    bodyBg: 'from-[#2e2308] via-[#191305] to-[#0a0802]',
    lidBg: 'from-[#594310] via-[#362809] to-[#1a1304]',
    trimBorder: 'border-amber-400',
    glowShadow: 'shadow-[0_14px_40px_rgba(212,175,55,0.5)]',
    lightBeam: 'from-amber-300/70 via-amber-400/30 to-transparent',
    lockColor: 'text-amber-300 border-amber-400 bg-[#261c06]',
    badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-400/60',
    coinsRange: '55–80 Coins',
    ovrHint: 'لاعب 85–90 OVR'
  },
  Elite: {
    nameEn: 'ELITE CHEST',
    nameAr: 'صندوق سانترا النخبة',
    bodyBg: 'from-[#331c06] via-[#1b0e03] to-[#0a0501]',
    lidBg: 'from-[#6b3b0d] via-[#3c2107] to-[#1c0f03]',
    trimBorder: 'border-amber-300',
    glowShadow: 'shadow-[0_16px_50px_rgba(245,158,11,0.65)]',
    lightBeam: 'from-yellow-300/80 via-amber-500/40 to-transparent',
    lockColor: 'text-yellow-300 border-amber-300 bg-[#2e1805]',
    badgeBg: 'bg-amber-500/30 text-yellow-200 border-amber-300',
    coinsRange: '90–130 Coins',
    ovrHint: 'نجم نخبة 88–95 OVR'
  },
  Legendary: {
    nameEn: 'LEGENDARY CHEST',
    nameAr: 'صندوق سانترا الأسطوري',
    bodyBg: 'from-[#3b2d0a] via-[#1f1704] to-[#090701]',
    lidBg: 'from-[#856514] via-[#4a380b] to-[#211904]',
    trimBorder: 'border-yellow-200',
    glowShadow: 'shadow-[0_20px_65px_rgba(254,240,138,0.8)]',
    lightBeam: 'from-yellow-200/90 via-amber-300/50 to-transparent',
    lockColor: 'text-yellow-200 border-yellow-200 bg-[#362807]',
    badgeBg: 'bg-gradient-to-r from-amber-500 to-yellow-300 text-black font-black border-yellow-200',
    coinsRange: '160–220 Coins',
    ovrHint: 'أسطورة ICON 96–102 OVR'
  }
};

interface SantraChest3DCardProps {
  tier: SantraChestTier;
  boxNumber?: number;
  subtitleAr?: string;
  isOpened?: boolean;
  isSelected?: boolean;
  disabled?: boolean;
  onPressChest: () => void;
  revealedContent?: React.ReactNode;
}

/**
 * Interactive 3D Metallic Santra Chest Card used on the Santra Board & Vault
 */
export const SantraChest3DCard: React.FC<SantraChest3DCardProps> = ({
  tier,
  boxNumber,
  subtitleAr,
  isOpened = false,
  isSelected = false,
  disabled = false,
  onPressChest,
  revealedContent
}) => {
  const [animStage, setAnimStage] = useState<'IDLE' | 'PRESS' | 'SHAKE' | 'GLOW' | 'OPEN_LID'>('IDLE');
  const busyRef = useRef(false);
  const cfg = CHEST_TIER_CONFIG[tier];

  const handleClick = () => {
    if (disabled || isOpened || busyRef.current) return;
    busyRef.current = true;
    sounds.playTap();
    setAnimStage('PRESS');

    setTimeout(() => {
      sounds.playChestShake();
      setAnimStage('SHAKE');
    }, 100);

    setTimeout(() => {
      setAnimStage('GLOW');
    }, 380);

    setTimeout(() => {
      sounds.playChestOpen();
      setAnimStage('OPEN_LID');
    }, 620);

    setTimeout(() => {
      busyRef.current = false;
      setAnimStage('IDLE');
      onPressChest();
    }, 900);
  };

  const stageTransform =
    animStage === 'PRESS'
      ? 'scale-95 translate-y-1'
      : animStage === 'SHAKE'
      ? 'animate-[bounce_0.25s_infinite] -rotate-2 scale-105'
      : animStage === 'GLOW'
      ? 'scale-105 ring-2 ring-amber-300 shadow-[0_0_35px_rgba(251,191,36,0.85)]'
      : animStage === 'OPEN_LID'
      ? 'scale-105 ring-4 ring-yellow-300 shadow-[0_0_50px_rgba(254,240,138,0.95)]'
      : '';

  return (
    <div
      onClick={handleClick}
      className={`relative rounded-2xl p-3 border-2 transition-all duration-200 select-none overflow-hidden ${
        disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:-translate-y-0.5 active:translate-y-1'
      } bg-gradient-to-b ${cfg.bodyBg} ${cfg.trimBorder} ${cfg.glowShadow} ${stageTransform} ${
        isSelected ? 'ring-2 ring-amber-400' : ''
      }`}
      style={{ perspective: '900px' }}
    >
      {/* Metallic corner studs */}
      <span className="absolute top-2 left-2 w-1.5 h-1.5 rounded-full bg-amber-400/70 shadow-inner" />
      <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-amber-400/70 shadow-inner" />
      <span className="absolute bottom-2 left-2 w-1.5 h-1.5 rounded-full bg-amber-400/70 shadow-inner" />
      <span className="absolute bottom-2 right-2 w-1.5 h-1.5 rounded-full bg-amber-400/70 shadow-inner" />

      {/* Inner light burst when opening */}
      {(animStage === 'GLOW' || animStage === 'OPEN_LID' || isOpened) && (
        <div
          className={`absolute inset-0 bg-gradient-to-t ${cfg.lightBeam} pointer-events-none animate-pulse`}
        />
      )}

      {!isOpened ? (
        <div className="relative z-10 flex flex-col items-center justify-between space-y-2 py-1">
          {/* Tier Badge & Box Number */}
          <div className="w-full flex items-center justify-between px-1">
            <span className={`text-[9px] font-chakra font-bold px-2 py-0.5 rounded border ${cfg.badgeBg}`}>
              {tier.toUpperCase()}
            </span>
            {boxNumber !== undefined && (
              <span className="text-[10px] font-chakra font-black text-amber-300/90">
                #{boxNumber}
              </span>
            )}
          </div>

          {/* 3D Chest Visual Body (Lid + Lock + Base + Shadow) */}
          <div className="relative w-28 h-20 flex flex-col items-center justify-center my-1">
            {/* Ground 3D Shadow */}
            <div className="absolute -bottom-2 w-24 h-3 rounded-full bg-black/90 blur-xs" />

            {/* 3D Lid */}
            <div
              className={`w-24 h-8 rounded-t-xl border-2 ${cfg.trimBorder} bg-gradient-to-b ${cfg.lidBg} relative transition-transform duration-300 origin-top shadow-inner flex items-center justify-center ${
                animStage === 'OPEN_LID' ? '-translate-y-3 -rotate-x-45' : ''
              }`}
            >
              {/* Gold Metallic Straps on Lid */}
              <div className="absolute left-3 inset-y-0 w-1.5 bg-gradient-to-b from-amber-300 via-amber-500 to-amber-700 opacity-80" />
              <div className="absolute right-3 inset-y-0 w-1.5 bg-gradient-to-b from-amber-300 via-amber-500 to-amber-700 opacity-80" />
              <span className="text-[8px] font-chakra font-black tracking-widest text-amber-200/80 uppercase">
                GOALIX
              </span>
            </div>

            {/* Center Metallic Lock Clasp */}
            <div
              className={`z-20 -my-2.5 w-7 h-7 rounded-lg border-2 ${cfg.lockColor} flex items-center justify-center shadow-[0_4px_10px_rgba(0,0,0,0.8)] transition-transform duration-200 ${
                animStage === 'GLOW' || animStage === 'OPEN_LID' ? 'scale-115 ring-2 ring-yellow-300' : ''
              }`}
            >
              {animStage === 'OPEN_LID' ? (
                <Unlock className="w-3.5 h-3.5 text-yellow-300 animate-bounce" />
              ) : (
                <Lock className="w-3.5 h-3.5" />
              )}
            </div>

            {/* 3D Chest Lower Vault Base */}
            <div
              className={`w-24 h-11 rounded-b-xl border-2 border-t-0 ${cfg.trimBorder} bg-gradient-to-b ${cfg.bodyBg} relative shadow-[inset_0_4px_12px_rgba(0,0,0,0.85)] flex items-end justify-center pb-1`}
            >
              <div className="absolute left-3 inset-y-0 w-1.5 bg-gradient-to-b from-amber-500 to-amber-800 opacity-75" />
              <div className="absolute right-3 inset-y-0 w-1.5 bg-gradient-to-b from-amber-500 to-amber-800 opacity-75" />
              <span className="text-[8px] font-chakra text-zinc-400">3D VAULT</span>
            </div>
          </div>

          {/* Action Caption */}
          <div className="text-center">
            <p className="text-xs font-bold font-tajawal text-zinc-100">{cfg.nameAr}</p>
            <span className="text-[10px] text-amber-300/90 font-tajawal block">
              {animStage === 'IDLE'
                ? subtitleAr || 'اضغط لفتح الصندوق 3D'
                : animStage === 'SHAKE'
                ? 'اهتزاز القفل المعدني...'
                : animStage === 'GLOW'
                ? 'توهج الطاقة الذهبية...'
                : 'فتح الغطاء وكشف المكافأة!'}
            </span>
          </div>
        </div>
      ) : (
        <div className="relative z-10 flex flex-col items-center justify-center min-h-[140px] animate-fade-in">
          {revealedContent}
        </div>
      )}
    </div>
  );
};

interface SantraChestOpeningModalProps {
  tier: SantraChestTier;
  reward: SantraChestRewardResult;
  onClaim: (reward: SantraChestRewardResult) => void;
  onAddToSquad?: (player: Player) => void;
}

/**
 * Full-screen Interactive 3D Santra Chest Opening Sequence:
 * Press -> Shake -> Glow -> Open Lid -> Light -> Reward Reveal -> Claim
 */
export const SantraChestOpeningModal: React.FC<SantraChestOpeningModalProps> = ({
  tier,
  reward,
  onClaim,
  onAddToSquad
}) => {
  const [stage, setStage] = useState<ChestOpenStage>('IDLE');
  const [claimedGuard, setClaimedGuard] = useState(false);
  const cfg = CHEST_TIER_CONFIG[tier];

  const handleTriggerOpen = () => {
    if (stage !== 'IDLE') return;
    sounds.playTap();
    setStage('PRESS');

    setTimeout(() => {
      sounds.playChestShake();
      setStage('SHAKE');
    }, 180);

    setTimeout(() => {
      sounds.playPackTension();
      setStage('GLOW');
    }, 750);

    setTimeout(() => {
      sounds.playChestOpen();
      setStage('OPEN_LID');
    }, 1350);

    setTimeout(() => {
      setStage('LIGHT');
    }, 1850);

    setTimeout(() => {
      sounds.playGoalHorn();
      setStage('REWARD_REVEAL');
      if (sounds.isEffectsEnabled()) {
        confetti({
          particleCount: tier === 'Legendary' ? 130 : tier === 'Elite' ? 90 : 60,
          spread: 75,
          origin: { y: 0.6 }
        });
      }
    }, 2350);
  };

  const handleFinalClaim = (addSquad: boolean) => {
    if (claimedGuard) return;
    setClaimedGuard(true);
    sounds.playTap();
    if (addSquad && onAddToSquad) {
      onAddToSquad(reward.playerAwarded);
    }
    setStage('CLAIMED');
    onClaim(reward);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 select-none overflow-y-auto">
      {/* Ambient dynamic glow */}
      <div
        className={`absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,${
          stage === 'LIGHT' || stage === 'OPEN_LID' ? '0.35' : '0.14'
        }),transparent_70%)] pointer-events-none transition-all duration-500`}
      />

      {stage !== 'REWARD_REVEAL' && stage !== 'CLAIMED' ? (
        <div className="relative z-10 flex flex-col items-center text-center max-w-sm w-full space-y-6">
          <div className="space-y-1">
            <span className={`text-xs font-chakra font-black px-3 py-1 rounded-full border ${cfg.badgeBg}`}>
              {cfg.nameEn}
            </span>
            <h3 className="text-xl font-black font-tajawal text-white mt-2">{cfg.nameAr}</h3>
            <p className="text-xs text-zinc-400 font-tajawal">
              {stage === 'IDLE'
                ? 'اضغط على الصندوق ثلاثي الأبعاد لكسر القفل وكشف المكافأة الحقيقية'
                : stage === 'PRESS'
                ? 'تم الضغط على القفل...'
                : stage === 'SHAKE'
                ? 'اهتزاز الصندوق المعدني...'
                : stage === 'GLOW'
                ? 'توهج الطاقة الذهبية بالداخل...'
                : stage === 'OPEN_LID'
                ? 'فتح الغطاء المدرع...'
                : 'انبعاث الضوء وكشف البطل!'}
            </p>
          </div>

          {/* Interactive 3D Vault Chest */}
          <div
            onClick={handleTriggerOpen}
            className={`relative w-64 h-52 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
              stage === 'PRESS'
                ? 'scale-95 translate-y-2'
                : stage === 'SHAKE'
                ? 'animate-[bounce_0.2s_infinite] rotate-2 scale-105'
                : stage === 'GLOW'
                ? 'scale-110 drop-shadow-[0_0_45px_rgba(251,191,36,0.9)]'
                : stage === 'OPEN_LID' || stage === 'LIGHT'
                ? 'scale-115 drop-shadow-[0_0_70px_rgba(254,240,138,1)]'
                : 'hover:scale-105'
            }`}
            style={{ perspective: '1000px' }}
          >
            {/* Floor 3D Shadow */}
            <div className="absolute bottom-1 w-52 h-6 rounded-full bg-black blur-md" />

            {/* Light Pillar when lid opens */}
            {(stage === 'OPEN_LID' || stage === 'LIGHT') && (
              <div className="absolute -top-16 w-44 h-48 bg-gradient-to-t from-yellow-300/90 via-amber-400/50 to-transparent blur-md animate-pulse pointer-events-none z-20" />
            )}

            {/* 3D Chest Lid */}
            <div
              className={`w-52 h-20 rounded-t-3xl border-2 ${cfg.trimBorder} bg-gradient-to-b ${cfg.lidBg} relative transition-all duration-500 origin-top flex items-center justify-center shadow-2xl ${
                stage === 'OPEN_LID' || stage === 'LIGHT' ? '-translate-y-8 -rotate-x-45 opacity-90' : ''
              }`}
            >
              <div className="absolute left-7 inset-y-0 w-3 bg-gradient-to-b from-yellow-200 via-amber-400 to-amber-700 border-x border-amber-900/50" />
              <div className="absolute right-7 inset-y-0 w-3 bg-gradient-to-b from-yellow-200 via-amber-400 to-amber-700 border-x border-amber-900/50" />
              <span className="font-chakra font-black text-xs tracking-widest text-amber-200/90 uppercase">
                SANTRA 3D VAULT
              </span>
            </div>

            {/* 3D Metallic Lock */}
            <div
              className={`z-30 -my-4 w-12 h-12 rounded-2xl border-2 ${cfg.lockColor} flex items-center justify-center shadow-[0_6px_20px_rgba(0,0,0,0.9)] transition-all duration-300 ${
                stage === 'GLOW' || stage === 'OPEN_LID' || stage === 'LIGHT'
                  ? 'scale-125 ring-4 ring-yellow-300 bg-amber-500 text-black'
                  : ''
              }`}
            >
              {stage === 'OPEN_LID' || stage === 'LIGHT' ? (
                <Unlock className="w-6 h-6 animate-bounce" />
              ) : (
                <Lock className="w-6 h-6" />
              )}
            </div>

            {/* 3D Chest Base */}
            <div
              className={`w-52 h-24 rounded-b-3xl border-2 border-t-0 ${cfg.trimBorder} bg-gradient-to-b ${cfg.bodyBg} relative shadow-[inset_0_8px_20px_rgba(0,0,0,0.9)] flex items-end justify-center pb-3`}
            >
              <div className="absolute left-7 inset-y-0 w-3 bg-gradient-to-b from-amber-500 via-amber-600 to-amber-900 border-x border-amber-950/60" />
              <div className="absolute right-7 inset-y-0 w-3 bg-gradient-to-b from-amber-500 via-amber-600 to-amber-900 border-x border-amber-950/60" />
              <div className="flex items-center gap-1 text-[10px] font-chakra font-bold text-amber-300/80">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{cfg.coinsRange} + PLAYER</span>
              </div>
            </div>
          </div>

          {stage === 'IDLE' && (
            <GoldButton onClick={handleTriggerOpen} fullWidth size="lg">
              <Unlock className="w-4 h-4" />
              اضغط لفتح الصندوق (Open 3D Chest)
            </GoldButton>
          )}
        </div>
      ) : (
        /* REWARD REVEAL & CLAIM STAGE */
        <div className="relative z-10 flex flex-col items-center text-center max-w-sm w-full space-y-4 animate-fade-in">
          <div className="space-y-1">
            <span className="text-xs font-chakra font-black text-amber-400 uppercase tracking-widest block">
              REWARD REVEALED · مكافأة حقيقية
            </span>
            <h3 className="text-lg font-black font-tajawal text-white">{reward.descriptionAr}</h3>
          </div>

          {/* Coins Bonus Banner */}
          <div className="w-full p-3 rounded-2xl bg-gradient-to-r from-amber-950/70 via-zinc-900 to-amber-950/70 border border-amber-400/60 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-amber-400" />
              <span className="text-xs font-bold font-tajawal text-zinc-100">مكافأة الكوينز الفورية:</span>
            </div>
            <span className="font-chakra font-black text-lg text-amber-300 tabular-nums">
              +{reward.coinsAwarded} Coins
            </span>
          </div>

          {/* Real Player Card from Database */}
          <PlayerCard player={reward.playerAwarded} size="lg" showStats={true} highlighted />

          {/* Claim Buttons */}
          <div className="w-full space-y-2 pt-1">
            {onAddToSquad && (
              <GoldButton
                onClick={() => handleFinalClaim(true)}
                disabled={claimedGuard}
                fullWidth
                size="lg"
              >
                <CheckCircle2 className="w-4 h-4" />
                استلام المكافأة وإضافة اللاعب للتشكيلة الأساسية
              </GoldButton>
            )}

            <GoldButton
              variant={onAddToSquad ? 'dark' : 'gold'}
              onClick={() => handleFinalClaim(false)}
              disabled={claimedGuard}
              fullWidth
              size="lg"
            >
              <CheckCircle2 className="w-4 h-4" />
              استلام وحفظ في المجموعات (+{reward.coinsAwarded} كوينز)
            </GoldButton>
          </div>
        </div>
      )}
    </div>
  );
};
