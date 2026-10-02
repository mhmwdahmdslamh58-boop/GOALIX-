import React, { useState, useEffect } from 'react';
import { FormationType, GameMode, Player, StatQuestion, SantraChestTier } from '../../../types/game';
import { getQuestionsForGame } from '../../../data/questions';
import { getRandomPlayerByPosition } from '../../../data/players';
import { getPositionOrder, getPositionLabelAr } from '../../../services/positions';
import { GoldButton } from '../../common/GoldButton';
import { PlayerCard } from '../../common/PlayerCard';
import { PitchTactics } from '../../common/PitchTactics';
import { PassThePhoneModal } from '../../common/PassThePhoneModal';
import { MatchSimulationScreen } from '../simulation/MatchSimulationScreen';
import { MatchSimulationOutput } from '../simulation/MatchEngine';
import { sounds } from '../../../services/audio';
import { recordMatchOutcome, addPlayerToCollection } from '../../../services/storage';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Clock,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Bot,
  Users,
  Coins,
  Award,
  Package,
  RotateCcw,
} from 'lucide-react';

interface StatArenaGameProps {
  onBack: () => void;
  onFinishSave: () => void;
}

export const StatArenaGame: React.FC<StatArenaGameProps> = ({ onBack, onFinishSave }) => {
  const [phase, setPhase] = useState<'setup' | 'playing' | 'pass' | 'reveal' | 'simulating' | 'finished'>('setup');
  const [playType, setPlayType] = useState<'solo_ai' | 'local_2p'>('solo_ai');
  const [aiDifficulty, setAiDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [mode, setMode] = useState<GameMode>('quick_five');
  const [p1Name, setP1Name] = useState('المدير الفني 1');
  const [p2Name, setP2Name] = useState('محلل البيانات AI');
  const [p1Formation, setP1Formation] = useState<FormationType>('4-3-3');
  const [p2Formation, setP2Formation] = useState<FormationType>('4-3-3');

  const [questions, setQuestions] = useState<StatQuestion[]>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [activePlayer, setActivePlayer] = useState<1 | 2>(1);
  const [p1Answer, setP1Answer] = useState<number>(0);
  const [p2Answer, setP2Answer] = useState<number>(0);
  const [inputValue, setInputValue] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(20);

  const [p1Score, setP1Score] = useState(0);
  const [p2Score, setP2Score] = useState(0);
  const [p1Squad, setP1Squad] = useState<(Player | null)[]>([]);
  const [p2Squad, setP2Squad] = useState<(Player | null)[]>([]);
  const [roundWinner, setRoundWinner] = useState<1 | 2 | 'draw'>('draw');
  const [lastAwardedP1, setLastAwardedP1] = useState<Player | null>(null);
  const [lastAwardedP2, setLastAwardedP2] = useState<Player | null>(null);
  const [simResult, setSimResult] = useState<MatchSimulationOutput | null>(null);
  const [rewardsSaved, setRewardsSaved] = useState(false);

  const totalRounds = mode === 'quick_five' ? 5 : 11;
  const p1Positions = getPositionOrder(mode);
  const p2Positions = getPositionOrder(mode);

  useEffect(() => {
    if (playType === 'solo_ai' && p2Name === 'المدير الفني 2') {
      setP2Name('محلل البيانات AI');
    } else if (playType === 'local_2p' && p2Name === 'محلل البيانات AI') {
      setP2Name('المدير الفني 2');
    }
  }, [playType, p2Name]);

  const startGame = () => {
    sounds.playWhistle();
    const qs = getQuestionsForGame(p1Positions);
    setQuestions(qs);
    setP1Squad(Array(totalRounds).fill(null));
    setP2Squad(Array(totalRounds).fill(null));
    setCurrentRound(0);
    setActivePlayer(1);
    setP1Score(0);
    setP2Score(0);
    setInputValue('');
    setTimeLeft(20);
    setSimResult(null);
    setRewardsSaved(false);
    setPhase('playing');
  };

  useEffect(() => {
    if (phase !== 'playing') return;
    if (timeLeft <= 0) {
      handleSubmitAnswer();
      return;
    }
    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [phase, timeLeft]);

  const generateSmartAiGuess = (correctAnswer: number): number => {
    const varianceRatio = aiDifficulty === 'hard' ? 0.08 : aiDifficulty === 'medium' ? 0.2 : 0.38;
    const maxDelta = Math.max(2, Math.round(correctAnswer * varianceRatio));
    const offset = Math.floor(Math.random() * (maxDelta * 2 + 1)) - maxDelta;
    return Math.max(0, correctAnswer + offset);
  };

  const handleSubmitAnswer = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    sounds.playTap();
    const numericVal = parseInt(inputValue || '0', 10) || 0;

    if (playType === 'solo_ai') {
      setP1Answer(numericVal);
      const q = questions[currentRound];
      const aiVal = generateSmartAiGuess(q.correctAnswer);
      setP2Answer(aiVal);
      evaluateRound(numericVal, aiVal);
    } else {
      if (activePlayer === 1) {
        setP1Answer(numericVal);
        setInputValue('');
        setActivePlayer(2);
        setPhase('pass');
      } else {
        setP2Answer(numericVal);
        setInputValue('');
        evaluateRound(p1Answer, numericVal);
      }
    }
  };

  const evaluateRound = (ans1: number, ans2: number) => {
    const q = questions[currentRound];
    const diff1 = Math.abs(q.correctAnswer - ans1);
    const diff2 = Math.abs(q.correctAnswer - ans2);

    const pos1 = p1Positions[currentRound];
    const pos2 = p2Positions[currentRound];

    const currentP1Ids = p1Squad.filter((p): p is Player => p !== null).map((p) => p.id);
    const currentP2Ids = p2Squad.filter((p): p is Player => p !== null).map((p) => p.id);

    let winner: 1 | 2 | 'draw' = 'draw';
    let playerForP1: Player;
    let playerForP2: Player;

    if (diff1 < diff2) {
      winner = 1;
      setP1Score((s) => s + 1);
      playerForP1 = getRandomPlayerByPosition(pos1, currentP1Ids);
      playerForP2 = getRandomPlayerByPosition(pos2, [...currentP2Ids, playerForP1.id]);
    } else if (diff2 < diff1) {
      winner = 2;
      setP2Score((s) => s + 1);
      playerForP2 = getRandomPlayerByPosition(pos2, currentP2Ids);
      playerForP1 = getRandomPlayerByPosition(pos1, [...currentP1Ids, playerForP2.id]);
    } else {
      winner = 'draw';
      setP1Score((s) => s + 1);
      setP2Score((s) => s + 1);
      playerForP1 = getRandomPlayerByPosition(pos1, currentP1Ids);
      playerForP2 = getRandomPlayerByPosition(pos2, [...currentP2Ids, playerForP1.id]);
    }

    setRoundWinner(winner);
    setLastAwardedP1(playerForP1);
    setLastAwardedP2(playerForP2);

    setP1Squad((prev) => {
      const next = [...prev];
      next[currentRound] = playerForP1;
      return next;
    });
    setP2Squad((prev) => {
      const next = [...prev];
      next[currentRound] = playerForP2;
      return next;
    });

    addPlayerToCollection(playerForP1);
    if (playType === 'local_2p') {
      addPlayerToCollection(playerForP2);
    }
    sounds.playSuccess();
    setPhase('reveal');
  };

  const handleNextRound = () => {
    sounds.playTap();
    if (currentRound + 1 < totalRounds) {
      setCurrentRound((r) => r + 1);
      setActivePlayer(1);
      setTimeLeft(20);
      if (playType === 'local_2p') {
        setPhase('pass');
      } else {
        setPhase('playing');
      }
    } else {
      setPhase('simulating');
    }
  };

  const calculateSquadRating = (squad: (Player | null)[]) => {
    const valid = squad.filter((p): p is Player => p !== null);
    if (valid.length === 0) return 0;
    const sum = valid.reduce((acc, p) => acc + p.ovr, 0);
    return Math.round(sum / valid.length);
  };

  const finalizeRewardsOnce = (outcome: 'win' | 'draw' | 'loss') => {
    if (rewardsSaved) return;
    setRewardsSaved(true);
    const coins = outcome === 'win' ? 45 : outcome === 'draw' ? 20 : 10;
    const chestTier: SantraChestTier | undefined =
      outcome === 'win'
        ? aiDifficulty === 'hard'
          ? 'Gold'
          : aiDifficulty === 'medium'
          ? 'Silver'
          : 'Bronze'
        : undefined;

    recordMatchOutcome({
      matchId: `stat_arena_${Date.now()}`,
      gameId: 'stat_arena',
      isOnline: false,
      outcome,
      customCoinsReward: coins,
      awardSantraChest: chestTier,
    });
    onFinishSave();
  };

  if (phase === 'setup') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 pb-28 animate-fade-in">
        <button
          onClick={() => {
            sounds.playTap();
            onBack();
          }}
          className="flex items-center gap-2 text-zinc-400 hover:text-white mb-5 text-sm font-bold"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة إلى الألعاب</span>
        </button>

        <div className="bg-zinc-900/95 border border-amber-500/30 rounded-3xl p-6 space-y-6 shadow-2xl">
          <div className="text-center space-y-2">
            <span className="inline-block px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold">
              STAT ARENA — ساحة الإحصائيات التنافسية
            </span>
            <h2 className="text-2xl font-black text-white">إعدادات المواجهة التكتيكية</h2>
            <p className="text-xs text-zinc-400">
              صاحب التخمين الأقرب للإحصائية الحقيقية يخطف اللاعب الأقوى في المركز المستهدف!
            </p>
          </div>

          {/* Play Type */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-300 block">نظام اللعب</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  sounds.playTap();
                  setPlayType('solo_ai');
                }}
                className={`p-3.5 rounded-2xl border text-right transition-all flex items-center gap-3 ${
                  playType === 'solo_ai'
                    ? 'bg-amber-500/15 border-amber-500 text-white shadow-lg'
                    : 'bg-zinc-950/60 border-zinc-800 text-zinc-400'
                }`}
              >
                <Bot className="w-6 h-6 text-amber-400 shrink-0" />
                <div>
                  <div className="font-black text-sm">ضد الذكاء الاصطناعي (AI)</div>
                  <div className="text-[10px] text-zinc-400">مواجهة فردية فورية</div>
                </div>
              </button>
              <button
                onClick={() => {
                  sounds.playTap();
                  setPlayType('local_2p');
                }}
                className={`p-3.5 rounded-2xl border text-right transition-all flex items-center gap-3 ${
                  playType === 'local_2p'
                    ? 'bg-amber-500/15 border-amber-500 text-white shadow-lg'
                    : 'bg-zinc-950/60 border-zinc-800 text-zinc-400'
                }`}
              >
                <Users className="w-6 h-6 text-sky-400 shrink-0" />
                <div>
                  <div className="font-black text-sm">لاعبان محليًا (2P)</div>
                  <div className="text-[10px] text-zinc-400">على نفس الجهاز</div>
                </div>
              </button>
            </div>
          </div>

          {playType === 'solo_ai' && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-300 block">
                دقة الذكاء الاصطناعي (Difficulty)
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: 'easy', label: 'سهل (Easy)' },
                  { id: 'medium', label: 'متوسط (Medium)' },
                  { id: 'hard', label: 'خبير إحصائيات (Hard)' },
                ].map((d) => (
                  <button
                    key={d.id}
                    onClick={() => {
                      sounds.playTap();
                      setAiDifficulty(d.id as 'easy' | 'medium' | 'hard');
                    }}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-black transition-all ${
                      aiDifficulty === d.id
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Mode Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-300 block">عدد الجولات</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  sounds.playTap();
                  setMode('quick_five');
                }}
                className={`p-3.5 rounded-2xl border text-right transition-all ${
                  mode === 'quick_five'
                    ? 'bg-amber-500/15 border-amber-500 text-white'
                    : 'bg-zinc-950/60 border-zinc-800 text-zinc-400'
                }`}
              >
                <div className="font-black text-sm">خماسية سريعة (5 جولات)</div>
                <div className="text-[11px] opacity-75 mt-0.5">GK, DEF, MID, ATT, ATT</div>
              </button>
              <button
                onClick={() => {
                  sounds.playTap();
                  setMode('full_eleven');
                }}
                className={`p-3.5 rounded-2xl border text-right transition-all ${
                  mode === 'full_eleven'
                    ? 'bg-amber-500/15 border-amber-500 text-white'
                    : 'bg-zinc-950/60 border-zinc-800 text-zinc-400'
                }`}
              >
                <div className="font-black text-sm">تشكيلة كاملة (11 جولة)</div>
                <div className="text-[11px] opacity-75 mt-0.5">11 مركزًا كاملًا</div>
              </button>
            </div>
          </div>

          {/* Players & Formations */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-3">
              <span className="text-xs font-black text-amber-400 block">اللاعب الأول</span>
              <input
                type="text"
                value={p1Name}
                onChange={(e) => setP1Name(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm font-bold"
              />
              <select
                value={p1Formation}
                onChange={(e) => setP1Formation(e.target.value as FormationType)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white text-xs font-bold"
              >
                <option value="4-3-3">4-3-3 هجومي</option>
                <option value="4-4-2">4-4-2 كلاسيكي</option>
                <option value="4-2-3-1">4-2-3-1 استحواذ</option>
                <option value="3-5-2">3-5-2 سيطرة وسط</option>
                <option value="5-3-2">5-3-2 مرتدات</option>
              </select>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-3">
              <span className="text-xs font-black text-sky-400 block">
                {playType === 'solo_ai' ? 'المنافس الذكي (AI)' : 'اللاعب الثاني'}
              </span>
              <input
                type="text"
                value={p2Name}
                onChange={(e) => setP2Name(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm font-bold"
              />
              <select
                value={p2Formation}
                onChange={(e) => setP2Formation(e.target.value as FormationType)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white text-xs font-bold"
              >
                <option value="4-3-3">4-3-3 هجومي</option>
                <option value="4-4-2">4-4-2 كلاسيكي</option>
                <option value="4-2-3-1">4-2-3-1 استحواذ</option>
                <option value="3-5-2">3-5-2 سيطرة وسط</option>
                <option value="5-3-2">5-3-2 مرتدات</option>
              </select>
            </div>
          </div>

          <GoldButton fullWidth size="lg" onClick={startGame}>
            انطلاق المواجهة الآن (START STAT ARENA)
          </GoldButton>
        </div>
      </div>
    );
  }

  if (phase === 'pass') {
    const nextPos = activePlayer === 1 ? p1Positions[currentRound] : p2Positions[currentRound];
    return (
      <PassThePhoneModal
        nextPlayerName={activePlayer === 1 ? p1Name : p2Name}
        subtitleAr={`الجولة ${currentRound + 1} من ${totalRounds} — المركز: ${getPositionLabelAr(
          nextPos
        )}`}
        onReady={() => {
          setTimeLeft(20);
          setPhase('playing');
        }}
      />
    );
  }

  if (phase === 'reveal') {
    const q = questions[currentRound];
    return (
      <div className="max-w-3xl mx-auto px-4 py-6 pb-28 space-y-6 animate-fade-in">
        <div className="bg-zinc-900 border border-amber-500/40 rounded-3xl p-6 text-center space-y-4 shadow-2xl">
          <span className="text-xs font-bold text-amber-400">
            نتيجة الجولة {currentRound + 1} من {totalRounds}
          </span>
          <h3 className="text-lg font-bold text-zinc-200">{q.question}</h3>

          <div className="py-3 px-6 rounded-2xl bg-amber-500/15 border border-amber-500/30 inline-block">
            <span className="text-xs text-amber-300 block mb-1">الإجابة الصحيحة المعتمدة</span>
            <span className="font-chakra text-4xl font-black text-amber-400 tabular-nums">
              {q.correctAnswer}{' '}
              <small className="text-sm font-tajawal">{q.statisticType}</small>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div
              className={`p-4 rounded-2xl border ${
                roundWinner === 1 || roundWinner === 'draw'
                  ? 'bg-emerald-950/30 border-emerald-500/50'
                  : 'bg-zinc-950/60 border-zinc-800'
              }`}
            >
              <div className="text-xs font-bold text-zinc-400 mb-1">{p1Name}</div>
              <div className="font-chakra text-2xl font-black text-white tabular-nums">
                {p1Answer}
              </div>
              <div className="text-[11px] text-zinc-400 mt-1">
                الفرق: {Math.abs(q.correctAnswer - p1Answer)}
              </div>
              {lastAwardedP1 && (
                <div className="mt-4 flex flex-col items-center">
                  <span className="text-[10px] font-bold text-amber-300 mb-2">
                    اللاعب الممنوح ({lastAwardedP1.position}):
                  </span>
                  <PlayerCard player={lastAwardedP1} size="sm" showStats={false} />
                </div>
              )}
            </div>

            <div
              className={`p-4 rounded-2xl border ${
                roundWinner === 2 || roundWinner === 'draw'
                  ? 'bg-emerald-950/30 border-emerald-500/50'
                  : 'bg-zinc-950/60 border-zinc-800'
              }`}
            >
              <div className="text-xs font-bold text-zinc-400 mb-1">{p2Name}</div>
              <div className="font-chakra text-2xl font-black text-white tabular-nums">
                {p2Answer}
              </div>
              <div className="text-[11px] text-zinc-400 mt-1">
                الفرق: {Math.abs(q.correctAnswer - p2Answer)}
              </div>
              {lastAwardedP2 && (
                <div className="mt-4 flex flex-col items-center">
                  <span className="text-[10px] font-bold text-amber-300 mb-2">
                    اللاعب الممنوح ({lastAwardedP2.position}):
                  </span>
                  <PlayerCard player={lastAwardedP2} size="sm" showStats={false} />
                </div>
              )}
            </div>
          </div>

          <GoldButton fullWidth size="lg" onClick={handleNextRound}>
            {currentRound + 1 < totalRounds
              ? `الانتقال للجولة ${currentRound + 2}`
              : 'انطلاق صافرة محاكاة المباراة النهائية!'}
          </GoldButton>
        </div>
      </div>
    );
  }

  if (phase === 'simulating') {
    return (
      <MatchSimulationScreen
        team1Name={p1Name}
        team2Name={p2Name}
        team1Squad={p1Squad}
        team2Squad={p2Squad}
        advantageGoalsTeam1={p1Score > p2Score ? 1 : 0}
        advantageGoalsTeam2={p2Score > p1Score ? 1 : 0}
        onFinishMatch={(winner, _rewardCoins, output) => {
          setSimResult(output);
          const outcome: 'win' | 'draw' | 'loss' =
            winner === 'team1' ? 'win' : winner === 'draw' ? 'draw' : 'loss';
          finalizeRewardsOnce(outcome);
          setPhase('finished');
          confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
        }}
        onClose={() => {
          if (!rewardsSaved) {
            const outcome: 'win' | 'draw' | 'loss' =
              p1Score > p2Score ? 'win' : p1Score === p2Score ? 'draw' : 'loss';
            finalizeRewardsOnce(outcome);
          }
          setPhase('finished');
        }}
      />
    );
  }

  if (phase === 'finished') {
    const ovr1 = calculateSquadRating(p1Squad);
    const ovr2 = calculateSquadRating(p2Squad);
    const total1 = p1Score * 10 + ovr1 + (simResult ? simResult.goalsP1 * 20 : 0);
    const total2 = p2Score * 10 + ovr2 + (simResult ? simResult.goalsP2 * 20 : 0);
    const winnerName = simResult
      ? simResult.winner === 'team1'
        ? p1Name
        : simResult.winner === 'team2'
        ? p2Name
        : 'تعادل ملحمي!'
      : total1 >= total2
      ? p1Name
      : p2Name;

    const isP1Winner = simResult ? simResult.winner === 'team1' : total1 >= total2;
    const isDraw = simResult ? simResult.winner === 'draw' : total1 === total2;

    return (
      <div className="max-w-3xl mx-auto px-4 py-8 pb-28 space-y-6 text-center animate-fade-in">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400 to-yellow-600 mx-auto flex items-center justify-center shadow-[0_0_40px_rgba(245,158,11,0.5)]">
          <Trophy className="w-10 h-10 text-zinc-950" />
        </div>
        <div>
          <span className="text-xs font-black uppercase tracking-widest text-amber-400">
            نهاية المواجهة ومحاكاة الـ 90 دقيقة
          </span>
          <h2 className="text-3xl font-black text-white mt-1">
            {isDraw ? 'تعادل تكتيكي مثير!' : `الفائز: ${winnerName} 🏆`}
          </h2>
          {simResult && (
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-2xl bg-zinc-900 border border-amber-500/40 mt-2">
              <span className="font-black text-amber-400">{p1Name}</span>
              <span className="font-chakra text-2xl font-black text-white tabular-nums">
                {simResult.goalsP1} - {simResult.goalsP2}
              </span>
              <span className="font-black text-sky-400">{p2Name}</span>
            </div>
          )}
        </div>

        {/* Rewards Summary */}
        <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto">
          <div className="bg-zinc-900 border border-amber-500/30 rounded-2xl p-3">
            <Coins className="w-5 h-5 text-amber-400 mx-auto mb-1" />
            <div className="font-chakra text-lg font-black text-amber-300 tabular-nums">
              +{isP1Winner ? 45 : isDraw ? 20 : 10}
            </div>
            <div className="text-[10px] text-zinc-400 font-bold">كوينز مضافة</div>
          </div>
          <div className="bg-zinc-900 border border-emerald-500/30 rounded-2xl p-3">
            <Award className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
            <div className="font-chakra text-lg font-black text-emerald-400 tabular-nums">
              +{isP1Winner ? 3 : isDraw ? 1 : 0} RP
            </div>
            <div className="text-[10px] text-zinc-400 font-bold">نقاط التصنيف</div>
          </div>
          <div className="bg-zinc-900 border border-purple-500/30 rounded-2xl p-3">
            <Package className="w-5 h-5 text-purple-400 mx-auto mb-1" />
            <div className="text-xs font-black text-purple-300">
              {isP1Winner ? 'صندوق سانترا 3D' : 'بطاقات التشكيلة'}
            </div>
            <div className="text-[10px] text-zinc-400 font-bold">مكافأة الفوز</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-right">
          <div className="bg-zinc-900/90 border border-amber-500/30 rounded-3xl p-4 space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-black text-lg text-amber-400">{p1Name}</span>
              <span className="text-xs bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full font-bold">
                تقييم التشكيلة: {ovr1} • النقاط: {p1Score}
              </span>
            </div>
            <PitchTactics players={p1Squad} formation={p1Formation} />
          </div>

          <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-4 space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-black text-lg text-sky-400">{p2Name}</span>
              <span className="text-xs bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full font-bold">
                تقييم التشكيلة: {ovr2} • النقاط: {p2Score}
              </span>
            </div>
            <PitchTactics players={p2Squad} formation={p2Formation} />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <GoldButton fullWidth onClick={startGame}>
            <span className="flex items-center justify-center gap-2">
              <RotateCcw className="w-4 h-4" />
              إعادة اللعب (RESTART)
            </span>
          </GoldButton>
          <GoldButton variant="secondary" fullWidth onClick={onBack}>
            حفظ والعودة للرئيسية
          </GoldButton>
        </div>
      </div>
    );
  }

  // PLAYING PHASE
  const currentQuestion = questions[currentRound];
  const expectedPos = activePlayer === 1 ? p1Positions[currentRound] : p2Positions[currentRound];

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 pb-28 space-y-5 animate-fade-in">
      <div className="flex items-center justify-between bg-zinc-900/90 border border-zinc-800 rounded-2xl px-4 py-3">
        <div>
          <span className="text-xs text-zinc-400 block">
            الجولة {currentRound + 1} من {totalRounds}
          </span>
          <span className="font-black text-sm text-amber-400">
            دور: {activePlayer === 1 ? p1Name : p2Name}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-950 border border-amber-500/30">
            <Clock
              className={`w-4 h-4 ${timeLeft <= 5 ? 'text-rose-500 animate-ping' : 'text-amber-400'}`}
            />
            <span className="font-chakra text-lg font-black text-white tabular-nums">
              {timeLeft}s
            </span>
          </div>
          <button
            onClick={onBack}
            className="text-xs font-bold text-zinc-400 hover:text-white px-2.5 py-1.5 rounded-lg bg-zinc-800"
          >
            خروج
          </button>
        </div>
      </div>

      {/* Target Position Banner */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent border border-amber-500/30 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <div>
            <div className="text-[11px] text-zinc-400">المركز المستهدف في هذه الجولة</div>
            <div className="font-black text-sm text-white">
              {getPositionLabelAr(expectedPos)} ({expectedPos})
            </div>
          </div>
        </div>
        <span className="px-3 py-1 rounded-lg bg-amber-500 text-zinc-950 font-chakra font-black text-sm">
          {expectedPos}
        </span>
      </div>

      {/* Question Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 text-center space-y-6 shadow-xl">
        <span className="inline-block px-3 py-1 rounded-full bg-zinc-800 text-zinc-300 text-xs font-bold">
          سؤال إحصائي رسمي — {currentQuestion?.season}
        </span>
        <h3 className="text-xl sm:text-2xl font-black text-white leading-relaxed">
          {currentQuestion?.question}
        </h3>

        <form onSubmit={handleSubmitAnswer} className="space-y-4">
          <div>
            <input
              type="number"
              inputMode="numeric"
              autoFocus
              required
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="أدخل الرقم المتوقع..."
              className="w-full text-center font-chakra text-3xl font-black bg-zinc-950 border-2 border-amber-500/40 focus:border-amber-400 rounded-2xl py-4 px-6 text-amber-300 focus:outline-none tabular-nums"
            />
            <span className="text-xs text-zinc-500 mt-1.5 block">
              نوع الإحصائية: {currentQuestion?.statisticType}
            </span>
          </div>

          <GoldButton type="submit" fullWidth size="lg">
            <span className="flex items-center justify-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              تأكيد الإجابة
            </span>
          </GoldButton>
        </form>
      </div>

      {/* Current Active Player Pitch Preview */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-zinc-400">
          تشكيلة {activePlayer === 1 ? p1Name : p2Name} الحالية:
        </h4>
        <PitchTactics
          players={activePlayer === 1 ? p1Squad : p2Squad}
          formation={activePlayer === 1 ? p1Formation : p2Formation}
          selectedSlot={currentRound}
        />
      </div>
    </div>
  );
};
