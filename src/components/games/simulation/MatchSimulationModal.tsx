import React, { useState, useEffect, useRef } from 'react';
import { Player, MatchSimEvent, MatchSimStats } from '../../../types/game';
import { generateMatchSimulation, TacticalSettings, TeamSimulationInput } from './MatchEngine';
import { GoldButton } from '../../common/GoldButton';
import { sounds } from '../../../services/audio';
import confetti from 'canvas-confetti';
import { Trophy, Activity, Play, FastForward, CheckCircle2, Shield } from 'lucide-react';

interface MatchSimulationModalProps {
  isOpen: boolean;
  team1Name: string;
  team2Name: string;
  team1Squad: Player[];
  team2Squad: Player[];
  advantageGoalsTeam1?: number;
  advantageGoalsTeam2?: number;
  onFinishMatch: (winner: 'team1' | 'team2' | 'draw', rewardCoins: number) => void;
  onClose: () => void;
}

export const MatchSimulationModal: React.FC<MatchSimulationModalProps> = ({
  isOpen,
  team1Name,
  team2Name,
  team1Squad,
  team2Squad,
  advantageGoalsTeam1 = 0,
  advantageGoalsTeam2 = 0,
  onFinishMatch,
  onClose
}) => {
  const [tactics, setTactics] = useState<TacticalSettings>({
    mentality: 'balanced',
    tempo: 'normal',
    pressing: 'mid'
  });

  const [matchState, setMatchState] = useState<'TACTICS_SETUP' | 'SIMULATING' | 'FINISHED'>('TACTICS_SETUP');
  const [currentMinute, setCurrentMinute] = useState(0);
  const [score, setScore] = useState<[number, number]>([advantageGoalsTeam1, advantageGoalsTeam2]);
  const [activeEvents, setActiveEvents] = useState<MatchSimEvent[]>([]);
  const [fullEvents, setFullEvents] = useState<MatchSimEvent[]>([]);
  const [finalStats, setFinalStats] = useState<MatchSimStats | null>(null);
  const [ballPosition, setBallPosition] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [simSpeed, setSimSpeed] = useState<number>(1);

  const eventFeedRef = useRef<HTMLDivElement>(null);

  // Auto scroll commentary
  useEffect(() => {
    if (eventFeedRef.current) {
      eventFeedRef.current.scrollTop = eventFeedRef.current.scrollHeight;
    }
  }, [activeEvents]);

  if (!isOpen) return null;

  const handleStartSimulation = () => {
    sounds.playWhistle();

    const t1Input: TeamSimulationInput = {
      name: team1Name,
      squad: team1Squad,
      tactics,
      advantageGoals: advantageGoalsTeam1
    };

    const t2Input: TeamSimulationInput = {
      name: team2Name,
      squad: team2Squad,
      tactics: { mentality: 'balanced', tempo: 'normal', pressing: 'mid' },
      advantageGoals: advantageGoalsTeam2
    };

    const result = generateMatchSimulation(t1Input, t2Input);
    setFullEvents(result.events);
    setFinalStats(result.stats);
    setActiveEvents([]);
    setCurrentMinute(0);
    setScore([advantageGoalsTeam1, advantageGoalsTeam2]);
    setMatchState('SIMULATING');
  };

  // Simulating loop
  useEffect(() => {
    if (matchState !== 'SIMULATING') return;

    const timer = setInterval(() => {
      setCurrentMinute(prev => {
        const nextMin = prev + 3;

        // Move 2D ball realistically on field
        setBallPosition({
          x: 25 + Math.random() * 50,
          y: 20 + Math.random() * 60
        });

        // Check if any events triggered up to nextMin
        const triggered = fullEvents.filter(e => e.minute <= nextMin);
        setActiveEvents(triggered);

        // Calculate score up to this minute
        let p1Goals = advantageGoalsTeam1;
        let p2Goals = advantageGoalsTeam2;
        triggered.forEach(e => {
          if (e.type === 'goal' && e.minute > 0) {
            if (e.team === 'p1') p1Goals++;
            else p2Goals++;
          }
        });
        setScore([p1Goals, p2Goals]);

        // Goal sound
        const newlyAdded = triggered[triggered.length - 1];
        if (newlyAdded && newlyAdded.minute > prev && newlyAdded.minute <= nextMin && newlyAdded.type === 'goal') {
          sounds.playGoalHorn();
        }

        if (nextMin >= 90) {
          clearInterval(timer);
          sounds.playWhistle();
          setMatchState('FINISHED');

          const winner = p1Goals > p2Goals ? 'team1' : p2Goals > p1Goals ? 'team2' : 'draw';
          const reward = winner === 'team1' ? 20 : 5;
          if (winner === 'team1') {
            confetti({
              particleCount: 75,
              spread: 60,
              origin: { y: 0.6 }
            });
          }
          return 90;
        }

        return nextMin;
      });
    }, 400 / simSpeed);

    return () => clearInterval(timer);
  }, [matchState, fullEvents, simSpeed, advantageGoalsTeam1, advantageGoalsTeam2]);

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="max-w-lg w-full bg-[#0c0e12] border border-amber-500/40 rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col max-h-[92vh] overflow-y-auto">
        {/* Header / Advantage alert */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h3 className="font-chakra font-black text-lg text-zinc-100 uppercase tracking-wider">
              2D Match Simulation
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {matchState === 'SIMULATING' && (
              <button
                onClick={() => setSimSpeed(s => (s === 1 ? 2.5 : 1))}
                className="flex items-center gap-1 text-[11px] font-chakra px-2 py-1 rounded bg-zinc-800 border border-zinc-700 text-amber-300"
              >
                <FastForward className="w-3.5 h-3.5" />
                <span>{simSpeed}x</span>
              </button>
            )}
            <span className="font-chakra text-xs text-amber-400 font-bold bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
              {matchState === 'FINISHED' ? 'نهاية المباراة' : `${currentMinute}'`}
            </span>
          </div>
        </div>

        {/* Challenge Advantage Banner if applicable */}
        {(advantageGoalsTeam1 > 0 || advantageGoalsTeam2 > 0) && (
          <div className="mb-3 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-center">
            <p className="text-xs font-tajawal text-amber-300 font-medium">
              ⭐ أفضلية مرحلة التحديات الإحصائية: تبدأ المباراة بنتيجة (
              {advantageGoalsTeam1 > 0 ? `${team1Name} 1 - 0` : `${team2Name} 1 - 0`}
              )
            </p>
          </div>
        )}

        {/* Live Scoreboard */}
        <div className="grid grid-cols-3 items-center bg-zinc-900/90 rounded-xl p-3 border border-zinc-800 mb-3 text-center">
          <div className="truncate px-1">
            <p className="font-bold text-sm text-zinc-200 truncate">{team1Name}</p>
            <p className="text-[10px] text-zinc-400">{team1Squad.length} لاعبين</p>
          </div>

          <div className="flex items-center justify-center gap-2">
            <span className="font-chakra font-black text-3xl text-amber-400 tabular-nums">
              {score[0]}
            </span>
            <span className="text-zinc-500 text-xl font-bold">:</span>
            <span className="font-chakra font-black text-3xl text-zinc-200 tabular-nums">
              {score[1]}
            </span>
          </div>

          <div className="truncate px-1">
            <p className="font-bold text-sm text-zinc-200 truncate">{team2Name}</p>
            <p className="text-[10px] text-zinc-400">{team2Squad.length} لاعبين</p>
          </div>
        </div>

        {/* 2D Mini Pitch Radar */}
        <div className="relative w-full h-32 rounded-xl tactical-pitch overflow-hidden border border-emerald-800/40 mb-3 shadow-inner flex items-center justify-center">
          {/* Pitch markings */}
          <div className="absolute inset-x-0 top-1/2 h-[1px] bg-white/20" />
          <div className="absolute w-12 h-12 rounded-full border border-white/20" />

          {/* Goal areas */}
          <div className="absolute top-0 w-24 h-5 border-b border-x border-white/20" />
          <div className="absolute bottom-0 w-24 h-5 border-t border-x border-white/20" />

          {/* Animated 2D Ball */}
          {matchState === 'SIMULATING' && (
            <div
              style={{
                position: 'absolute',
                left: `${ballPosition.x}%`,
                top: `${ballPosition.y}%`,
                transform: 'translate(-50%, -50%)',
                transition: 'all 0.35s ease-out'
              }}
              className="w-3.5 h-3.5 rounded-full bg-amber-300 border border-white shadow-[0_0_8px_rgba(251,191,36,0.9)] animate-pulse"
            />
          )}

          {/* Team labels on pitch halves */}
          <div className="absolute top-2 text-[10px] font-tajawal text-zinc-400/80 uppercase">
            {team2Name}
          </div>
          <div className="absolute bottom-2 text-[10px] font-tajawal text-amber-400/80 uppercase">
            {team1Name}
          </div>
        </div>

        {/* Connected Event Feed */}
        <div
          ref={eventFeedRef}
          className="flex-1 min-h-[140px] max-h-48 overflow-y-auto bg-black/40 rounded-xl p-2.5 border border-zinc-800 space-y-2 mb-3 text-right"
        >
          {activeEvents.length === 0 ? (
            <p className="text-xs text-zinc-500 text-center py-6 font-tajawal">
              في انتظار انطلاق صافرة البداية...
            </p>
          ) : (
            activeEvents.map((evt, idx) => (
              <div
                key={idx}
                className={`p-2 rounded-lg text-xs font-tajawal leading-relaxed border flex items-start gap-2 ${
                  evt.type === 'goal'
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-200 font-bold'
                    : evt.type === 'save'
                    ? 'bg-blue-950/30 border-blue-700/40 text-blue-200'
                    : 'bg-zinc-900/60 border-zinc-800/80 text-zinc-300'
                }`}
              >
                <span className="font-chakra text-[10px] text-amber-400/90 font-bold shrink-0 pt-0.5">
                  {evt.minute}&apos;
                </span>
                <span className="flex-1">{evt.descriptionAr}</span>
              </div>
            ))
          )}
        </div>

        {/* Tactics Setup View (Before Simulation) */}
        {matchState === 'TACTICS_SETUP' && (
          <div className="bg-zinc-900/80 rounded-xl p-3 border border-zinc-800 mb-3 space-y-2.5">
            <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5 font-tajawal">
              <Activity className="w-3.5 h-3.5" />
              التعليمات التكتيكية للمدرب:
            </h4>

            {/* Mentality */}
            <div className="flex items-center justify-between text-xs font-tajawal">
              <span className="text-zinc-400">العقلية التكتيكية:</span>
              <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg">
                {(['defensive', 'balanced', 'attacking'] as const).map(m => (
                  <button
                    key={m}
                    onClick={() => setTactics(t => ({ ...t, mentality: m }))}
                    className={`px-2 py-1 rounded text-[11px] transition-all ${
                      tactics.mentality === m
                        ? 'bg-amber-500 text-black font-bold'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {m === 'defensive' ? 'دفاعي' : m === 'balanced' ? 'متوازن' : 'هجومي'}
                  </button>
                ))}
              </div>
            </div>

            {/* Tempo */}
            <div className="flex items-center justify-between text-xs font-tajawal">
              <span className="text-zinc-400">إيقاع اللعب:</span>
              <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg">
                {(['patient', 'normal', 'fast'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setTactics(prev => ({ ...prev, tempo: t }))}
                    className={`px-2 py-1 rounded text-[11px] transition-all ${
                      tactics.tempo === t
                        ? 'bg-amber-500 text-black font-bold'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {t === 'patient' ? 'صبور' : t === 'normal' ? 'معتدل' : 'سريع'}
                  </button>
                ))}
              </div>
            </div>

            <GoldButton onClick={handleStartSimulation} fullWidth size="lg">
              <Play className="w-4 h-4 fill-black" />
              صافرة البداية · انطلاق المباراة
            </GoldButton>
          </div>
        )}

        {/* Finished View */}
        {matchState === 'FINISHED' && (
          <div className="space-y-3">
            {/* Match Stats Summary */}
            {finalStats && (
              <div className="bg-zinc-900/90 rounded-xl p-3 border border-zinc-800 text-xs font-chakra space-y-1.5">
                <div className="flex justify-between text-zinc-400 pb-1 border-b border-zinc-800 font-tajawal">
                  <span>{team1Name}</span>
                  <span className="font-bold text-amber-400">إحصائيات اللقاء</span>
                  <span>{team2Name}</span>
                </div>

                <div className="flex justify-between items-center text-zinc-200">
                  <span>{finalStats.possessionP1}%</span>
                  <span className="text-[11px] text-zinc-400 font-tajawal">الاستحواذ</span>
                  <span>{finalStats.possessionP2}%</span>
                </div>

                <div className="flex justify-between items-center text-zinc-200">
                  <span>{finalStats.shotsP1}</span>
                  <span className="text-[11px] text-zinc-400 font-tajawal">إجمالي التسديدات</span>
                  <span>{finalStats.shotsP2}</span>
                </div>

                <div className="flex justify-between items-center text-zinc-200">
                  <span>{finalStats.shotsOnTargetP1}</span>
                  <span className="text-[11px] text-zinc-400 font-tajawal">تسديدات على المرمى</span>
                  <span>{finalStats.shotsOnTargetP2}</span>
                </div>

                <div className="flex justify-between items-center text-zinc-200">
                  <span>{finalStats.savesP1}</span>
                  <span className="text-[11px] text-zinc-400 font-tajawal">تصديات الحراس</span>
                  <span>{finalStats.savesP2}</span>
                </div>
              </div>
            )}

            {/* Victory Badge & Reward */}
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/40 text-center space-y-1">
              <p className="text-sm font-bold font-tajawal text-amber-300">
                {score[0] > score[1]
                  ? `🏆 فوز مستحق لـ ${team1Name}! (+20 كوينز)`
                  : score[1] > score[0]
                  ? `فوز ${team2Name}! (+5 كوينز)`
                  : 'تعادل مثير بين الفريقين! (+10 كوينز)'}
              </p>
            </div>

            <GoldButton
              onClick={() => {
                const winner = score[0] > score[1] ? 'team1' : score[1] > score[0] ? 'team2' : 'draw';
                const reward = winner === 'team1' ? 20 : winner === 'draw' ? 10 : 5;
                onFinishMatch(winner, reward);
                onClose();
              }}
              fullWidth
              size="lg"
            >
              <CheckCircle2 className="w-4 h-4" />
              المطالبة بالمكافأة واستمرار
            </GoldButton>
          </div>
        )}
      </div>
    </div>
  );
};
