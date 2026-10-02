import React, { useState, useEffect, useRef } from 'react';
import { MatchSimEvent, Player } from '../../../types/game';
import { generateMatchSimulation, MatchSimulationOutput, TacticalSettings } from './MatchEngine';
import { GoldButton } from '../../common/GoldButton';
import { PlayerCard } from '../../common/PlayerCard';
import { sounds } from '../../../services/audio';
import confetti from 'canvas-confetti';
import { 
  Trophy, Play, FastForward, Flame, Shield, Sparkles, 
  Award, Clock, Activity, Pause
} from 'lucide-react';

interface MatchSimulationScreenProps {
  team1Name: string;
  team2Name: string;
  team1Squad: (Player | null)[];
  team2Squad: (Player | null)[];
  advantageGoalsTeam1?: number;
  advantageGoalsTeam2?: number;
  onFinishMatch: (winner: 'team1' | 'team2' | 'draw', rewardCoins: number, fullOutput: MatchSimulationOutput) => void;
  onClose: () => void;
}

export const MatchSimulationScreen: React.FC<MatchSimulationScreenProps> = ({
  team1Name,
  team2Name,
  team1Squad,
  team2Squad,
  advantageGoalsTeam1 = 0,
  advantageGoalsTeam2 = 0,
  onFinishMatch,
  onClose,
}) => {
  const [tactics, setTactics] = useState<TacticalSettings>({
    mentality: 'balanced',
    tempo: 'normal',
    pressing: 'mid',
  });

  const [simOutput] = useState<MatchSimulationOutput>(() =>
    generateMatchSimulation(
      {
        name: team1Name,
        squad: team1Squad.filter((p): p is Player => Boolean(p)),
        tactics,
        advantageGoals: advantageGoalsTeam1,
      },
      {
        name: team2Name,
        squad: team2Squad.filter((p): p is Player => Boolean(p)),
        tactics: { mentality: 'balanced', tempo: 'normal', pressing: 'mid' },
        advantageGoals: advantageGoalsTeam2,
      }
    )
  );

  const [currentMinute, setCurrentMinute] = useState<number>(0);
  const [visibleEvents, setVisibleEvents] = useState<MatchSimEvent[]>([]);
  const [liveScoreP1, setLiveScoreP1] = useState<number>(advantageGoalsTeam1);
  const [liveScoreP2, setLiveScoreP2] = useState<number>(advantageGoalsTeam2);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [speedMultiplier, setSpeedMultiplier] = useState<1 | 2 | 4>(1);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [ballX, setBallX] = useState<number>(50);
  const [ballY, setBallY] = useState<number>(50);
  const [activeBanner, setActiveBanner] = useState<MatchSimEvent | null>(null);

  const processedRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    sounds.playWhistle();
  }, []);

  useEffect(() => {
    if (isFinished || isPaused) return;
    const intervalMs = Math.round(150 / speedMultiplier);
    const timer = setInterval(() => {
      setCurrentMinute((prev) => {
        if (prev >= 90) {
          clearInterval(timer);
          return 90;
        }
        return prev + 1;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [speedMultiplier, isFinished, isPaused]);

  useEffect(() => {
    if (currentMinute === 0) return;

    const triggered = simOutput.events.filter(
      (ev, idx) => ev.minute <= currentMinute && !processedRef.current.has(idx)
    );

    if (triggered.length > 0) {
      triggered.forEach((ev) => {
        const idx = simOutput.events.indexOf(ev);
        processedRef.current.add(idx);

        if (ev.ballCoords) {
          setBallX(ev.ballCoords.x);
          setBallY(ev.ballCoords.y);
        }

        if (ev.type === 'goal') {
          sounds.playGoalHorn();
          if (ev.team === 'p1') setLiveScoreP1((s) => s + 1);
          else setLiveScoreP2((s) => s + 1);
          setActiveBanner(ev);
          setTimeout(() => setActiveBanner(null), 2300);
        } else if (ev.type === 'save' || ev.type === 'yellow_card' || ev.type === 'red_card') {
          sounds.playTap();
          setActiveBanner(ev);
          setTimeout(() => setActiveBanner(null), 1600);
        }
      });

      setVisibleEvents((prev) => [...triggered.reverse(), ...prev]);
    } else {
      setBallX((prev) => Math.max(15, Math.min(85, prev + (Math.random() * 24 - 12))));
      setBallY((prev) => Math.max(20, Math.min(80, prev + (Math.random() * 20 - 10))));
    }

    if (currentMinute >= 90 && !isFinished) {
      setIsFinished(true);
      sounds.playWhistle();
      if (sounds.isEffectsEnabled()) {
        confetti({
          particleCount: 100,
          spread: 75,
          origin: { y: 0.6 },
        });
      }
    }
  }, [currentMinute, simOutput.events, isFinished]);

  const handleSkipToEnd = () => {
    sounds.playWhistle();
    setCurrentMinute(90);
    setLiveScoreP1(simOutput.goalsP1);
    setLiveScoreP2(simOutput.goalsP2);
    setVisibleEvents([...simOutput.events].reverse());
    setIsFinished(true);
  };

  const progressRatio = Math.max(0.1, currentMinute / 90);
  const curAttacksP1 = isFinished ? (simOutput.stats.attacksP1 ?? 44) : Math.round((simOutput.stats.attacksP1 ?? 44) * progressRatio);
  const curAttacksP2 = isFinished ? (simOutput.stats.attacksP2 ?? 39) : Math.round((simOutput.stats.attacksP2 ?? 39) * progressRatio);
  const curChancesP1 = isFinished ? (simOutput.stats.chancesP1 ?? 8) : Math.round((simOutput.stats.chancesP1 ?? 8) * progressRatio);
  const curChancesP2 = isFinished ? (simOutput.stats.chancesP2 ?? 7) : Math.round((simOutput.stats.chancesP2 ?? 7) * progressRatio);

  const rewardCoins = simOutput.winner === 'team1' ? 45 : simOutput.winner === 'draw' ? 20 : 10;

  return (
    <div className="max-w-3xl mx-auto px-4 py-4 pb-28 space-y-4">
      {/* Broadcast Scoreboard */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-zinc-900 via-zinc-950 to-zinc-950 border border-amber-500/40 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.85)]">
        <div className="relative z-10 flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-black">
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            <span>البث التكتيكي المباشر — 2D MATCH ENGINE</span>
          </div>

          <div className="flex items-center gap-1.5">
            {!isFinished && (
              <>
                <button
                  onClick={() => {
                    sounds.playTap();
                    setIsPaused((p) => !p);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold flex items-center gap-1 border border-zinc-700"
                >
                  {isPaused ? <Play className="w-3 h-3 text-emerald-400" /> : <Pause className="w-3 h-3 text-amber-400" />}
                  {isPaused ? 'استئناف' : 'إيقاف'}
                </button>
                <button
                  onClick={() => {
                    sounds.playTap();
                    setSpeedMultiplier((s) => (s === 1 ? 2 : s === 2 ? 4 : 1));
                  }}
                  className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-400 text-xs font-black border border-zinc-700"
                >
                  {speedMultiplier}x
                </button>
                <button
                  onClick={handleSkipToEnd}
                  className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-1"
                >
                  <FastForward className="w-3.5 h-3.5" />
                  تخطي للنهاية
                </button>
              </>
            )}
          </div>
        </div>

        {/* Score Row */}
        <div className="relative z-10 grid grid-cols-3 items-center gap-2 py-2">
          <div className="text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-amber-500/25 to-zinc-900 border border-amber-500/40 flex items-center justify-center mb-1.5 shadow-lg">
              <Shield className="w-7 h-7 text-amber-400" />
            </div>
            <div className="font-black text-white text-sm sm:text-base truncate">{team1Name}</div>
            <div className="flex items-center justify-center gap-1.5 mt-1 flex-wrap">
              <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-amber-400 font-bold">
                OVR {simOutput.team1Ovr}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 font-bold border border-emerald-500/30">
                تناغم {simOutput.team1Chemistry}%
              </span>
            </div>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-700 mb-2">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-chakra text-sm font-black text-emerald-400">{currentMinute}&apos;</span>
            </div>
            <div className="flex items-center justify-center gap-3">
              <span className="font-chakra text-4xl sm:text-5xl font-black text-white">{liveScoreP1}</span>
              <span className="text-zinc-600 text-2xl font-black">:</span>
              <span className="font-chakra text-4xl sm:text-5xl font-black text-white">{liveScoreP2}</span>
            </div>
            <div className="text-[10px] font-bold text-zinc-500 mt-1 uppercase">
              {isFinished ? 'نهاية المباراة (FULL TIME)' : isPaused ? 'متوقفة مؤقتًا' : 'المباراة جارية'}
            </div>
          </div>

          <div className="text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-sky-500/25 to-zinc-900 border border-sky-500/40 flex items-center justify-center mb-1.5 shadow-lg">
              <Shield className="w-7 h-7 text-sky-400" />
            </div>
            <div className="font-black text-white text-sm sm:text-base truncate">{team2Name}</div>
            <div className="flex items-center justify-center gap-1.5 mt-1 flex-wrap">
              <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-sky-400 font-bold">
                OVR {simOutput.team2Ovr}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 font-bold border border-emerald-500/30">
                تناغم {simOutput.team2Chemistry}%
              </span>
            </div>
          </div>
        </div>

        <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden mt-3">
          <div
            className="h-full bg-gradient-to-r from-amber-500 via-emerald-400 to-amber-300 transition-all duration-150"
            style={{ width: `${(currentMinute / 90) * 100}%` }}
          />
        </div>
      </div>

      {/* Live Mentality Controls */}
      {!isFinished && (
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-3 flex items-center justify-between gap-2 flex-wrap">
          <span className="text-xs font-black text-zinc-300">التوجيه التكتيكي المباشر:</span>
          <div className="flex items-center gap-1.5">
            {[
              { id: 'attacking', label: '🔥 هجومي كاسح' },
              { id: 'balanced', label: '⚖️ متوازن' },
              { id: 'defensive', label: '🛡️ دفاع منطقة' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  sounds.playTap();
                  setTactics((t) => ({ ...t, mentality: m.id as 'defensive' | 'balanced' | 'attacking' }));
                }}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-black transition-all ${
                  tactics.mentality === m.id
                    ? 'bg-amber-500 text-zinc-950 shadow'
                    : 'bg-zinc-950 text-zinc-400 border border-zinc-800 hover:text-white'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 2D Pitch Radar */}
      <div className="relative h-36 rounded-2xl tactical-pitch border-2 border-emerald-500/30 overflow-hidden shadow-inner flex items-center justify-center">
        <div className="absolute inset-3 border border-white/20 rounded-xl pointer-events-none" />
        <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white/20 pointer-events-none" />
        <div className="w-16 h-16 rounded-full border border-white/20 pointer-events-none" />

        <div
          className="absolute w-4 h-4 rounded-full bg-amber-400 shadow-[0_0_15px_#f59e0b] border-2 border-white transition-all duration-300 flex items-center justify-center"
          style={{ left: `${ballX}%`, top: `${ballY}%`, transform: 'translate(-50%, -50%)' }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-zinc-950" />
        </div>

        {activeBanner && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center animate-fade-in">
            <span className="px-3 py-0.5 rounded-full bg-amber-500 text-zinc-950 font-black text-xs mb-1">
              الدقيقة {activeBanner.minute}&apos;
            </span>
            <p className="text-xs sm:text-sm font-bold text-amber-200 max-w-md">{activeBanner.descriptionAr}</p>
          </div>
        )}
      </div>

      {/* Complete Match Statistics */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
          <span className="text-xs font-black text-amber-400">{team1Name}</span>
          <span className="text-xs font-black text-zinc-300 uppercase">إحصائيات المباراة الكاملة</span>
          <span className="text-xs font-black text-sky-400">{team2Name}</span>
        </div>

        <div>
          <div className="flex justify-between text-xs font-black mb-1">
            <span className="text-amber-400">{simOutput.stats.possessionP1}%</span>
            <span className="text-zinc-400">الاستحواذ (Possession)</span>
            <span className="text-sky-400">{simOutput.stats.possessionP2}%</span>
          </div>
          <div className="w-full h-2 bg-sky-500/40 rounded-full overflow-hidden flex">
            <div className="h-full bg-amber-500" style={{ width: `${simOutput.stats.possessionP1}%` }} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
          <div className="font-chakra font-black text-white bg-zinc-950/60 py-1.5 rounded-lg">{curAttacksP1}</div>
          <div className="text-zinc-400 font-bold flex items-center justify-center">الهجمات (Attacks)</div>
          <div className="font-chakra font-black text-white bg-zinc-950/60 py-1.5 rounded-lg">{curAttacksP2}</div>

          <div className="font-chakra font-black text-white bg-zinc-950/60 py-1.5 rounded-lg">{curChancesP1}</div>
          <div className="text-zinc-400 font-bold flex items-center justify-center">الفرص الخطيرة (Chances)</div>
          <div className="font-chakra font-black text-white bg-zinc-950/60 py-1.5 rounded-lg">{curChancesP2}</div>

          <div className="font-chakra font-black text-white bg-zinc-950/60 py-1.5 rounded-lg">
            {simOutput.stats.shotsP1} ({simOutput.stats.shotsOnTargetP1})
          </div>
          <div className="text-zinc-400 font-bold flex items-center justify-center">التسديدات (على المرمى)</div>
          <div className="font-chakra font-black text-white bg-zinc-950/60 py-1.5 rounded-lg">
            {simOutput.stats.shotsP2} ({simOutput.stats.shotsOnTargetP2})
          </div>

          <div className="font-chakra font-black text-white bg-zinc-950/60 py-1.5 rounded-lg">{simOutput.stats.savesP1}</div>
          <div className="text-zinc-400 font-bold flex items-center justify-center">تصديات الحارس</div>
          <div className="font-chakra font-black text-white bg-zinc-950/60 py-1.5 rounded-lg">{simOutput.stats.savesP2}</div>

          <div className="font-chakra font-black text-yellow-400 bg-zinc-950/60 py-1.5 rounded-lg">
            🟨 {simOutput.stats.yellowCardsP1 ?? 0}
          </div>
          <div className="text-zinc-400 font-bold flex items-center justify-center">البطاقات الصفراء</div>
          <div className="font-chakra font-black text-yellow-400 bg-zinc-950/60 py-1.5 rounded-lg">
            🟨 {simOutput.stats.yellowCardsP2 ?? 0}
          </div>

          <div className="font-chakra font-black text-rose-400 bg-zinc-950/60 py-1.5 rounded-lg">
            🟥 {simOutput.stats.redCardsP1 ?? 0}
          </div>
          <div className="text-zinc-400 font-bold flex items-center justify-center">البطاقات الحمراء</div>
          <div className="font-chakra font-black text-rose-400 bg-zinc-950/60 py-1.5 rounded-lg">
            🟥 {simOutput.stats.redCardsP2 ?? 0}
          </div>
        </div>
      </div>

      {/* Final Result & Claim */}
      {isFinished && (
        <div className="bg-gradient-to-br from-amber-500/20 via-zinc-900 to-zinc-950 border-2 border-amber-500/50 rounded-3xl p-5 shadow-2xl space-y-4 animate-fade-in">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-right">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black mb-2">
                <Trophy className="w-4 h-4" />
                <span>النتيجة النهائية للمباراة</span>
              </div>
              <h3 className="text-2xl font-black text-white">
                {simOutput.winner === 'draw'
                  ? 'تعادل تكتيكي مثير!'
                  : `الفائز: ${simOutput.winner === 'team1' ? team1Name : team2Name} 🏆`}
              </h3>
              <p className="text-xs text-zinc-300 mt-1">
                اضغط لاعتماد النتيجة واستلام مكافأة الكوينز ونقاط التصنيف (RP).
              </p>
            </div>

            {simOutput.mvp && (
              <div className="flex items-center gap-3 bg-zinc-950/90 border border-amber-500/30 rounded-2xl p-3">
                <PlayerCard player={simOutput.mvp} size="sm" showStats={false} />
                <div>
                  <div className="flex items-center gap-1 text-amber-400 text-xs font-black">
                    <Award className="w-4 h-4" />
                    <span>رجل المباراة (MVP)</span>
                  </div>
                  <div className="text-white font-black text-sm mt-0.5">{simOutput.mvp.name}</div>
                  <div className="text-[11px] text-zinc-400">{simOutput.mvp.club}</div>
                </div>
              </div>
            )}
          </div>

          <GoldButton
            fullWidth
            size="lg"
            onClick={() => onFinishMatch(simOutput.winner, rewardCoins, simOutput)}
          >
            <Sparkles className="w-5 h-5" />
            اعتماد النتيجة واستلام المكافآت (CLAIM & SAVE)
          </GoldButton>
        </div>
      )}

      {/* Event Feed */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4">
        <h4 className="text-xs font-black text-zinc-400 uppercase mb-3 flex items-center gap-1.5">
          <Flame className="w-4 h-4 text-amber-400" />
          <span>سجل أحداث المباراة دقيقة بدقيقة ({visibleEvents.length})</span>
        </h4>
        <div className="space-y-2 max-h-60 overflow-y-auto pl-1">
          {visibleEvents.map((ev, i) => (
            <div
              key={`${ev.minute}-${i}`}
              className={`p-3 rounded-xl border flex items-start gap-3 ${
                ev.type === 'goal'
                  ? 'bg-amber-500/10 border-amber-500/40'
                  : ev.type === 'save'
                  ? 'bg-emerald-500/10 border-emerald-500/30'
                  : ev.type === 'yellow_card' || ev.type === 'red_card'
                  ? 'bg-rose-500/10 border-rose-500/30'
                  : 'bg-zinc-950/70 border-zinc-800/80'
              }`}
            >
              <span className="px-2 py-1 rounded-lg bg-zinc-900 border border-zinc-700 font-chakra text-xs font-black text-amber-400 shrink-0">
                {ev.minute}&apos;
              </span>
              <p className="text-xs text-zinc-200 leading-relaxed">{ev.descriptionAr}</p>
            </div>
          ))}
        </div>
      </div>

      {!isFinished && (
        <div className="text-center">
          <button onClick={onClose} className="text-xs text-zinc-500 hover:text-zinc-300 font-bold">
            إغلاق والعودة
          </button>
        </div>
      )}
    </div>
  );
};
