import React, { useState, useEffect, useRef } from 'react';
import { Player, CardTier } from '../../types/game';
import { PlayerCard } from '../common/PlayerCard';
import { GoldButton } from '../common/GoldButton';
import { sounds } from '../../services/audio';
import confetti from 'canvas-confetti';
import { 
  Sparkles, 
  FastForward, 
  Check, 
  Shield, 
  Flame, 
  Crown, 
  Coins, 
  Trophy,
  Zap,
  ArrowRight
} from 'lucide-react';

interface PackOpeningModalProps {
  tier: CardTier;
  rewardPlayer: Player;
  onAddToSquad: (player: Player) => void;
  onAddToBench: (player: Player) => void;
  onClose: () => void;
}

const SAMPLE_FLAGS = ['🇸🇦', '🇪🇬', '🇦🇷', '🇵🇹', '🇧🇷', '🇫🇷', '🇩🇪', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', '🇲🇦', '🇳🇱'];
const SAMPLE_POSITIONS = ['ST', 'RW', 'LW', 'CAM', 'CM', 'CDM', 'CB', 'LB', 'RB', 'GK'];
const SAMPLE_OVRS = [81, 84, 87, 89, 91, 94, 96, 98, 99];

export const PackOpeningModal: React.FC<PackOpeningModalProps> = ({
  tier,
  rewardPlayer,
  onAddToSquad,
  onAddToBench,
  onClose
}) => {
  const [phase, setPhase] = useState<'SPINNING' | 'REEL_1_LOCKED' | 'REEL_2_LOCKED' | 'JACKPOT_HIT' | 'REVEALED'>('SPINNING');
  const [reel1Display, setReel1Display] = useState(SAMPLE_FLAGS[0]);
  const [reel2Display, setReel2Display] = useState(SAMPLE_POSITIONS[0]);
  const [reel3Display, setReel3Display] = useState(SAMPLE_OVRS[0]);

  const spinIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Casino Slot Spinning Logic
  useEffect(() => {
    sounds.playPackTension();

    // Fast reel spinning animation interval
    let tickCount = 0;
    spinIntervalRef.current = setInterval(() => {
      setReel1Display(SAMPLE_FLAGS[Math.floor(Math.random() * SAMPLE_FLAGS.length)]);
      setReel2Display(SAMPLE_POSITIONS[Math.floor(Math.random() * SAMPLE_POSITIONS.length)]);
      setReel3Display(SAMPLE_OVRS[Math.floor(Math.random() * SAMPLE_OVRS.length)]);
      tickCount++;
      if (tickCount % 2 === 0) {
        sounds.playCasinoSpinTick();
      }
    }, 110);

    // Timeline:
    // 1. Lock Reel 1 (Nation) after 1.5s
    const t1 = setTimeout(() => {
      setPhase('REEL_1_LOCKED');
      setReel1Display(rewardPlayer.flag || '⚽');
      sounds.playCasinoReelLock();
    }, 1500);

    // 2. Lock Reel 2 (Position) after 2.7s
    const t2 = setTimeout(() => {
      setPhase('REEL_2_LOCKED');
      setReel2Display(rewardPlayer.position);
      sounds.playCasinoReelLock();
    }, 2700);

    // 3. Lock Reel 3 (OVR) & Hit Jackpot after 4.0s
    const t3 = setTimeout(() => {
      if (spinIntervalRef.current) clearInterval(spinIntervalRef.current);
      setPhase('JACKPOT_HIT');
      setReel3Display(rewardPlayer.ovr);
      sounds.playJackpotFanfare();
      sounds.playCoinDrop();
      sounds.playGoalHorn();

      confetti({
        particleCount: tier === 'ICON' ? 140 : tier === 'ELITE' ? 90 : 60,
        spread: 80,
        origin: { y: 0.6 }
      });
    }, 4000);

    // 4. Reveal Full Card after 5.3s
    const t4 = setTimeout(() => {
      setPhase('REVEALED');
    }, 5300);

    return () => {
      if (spinIntervalRef.current) clearInterval(spinIntervalRef.current);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [rewardPlayer, tier]);

  const handleSkip = () => {
    if (spinIntervalRef.current) clearInterval(spinIntervalRef.current);
    setReel1Display(rewardPlayer.flag || '⚽');
    setReel2Display(rewardPlayer.position);
    setReel3Display(rewardPlayer.ovr);
    setPhase('REVEALED');
    sounds.playJackpotFanfare();
    sounds.playCoinDrop();
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#050608]/95 backdrop-blur-xl flex flex-col items-center justify-between p-4 sm:p-6 select-none font-tajawal antialiased overflow-hidden">
      {/* Dynamic Casino Ambient Lighting */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-amber-500/15 blur-[100px] animate-pulse" />
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-yellow-400/10 blur-[80px]" />
      </div>

      {/* Top Header Bar */}
      <div className="relative z-10 w-full flex items-center justify-between border-b border-zinc-800 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-600 to-yellow-300 p-0.5 flex items-center justify-center">
            <Crown className="w-4 h-4 text-black" />
          </div>
          <div>
            <span className="font-chakra font-black text-xs text-amber-400 tracking-widest block">
              GOALIX CASINO REEL
            </span>
            <span className="text-[10px] text-zinc-400">سحب الحزمة التفاعلي</span>
          </div>
        </div>

        {phase !== 'REVEALED' && (
          <button
            onClick={handleSkip}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700 text-xs font-bold text-amber-300 hover:border-amber-400 active:scale-95 transition-all cursor-pointer"
          >
            <FastForward className="w-3.5 h-3.5" />
            <span>تخطي السحب</span>
          </button>
        )}
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center w-full max-w-sm my-auto">
        {phase !== 'REVEALED' ? (
          /* ================= CASINO SLOT MACHINE ================= */
          <div className="w-full space-y-4">
            {/* Slot Machine Top Marquee */}
            <div className="bg-gradient-to-r from-red-950 via-zinc-900 to-red-950 border-2 border-amber-400 rounded-3xl p-3 text-center shadow-[0_0_30px_rgba(212,175,55,0.4)] relative overflow-hidden">
              {/* Flashing Bulbs Row */}
              <div className="flex justify-around mb-1.5 opacity-90">
                {[...Array(9)].map((_, i) => (
                  <span
                    key={i}
                    className="w-2 h-2 rounded-full bg-yellow-300 shadow-[0_0_6px_#fde047] animate-ping"
                    style={{ animationDelay: `${i * 120}ms` }}
                  />
                ))}
              </div>

              <h2 className="font-chakra font-black text-xl text-yellow-300 tracking-wider flex items-center justify-center gap-2">
                <span>🎰</span>
                <span>LUCKY CASINO REEL</span>
                <span>🎰</span>
              </h2>

              <p className="text-[11px] font-bold text-amber-200 mt-0.5">
                {phase === 'JACKPOT_HIT' ? '🎉 JACKPOT WINNER! ضربة الحظ الكبرى!' : 'جاري تدوير بكرات الحظ واختيار اللاعب...'}
              </p>
            </div>

            {/* 3 CASINO SLOT REELS */}
            <div className="bg-gradient-to-b from-[#1c1404] via-black to-[#130f06] border-4 border-amber-500 rounded-3xl p-4 shadow-[0_15px_40px_rgba(0,0,0,0.9)] space-y-3">
              <div className="grid grid-cols-3 gap-2">
                {/* REEL 1: NATION / FLAG */}
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-bold text-amber-400 mb-1">الدولة</span>
                  <div
                    className={`w-full aspect-square bg-[#0b0c10] border-2 rounded-2xl flex items-center justify-center text-3xl shadow-inner transition-all ${
                      phase !== 'SPINNING'
                        ? 'border-emerald-400 bg-emerald-950/20 shadow-[0_0_15px_rgba(52,211,153,0.5)] scale-105'
                        : 'border-zinc-700 animate-pulse'
                    }`}
                  >
                    <span>{reel1Display}</span>
                  </div>
                  <span className="text-[9px] text-zinc-400 mt-1">
                    {phase !== 'SPINNING' ? 'مؤكد ✓' : 'تدوير...'}
                  </span>
                </div>

                {/* REEL 2: POSITION */}
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-bold text-amber-400 mb-1">المركز</span>
                  <div
                    className={`w-full aspect-square bg-[#0b0c10] border-2 rounded-2xl flex items-center justify-center font-chakra font-black text-2xl shadow-inner transition-all ${
                      phase === 'REEL_2_LOCKED' || phase === 'JACKPOT_HIT'
                        ? 'border-cyan-400 bg-cyan-950/20 text-cyan-300 shadow-[0_0_15px_rgba(56,189,248,0.5)] scale-105'
                        : 'border-zinc-700 text-zinc-300 animate-pulse'
                    }`}
                  >
                    <span>{reel2Display}</span>
                  </div>
                  <span className="text-[9px] text-zinc-400 mt-1">
                    {phase === 'REEL_2_LOCKED' || phase === 'JACKPOT_HIT' ? 'مؤكد ✓' : 'تدوير...'}
                  </span>
                </div>

                {/* REEL 3: OVR RATING */}
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-bold text-amber-400 mb-1">التقييم OVR</span>
                  <div
                    className={`w-full aspect-square bg-[#0b0c10] border-2 rounded-2xl flex items-center justify-center font-chakra font-black text-2xl shadow-inner transition-all ${
                      phase === 'JACKPOT_HIT'
                        ? 'border-yellow-400 bg-amber-950/40 text-yellow-300 shadow-[0_0_20px_rgba(250,204,21,0.7)] scale-110 animate-bounce'
                        : 'border-zinc-700 text-zinc-300 animate-pulse'
                    }`}
                  >
                    <span>{reel3Display}</span>
                  </div>
                  <span className="text-[9px] text-zinc-400 mt-1">
                    {phase === 'JACKPOT_HIT' ? '⭐ جاكبوت!' : 'تدوير...'}
                  </span>
                </div>
              </div>

              {/* JACKPOT STATUS BANNER */}
              {phase === 'JACKPOT_HIT' && (
                <div className="bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-300 p-2.5 rounded-xl text-center shadow-lg animate-pulse">
                  <span className="font-chakra font-black text-sm text-black tracking-widest block">
                    ★ 777 JACKPOT HIT! ★
                  </span>
                  <span className="text-[11px] font-black text-amber-950 font-tajawal">
                    {rewardPlayer.name} · {rewardPlayer.ovr} OVR
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ================= FULL CARD REVEAL SHOWCASE ================= */
          <div className="w-full flex flex-col items-center space-y-4 animate-[fadeIn_0.5s_ease-out]">
            {/* Jackpot Banner */}
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 via-yellow-400/30 to-amber-500/20 border border-amber-400 shadow-md">
              <Sparkles className="w-4 h-4 text-yellow-300 animate-spin" />
              <span className="font-chakra font-black text-xs text-amber-300 tracking-wider">
                CASINO JACKPOT WINNER
              </span>
              <Coins className="w-4 h-4 text-amber-400" />
            </div>

            {/* The Ultimate Player Card */}
            <div className="transform scale-105 transition-transform duration-300 drop-shadow-[0_15px_35px_rgba(212,175,55,0.4)]">
              <PlayerCard player={rewardPlayer} size="lg" />
            </div>

            {/* Player Details Summary */}
            <div className="text-center space-y-0.5">
              <h3 className="text-lg font-black text-white font-tajawal">
                {rewardPlayer.name}
              </h3>
              <p className="text-xs text-amber-300 font-chakra font-bold">
                {rewardPlayer.club} · {rewardPlayer.position} · {rewardPlayer.ovr} OVR
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Action Footer */}
      {phase === 'REVEALED' && (
        <div className="relative z-10 w-full max-w-sm space-y-2 pt-2 border-t border-zinc-800">
          <GoldButton
            onClick={() => {
              sounds.playButtonClick();
              onAddToSquad(rewardPlayer);
              onClose();
            }}
            fullWidth
            size="md"
          >
            <Check className="w-4 h-4" />
            <span>إضافة إلى التشكيلة الأساسية فوراً</span>
          </GoldButton>

          <button
            onClick={() => {
              sounds.playTap();
              onAddToBench(rewardPlayer);
              onClose();
            }}
            className="w-full py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-300 hover:text-white transition-all cursor-pointer text-center"
          >
            حفظ في بنك الاحتياط والمجموعة
          </button>
        </div>
      )}
    </div>
  );
};
