import React, { useState } from 'react';
import { PackTierId, Player } from '../../types/game';
import { PlayerCard } from '../common/PlayerCard';
import { GoldButton } from '../common/GoldButton';
import { OrnatePackArtwork } from './OrnatePackArtwork';
import { sounds } from '../../services/audio';
import confetti from 'canvas-confetti';
import { Sparkles, Check, Scissors, Flame } from 'lucide-react';

interface PackOpeningModalProps {
  packId: PackTierId;
  packTitle: string;
  packPrice: number;
  rewardPlayer: Player;
  isDuplicate: boolean;
  duplicateCompensation: number;
  onClaim: () => void;
}

export const PackOpeningModal: React.FC<PackOpeningModalProps> = ({
  packId,
  packTitle,
  rewardPlayer,
  isDuplicate,
  duplicateCompensation,
  onClaim,
}) => {
  // Interactive stages: 'appear' -> 'shaking' -> 'slashing' -> 'opened' -> 'revealed'
  const [stage, setStage] = useState<'appear' | 'shaking' | 'slashing' | 'opened' | 'revealed'>(
    'appear'
  );
  const [hasClaimed, setHasClaimed] = useState(false);

  const handleTriggerOpen = () => {
    if (stage !== 'appear') return;
    setStage('shaking');
    sounds.playChestShake();

    setTimeout(() => {
      setStage('slashing');
      sounds.playChestOpen();
    }, 520);

    setTimeout(() => {
      setStage('opened');
      sounds.playReveal();
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.5 },
        colors: ['#f59e0b', '#fbbf24', '#fef08a'],
      });
    }, 980);

    setTimeout(() => {
      setStage('revealed');
      if (rewardPlayer.cardType === 'ICON' || rewardPlayer.cardType === 'ELITE') {
        sounds.playCrowdCheer();
      }
      confetti({
        particleCount: rewardPlayer.cardType === 'ICON' ? 160 : 100,
        spread: 90,
        origin: { y: 0.55 },
        colors: ['#f59e0b', '#fbbf24', '#fef08a', '#ffffff'],
      });
    }, 1700);
  };

  const handleFinalClaim = () => {
    if (hasClaimed) return;
    setHasClaimed(true);
    sounds.playSuccess();
    onClaim();
  };

  const packThemeMap: Record<PackTierId, { badge: string; accent: string; rayColor: string }> = {
    BRONZE: {
      badge: 'COMMON ORNATE VAULT',
      accent: 'text-amber-400',
      rayColor: 'from-amber-500/40',
    },
    WEEKLY: {
      badge: 'RARE SILVER ORNATE VAULT',
      accent: 'text-slate-200',
      rayColor: 'from-sky-400/40',
    },
    GOLD: {
      badge: 'SULTAN GOLD ORNATE VAULT',
      accent: 'text-yellow-300',
      rayColor: 'from-yellow-400/50',
    },
    ELITE: {
      badge: 'EPIC ELITE ORNATE VAULT',
      accent: 'text-rose-300',
      rayColor: 'from-rose-500/55',
    },
    ICON: {
      badge: 'LEGENDARY DYNASTY ICON VAULT',
      accent: 'text-amber-200',
      rayColor: 'from-amber-300/70',
    },
  };

  const packTheme = packThemeMap[packId] || packThemeMap.GOLD;

  return (
    <div className="fixed inset-0 z-50 bg-black/92 backdrop-blur-xl flex flex-col items-center justify-center p-4 overflow-y-auto animate-fade-in">
      {/* High-End Opened Light Burst Overlay */}
      {stage === 'opened' && (
        <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center">
          <div
            className={`w-[520px] h-[520px] rounded-full bg-radial ${packTheme.rayColor} via-amber-500/15 to-transparent blur-2xl animate-ping`}
          />
        </div>
      )}

      {stage !== 'revealed' ? (
        <div className="relative z-50 text-center space-y-6 max-w-sm w-full">
          <div className="space-y-1">
            <span className={`text-xs font-black tracking-widest uppercase ${packTheme.accent}`}>
              {packTheme.badge}
            </span>
            <h3 className="text-2xl font-black text-white">{packTitle}</h3>
            <p className="text-xs text-zinc-400">
              {stage === 'appear'
                ? 'اضغط على الباك المزخرف لقص الختم الذهبي وكشف اللاعب!'
                : stage === 'shaking'
                ? 'اهتزاز الخزنة الملكية...'
                : stage === 'slashing'
                ? 'جاري فك الختم الذهبي...'
                : '✨ تم فتح الباك! جاري خروج النجم...'}
            </p>
          </div>

          {/* Ornate Pack Interactive Container */}
          <div
            onClick={handleTriggerOpen}
            className={`relative w-64 mx-auto cursor-pointer select-none transition-all duration-500 flex flex-col items-center ${
              stage === 'shaking'
                ? 'animate-bounce scale-105'
                : stage === 'slashing'
                ? 'scale-110'
                : stage === 'opened'
                ? 'scale-115'
                : 'hover:scale-105'
            }`}
          >
            {/* Ambient Rarity Halo */}
            <div className="absolute -inset-6 rounded-full bg-amber-500/25 blur-3xl pointer-events-none" />

            {/* Top Foil Tear Strip */}
            <div
              className={`relative z-20 w-56 h-8 rounded-t-xl bg-gradient-to-r from-amber-300 via-yellow-500 to-amber-400 border-2 border-amber-200 flex items-center justify-between px-3 mb-1 transition-all duration-500 ${
                stage === 'slashing' || stage === 'opened'
                  ? '-translate-y-14 rotate-12 opacity-0'
                  : ''
              }`}
            >
              <div className="flex items-center gap-1 text-[10px] font-black text-zinc-950">
                <Scissors className="w-3.5 h-3.5" />
                <span>SLASH TO OPEN</span>
              </div>
              <span className="text-[10px] font-black text-zinc-950">ROYAL SEAL</span>
            </div>

            {/* Laser Slash Line */}
            {stage === 'slashing' && (
              <div className="absolute top-10 left-0 right-0 h-2 bg-white shadow-[0_0_30px_#ffffff,0_0_50px_#f59e0b] z-30 animate-pulse" />
            )}

            {/* Emerging Card Preview Silhouette during 'opened' stage */}
            {stage === 'opened' && (
              <div className="absolute -top-8 z-30 px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-300 via-white to-amber-400 text-zinc-950 font-chakra font-black text-xs shadow-[0_0_30px_#facc15] flex items-center gap-1.5 animate-bounce">
                <Flame className="w-4 h-4 fill-current" />
                <span>WALKOUT: {rewardPlayer.ovr} OVR ({rewardPlayer.position})</span>
              </div>
            )}

            {/* Main Ornate Pack Artwork with `opened` animation state */}
            <OrnatePackArtwork
              tier={packId}
              size="xl"
              animated
              opened={stage === 'opened'}
            />
          </div>

          {stage === 'appear' && (
            <GoldButton fullWidth size="lg" onClick={handleTriggerOpen}>
              قص وفتح الباك المزخرف الآن (OPEN PACK)
            </GoldButton>
          )}
        </div>
      ) : (
        <div className="w-full max-w-md flex flex-col items-center text-center space-y-5 animate-pack-opened my-auto">
          <div className="inline-flex items-center gap-2 text-amber-300 text-xs font-black tracking-wider uppercase">
            <Sparkles className="w-4 h-4" />
            <span>
              {rewardPlayer.cardType === 'ICON'
                ? 'أسطورة خالدة! (ICON WALKOUT)'
                : rewardPlayer.cardType === 'ELITE'
                ? 'نجم نخبة عالمي! (ELITE WALKOUT)'
                : 'بطاقة رسمية جديدة!'}
            </span>
          </div>

          <div className="transform hover:scale-105 transition-transform duration-300">
            <PlayerCard player={rewardPlayer} size="lg" />
          </div>

          <div className="bg-zinc-900/95 border border-amber-500/35 rounded-2xl p-4 w-full space-y-2 shadow-2xl">
            <h3 className="text-xl font-black text-white">{rewardPlayer.name}</h3>
            <div className="text-xs font-bold text-amber-400">
              {rewardPlayer.club} · {rewardPlayer.nationality} · المركز: {rewardPlayer.position}
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              {rewardPlayer.league} — موسم {rewardPlayer.season} ({rewardPlayer.ovr} OVR)
            </p>

            {isDuplicate ? (
              <div className="mt-2 p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold">
                اللاعب موجود مسبقًا في خزينتك! تم منحك +{duplicateCompensation} كوينز تعويضًا فوريًا.
              </div>
            ) : (
              <div className="mt-2 p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5">
                <Check className="w-4 h-4" />
                <span>تمت إضافة البطاقة إلى خزينتك وتشكيلتك بنجاح!</span>
              </div>
            )}
          </div>

          <GoldButton fullWidth size="lg" onClick={handleFinalClaim}>
            استلام وحفظ في الخزينة (CLAIM REWARD)
          </GoldButton>
        </div>
      )}
    </div>
  );
};
