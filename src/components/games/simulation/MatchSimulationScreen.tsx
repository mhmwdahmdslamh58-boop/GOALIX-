import React, { useState, useEffect, useRef } from 'react';
import { Player, MatchSimEvent, MatchSimStats } from '../../../types/game';
import { generateMatchSimulation, TacticalSettings, TeamSimulationInput } from './MatchEngine';
import { GoldButton } from '../../common/GoldButton';
import { sounds } from '../../../services/audio';
import confetti from 'canvas-confetti';
import { 
  Trophy, 
  FastForward, 
  Play, 
  ArrowRight, 
  CheckCircle2, 
  Shield, 
  Flame, 
  Activity, 
  ArrowLeftRight,
  TrendingUp
} from 'lucide-react';

interface MatchSimulationScreenProps {
  team1Name: string;
  team2Name: string;
  team1Squad: Player[];
  team2Squad: Player[];
  advantageGoalsTeam1?: number;
  advantageGoalsTeam2?: number;
  onFinishMatch: (winner: 'team1' | 'team2' | 'draw', rewardCoins: number) => void;
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
  onClose
}) => {
  const [tactics, setTactics] = useState<TacticalSettings>({
    mentality: 'balanced',
    tempo: 'normal',
    pressing: 'mid'
  });

  const [simState, setSimState] = useState<'PRE_MATCH' | 'PLAYING' | 'FULL_TIME'>('PRE_MATCH');
  const [currentMinute, setCurrentMinute] = useState(0);
  const [score, setScore] = useState<[number, number]>([advantageGoalsTeam1, advantageGoalsTeam2]);
  const [allEvents, setAllEvents] = useState<MatchSimEvent[]>([]);
  const [visibleEvents, setVisibleEvents] = useState<MatchSimEvent[]>([]);
  const [latestEvent, setLatestEvent] = useState<MatchSimEvent | null>(null);
  const [finalStats, setFinalStats] = useState<MatchSimStats | null>(null);
  const [ballPos, setBallPos] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [simSpeed, setSimSpeed] = useState<number>(1);

  const timelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (timelineRef.current) {
      timelineRef.current.scrollTop = timelineRef.current.scrollHeight;
    }
  }, [visibleEvents]);

  const handleKickoff = () => {
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

    const sim = generateMatchSimulation(t1Input, t2Input);
    setAllEvents(sim.events);
    setFinalStats(sim.stats);
    setVisibleEvents([]);
    setCurrentMinute(0);
    setScore([advantageGoalsTeam1, advantageGoalsTeam2]);
    setSimState('PLAYING');
  };

  // Simulating loop
  useEffect(() => {
    if (simState !== 'PLAYING') return;

    const interval = setInterval(() => {
      setCurrentMinute(prevMin => {
        const nextMin = prevMin + 2;

        // Animate 2D ball
        setBallPos({
          x: 20 + Math.random() * 60,
          y: 20 + Math.random() * 60
        });

        // Trigger any events matching this time window
        const triggered = allEvents.filter(e => e.minute <= nextMin);
        setVisibleEvents(triggered);

        // Calculate score
        let p1G = advantageGoalsTeam1;
        let p2G = advantageGoalsTeam2;
        triggered.forEach(e => {
          if (e.type === 'goal' && e.minute > 0) {
            if (e.team === 'p1') p1G++;
            else p2G++;
          }
        });
        setScore([p1G, p2G]);

        // Check newest event
        const newest = triggered[triggered.length - 1];
        if (newest && newest.minute > prevMin && newest.minute <= nextMin) {
          setLatestEvent(newest);
          if (newest.ballCoords) setBallPos(newest.ballCoords);
          if (newest.type === 'goal') sounds.playGoalHorn();
          else if (newest.type === 'save' || newest.type === 'shot') sounds.playReveal();
        }

        // Full time whistle at 90'
        if (nextMin >= 90) {
          clearInterval(interval);
          sounds.playWhistle();
          setSimState('FULL_TIME');

          const winner = p1G > p2G ? 'team1' : p2G > p1G ? 'team2' : 'draw';
          if (winner === 'team1') {
            confetti({
              particleCount: 80,
              spread: 60,
              origin: { y: 0.6 }
            });
          }
          return 90;
        }

        return nextMin;
      });
    }, 380 / simSpeed);

    return () => clearInterval(interval);
  }, [simState, allEvents, simSpeed, advantageGoalsTeam1, advantageGoalsTeam2]);

  const getEventBadge = (type: MatchSimEvent['type']) => {
    switch (type) {
      case 'goal': return { text: 'GOAL · هدف', bg: 'bg-amber-500 text-black font-black' };
      case 'save': return { text: 'SAVE · تصدي', bg: 'bg-blue-600 text-white font-bold' };
      case 'shot': return { text: 'SHOT · تسديدة', bg: 'bg-zinc-700 text-zinc-100' };
      case 'corner': return { text: 'CORNER · ركنية', bg: 'bg-indigo-600 text-white' };
      case 'foul': return { text: 'FOUL · خطأ', bg: 'bg-yellow-600 text-black' };
      case 'yellow_card': return { text: 'YELLOW CARD · بطاقة صفراء', bg: 'bg-yellow-400 text-black font-bold' };
      case 'red_card': return { text: 'RED CARD · طرد مباشر', bg: 'bg-red-600 text-white font-bold' };
      case 'offside': return { text: 'OFFSIDE · تسلل', bg: 'bg-orange-600 text-white' };
      case 'free_kick': return { text: 'FREE KICK · ركلة حرة', bg: 'bg-cyan-600 text-white' };
      default: return { text: 'EVENT · حركة', bg: 'bg-zinc-800 text-zinc-300' };
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#08080a] text-zinc-100 flex flex-col select-none overflow-hidden">
      {/* ================= 1. BROADCAST TOP BAR ================= */}
      <div className="sticky top-0 z-30 bg-[#0c0e12] border-b border-amber-500/30 px-3 py-2.5 shadow-2xl">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <button
            onClick={onClose}
            className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200 font-tajawal"
          >
            <ArrowRight className="w-4 h-4" />
            <span>خروج</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] font-chakra font-black tracking-widest text-amber-400 uppercase">
              LIVE BROADCAST
            </span>
          </div>

          {simState === 'PLAYING' && (
            <button
              onClick={() => setSimSpeed(s => (s === 1 ? 2.5 : 1))}
              className="flex items-center gap-1 text-[11px] font-chakra font-bold px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-amber-300 active:scale-95"
            >
              <FastForward className="w-3 h-3" />
              <span>{simSpeed}x</span>
            </button>
          )}

          {simState !== 'PLAYING' && <div className="w-12" />}
        </div>
      </div>

      <div className="flex-1 max-w-md w-full mx-auto p-3 flex flex-col justify-between overflow-y-auto space-y-3">
        {/* ================= 2. LIVE SCOREBOARD ================= */}
        <div className="bg-gradient-to-b from-[#141720] to-[#0d0f14] rounded-2xl p-3 border border-zinc-800 shadow-xl">
          {/* Challenge advantage reminder */}
          {(advantageGoalsTeam1 > 0 || advantageGoalsTeam2 > 0) && (
            <div className="text-center pb-2 mb-2 border-b border-zinc-800/80">
              <span className="text-[11px] font-tajawal text-amber-400 font-medium">
                ⭐ أفضلية التحدي الإحصائي: ({advantageGoalsTeam1 > 0 ? `${team1Name} 1-0` : `${team2Name} 1-0`})
              </span>
            </div>
          )}

          <div className="grid grid-cols-7 items-center text-center">
            {/* Team 1 */}
            <div className="col-span-3 px-1 text-right">
              <h4 className="font-bold text-sm text-zinc-100 truncate">{team1Name}</h4>
              <span className="text-[10px] text-zinc-400 font-tajawal">الفريق المستضيف</span>
            </div>

            {/* Score & Time */}
            <div className="col-span-1 flex flex-col items-center justify-center">
              <div className="flex items-center gap-1 font-chakra font-black text-2xl text-amber-400 tabular-nums">
                <span>{score[0]}</span>
                <span className="text-zinc-600 text-lg">:</span>
                <span>{score[1]}</span>
              </div>
              <span className="text-[10px] font-chakra font-black px-1.5 py-0.2 rounded bg-black/60 text-zinc-300 border border-zinc-700 mt-0.5">
                {simState === 'FULL_TIME' ? '90:00' : `${currentMinute}'`}
              </span>
            </div>

            {/* Team 2 */}
            <div className="col-span-3 px-1 text-left">
              <h4 className="font-bold text-sm text-zinc-100 truncate">{team2Name}</h4>
              <span className="text-[10px] text-zinc-400 font-tajawal">الفريق الضيف</span>
            </div>
          </div>
        </div>

        {/* ================= 3. 2D TACTICAL PITCH VISUALIZATION ================= */}
        <div className="relative w-full aspect-[16/10] rounded-2xl tactical-pitch overflow-hidden border border-emerald-800/50 shadow-2xl p-2">
          {/* Pitch markings */}
          <div className="absolute inset-y-0 left-1/2 w-[1px] bg-white/20" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full border border-white/20" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white/40" />

          {/* Goals */}
          <div className="absolute top-1/4 bottom-1/4 left-0 w-3 border-r border-y border-white/30" />
          <div className="absolute top-1/4 bottom-1/4 right-0 w-3 border-l border-y border-white/30" />

          {/* Attacking Direction Arrows */}
          <div className="absolute top-2 left-4 text-[9px] font-chakra font-bold text-amber-400/60 uppercase">
            ◄ {team1Name}
          </div>
          <div className="absolute top-2 right-4 text-[9px] font-chakra font-bold text-zinc-400/60 uppercase">
            {team2Name} ►
          </div>

          {/* Animated Ball */}
          <div
            style={{
              position: 'absolute',
              left: `${ballPos.x}%`,
              top: `${ballPos.y}%`,
              transform: 'translate(-50%, -50%)',
              transition: 'all 0.35s ease-out'
            }}
            className="w-4 h-4 rounded-full bg-amber-300 border-2 border-white shadow-[0_0_12px_rgba(251,191,36,0.9)] animate-pulse z-20"
          />

          {/* Active Highlight Overlay if latest event has player photo */}
          {latestEvent && latestEvent.playerImage && (
            <div className="absolute bottom-2 left-2 z-20 flex items-center gap-2 bg-black/85 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-amber-500/40 shadow-xl max-w-[80%]">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-amber-400 shrink-0">
                <img
                  src={latestEvent.playerImage}
                  alt={latestEvent.playerName || 'Player'}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <div className="truncate">
                <p className="text-[11px] font-bold text-zinc-100 font-tajawal truncate leading-none">
                  {latestEvent.playerName}
                </p>
                <span className="text-[9px] text-amber-300 font-chakra uppercase">
                  {latestEvent.type}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ================= 4. CONNECTED TIMELINE & COMMENTARY ================= */}
        <div
          ref={timelineRef}
          className="flex-1 min-h-[160px] max-h-48 overflow-y-auto bg-black/50 rounded-2xl p-3 border border-zinc-800 space-y-2.5 text-right"
        >
          {visibleEvents.length === 0 ? (
            <div className="text-center py-8 text-zinc-500 font-tajawal text-xs">
              في انتظار صافرة البداية وانطلاق الهجمات التكتيكية...
            </div>
          ) : (
            visibleEvents.map((evt, idx) => {
              const badge = getEventBadge(evt.type);
              return (
                <div
                  key={idx}
                  className={`p-2.5 rounded-xl border text-xs font-tajawal space-y-1.5 transition-all ${
                    evt.type === 'goal'
                      ? 'bg-amber-500/15 border-amber-500/50 shadow-md'
                      : evt.type === 'save'
                      ? 'bg-blue-950/30 border-blue-700/40'
                      : 'bg-zinc-900/70 border-zinc-800'
                  }`}
                >
                  {/* Event Type & Minute */}
                  <div className="flex items-center justify-between pb-1 border-b border-white/5">
                    <span className={`text-[9px] px-2 py-0.5 rounded font-chakra ${badge.bg}`}>
                      {badge.text}
                    </span>
                    <span className="font-chakra text-[10px] text-amber-400 font-black">
                      {evt.minute}&apos;
                    </span>
                  </div>

                  {/* Connected Chain Steps if present */}
                  {evt.chainSteps && evt.chainSteps.length > 0 && (
                    <div className="flex items-center gap-1 text-[10px] text-zinc-400 font-tajawal flex-wrap">
                      {evt.chainSteps.map((step, sIdx) => (
                        <React.Fragment key={sIdx}>
                          <span className={sIdx === evt.chainSteps!.length - 1 ? 'text-amber-300 font-bold' : ''}>
                            {step}
                          </span>
                          {sIdx < evt.chainSteps!.length - 1 && (
                            <span className="text-zinc-600">←</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  )}

                  {/* Description */}
                  <p className="text-xs text-zinc-200 leading-relaxed">
                    {evt.descriptionAr}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* ================= 5. FOOTER CONTROLS ================= */}
        {simState === 'PRE_MATCH' && (
          <div className="space-y-2">
            {/* Tactics quick picker */}
            <div className="flex items-center justify-between bg-zinc-900 p-2.5 rounded-xl border border-zinc-800 text-xs font-tajawal">
              <span className="text-zinc-400">عقلية المدرب التكتيكية:</span>
              <div className="flex gap-1">
                {(['defensive', 'balanced', 'attacking'] as const).map(m => (
                  <button
                    key={m}
                    onClick={() => setTactics(prev => ({ ...prev, mentality: m }))}
                    className={`px-2.5 py-1 rounded-lg text-[11px] transition-all ${
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

            <GoldButton onClick={handleKickoff} fullWidth size="lg">
              <Play className="w-4 h-4 fill-black" />
              انطلاق صافرة بداية المباراة (Kickoff)
            </GoldButton>
          </div>
        )}

        {simState === 'FULL_TIME' && (
          <div className="space-y-2.5">
            {/* Match summary stats */}
            {finalStats && (
              <div className="bg-zinc-900/90 rounded-xl p-3 border border-zinc-800 text-xs font-chakra space-y-1.5">
                <div className="flex justify-between text-zinc-400 pb-1 border-b border-zinc-800 font-tajawal">
                  <span>{team1Name}</span>
                  <span className="font-bold text-amber-400">إحصائيات المواجهة الكاملة</span>
                  <span>{team2Name}</span>
                </div>

                <div className="flex justify-between items-center text-zinc-200">
                  <span>{finalStats.possessionP1}%</span>
                  <span className="text-[11px] text-zinc-400 font-tajawal">نسبة الاستحواذ</span>
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
              المطالبة بمكافأة الفوز (+20 كوينز) والعودة
            </GoldButton>
          </div>
        )}
      </div>
    </div>
  );
};
