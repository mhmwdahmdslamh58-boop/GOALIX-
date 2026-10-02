import React, { useState, useEffect, useRef } from 'react';
import { Player, CpuDifficulty } from '../../../types/game';
import { INITIAL_PLAYERS } from '../../../data/players';
import { generateMemoryLineup, matchPlayerName, MatchResult } from '../../../services/nameMatcher';
import { recordMatchOutcome } from '../../../services/storage';
import { sounds } from '../../../services/audio';
import { GoldButton } from '../../common/GoldButton';
import { 
  Brain, 
  Clock, 
  ArrowRight, 
  Trophy, 
  Eye, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  HelpCircle,
  Users,
  Bot,
  RotateCcw,
  Zap,
  Swords
} from 'lucide-react';

interface MemoryXIGameProps {
  player1Name: string;
  onBack: () => void;
  onGameComplete: (winner: 'p1' | 'p2' | 'draw', coinsReward: number) => void;
}

type OpponentType = 'cpu' | 'pass_phone';
type GamePhase = 
  | 'MODE_SELECT'
  | 'ROUND_INTRO'
  | 'FORMATION_VIEW'
  | 'ANSWER_INPUT'
  | 'PASS_PHONE'
  | 'ROUND_RESULT'
  | 'MATCH_RESULT';

interface GuessRecord {
  id: string;
  name: string;
  player?: Player;
  isCorrect: boolean;
  statusMessage: string;
}

interface RoundData {
  roundNumber: number;
  isTieBreak: boolean;
  lineup: Player[];
  p1Score: number;
  p2Score: number;
  p1Guesses: GuessRecord[];
  p2Guesses: GuessRecord[];
}

export const MemoryXIGame: React.FC<MemoryXIGameProps> = ({
  player1Name,
  onBack,
  onGameComplete
}) => {
  // Game Setup States
  const [opponentType, setOpponentType] = useState<OpponentType>('cpu');
  const [cpuDifficulty, setCpuDifficulty] = useState<CpuDifficulty>('Pro');
  const [player2Name, setPlayer2Name] = useState<string>('الكمبيوتر (Pro)');

  // Match Flow States
  const [gamePhase, setGamePhase] = useState<GamePhase>('MODE_SELECT');
  const [currentRoundIndex, setCurrentRoundIndex] = useState<number>(0); // 0, 1, 2
  const [isTieBreak, setIsTieBreak] = useState<boolean>(false);
  const [roundsHistory, setRoundsHistory] = useState<RoundData[]>([]);

  // Current Round State
  const [currentLineup, setCurrentLineup] = useState<Player[]>([]);
  const [activeTurnPlayer, setActiveTurnPlayer] = useState<'p1' | 'p2'>('p1');
  
  // Timers
  const [viewCountdown, setViewCountdown] = useState<number>(5);
  const [answerTimeRemaining, setAnswerTimeRemaining] = useState<number>(25);

  // Active Answering States
  const [inputName, setInputName] = useState<string>('');
  const [currentGuesses, setCurrentGuesses] = useState<GuessRecord[]>([]);
  const [foundPlayerIds, setFoundPlayerIds] = useState<string[]>([]);
  const [lastFeedback, setLastFeedback] = useState<{ message: string; type: 'success' | 'duplicate' | 'error' } | null>(null);

  // Round scores for current round
  const [p1RoundScore, setP1RoundScore] = useState<number>(0);
  const [p2RoundScore, setP2RoundScore] = useState<number>(0);

  // Match finished record
  const [matchId] = useState<string>(() => `memxi_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`);
  const [matchWinner, setMatchWinner] = useState<'p1' | 'p2' | 'draw' | null>(null);
  const [rewardCoins, setRewardCoins] = useState<number>(0);

  const inputRef = useRef<HTMLInputElement>(null);

  // Update Player 2 name when opponent or difficulty changes
  useEffect(() => {
    if (opponentType === 'cpu') {
      setPlayer2Name(`الكمبيوتر (${cpuDifficulty})`);
    } else {
      setPlayer2Name('اللاعب الثاني');
    }
  }, [opponentType, cpuDifficulty]);

  // Focus input automatically during answer phase
  useEffect(() => {
    if (gamePhase === 'ANSWER_INPUT' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [gamePhase]);

  // ================= 1. START MATCH =================
  const startNewMatch = () => {
    sounds.playTap();
    setRoundsHistory([]);
    setCurrentRoundIndex(0);
    setIsTieBreak(false);
    setMatchWinner(null);
    setRewardCoins(0);
    prepareRound(0, false);
  };

  // ================= 2. PREPARE ROUND =================
  const prepareRound = (roundIdx: number, tieBreak: boolean) => {
    // Generate exactly 11 unique real players: 1 GK, 4 DEF, 3 MID, 3 ATT
    const newLineup = generateMemoryLineup(INITIAL_PLAYERS);
    setCurrentLineup(newLineup);
    setCurrentRoundIndex(roundIdx);
    setIsTieBreak(tieBreak);

    // Reset turn
    setActiveTurnPlayer('p1');
    setCurrentGuesses([]);
    setFoundPlayerIds([]);
    setLastFeedback(null);
    setP1RoundScore(0);
    setP2RoundScore(0);

    setGamePhase('ROUND_INTRO');
  };

  // ================= 3. START 5-SECOND LINEUP VIEW =================
  const startFormationView = () => {
    sounds.playWhistle();
    setViewCountdown(5);
    setGamePhase('FORMATION_VIEW');
  };

  // View countdown effect (strictly 5 seconds)
  useEffect(() => {
    if (gamePhase !== 'FORMATION_VIEW') return;

    if (viewCountdown > 0) {
      const timer = setTimeout(() => {
        sounds.playCountdown();
        setViewCountdown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      // 5 seconds elapsed! The lineup completely disappears
      sounds.playTap();
      setCurrentGuesses([]);
      setFoundPlayerIds([]);
      setLastFeedback(null);
      setInputName('');

      // Answer duration: standard is 25s, tie break is 15s
      const answerDuration = isTieBreak ? 15 : 25;
      setAnswerTimeRemaining(answerDuration);
      setGamePhase('ANSWER_INPUT');
    }
  }, [gamePhase, viewCountdown, isTieBreak]);

  // ================= 4. ANSWER PHASE TIMER =================
  useEffect(() => {
    if (gamePhase !== 'ANSWER_INPUT') return;

    if (answerTimeRemaining > 0) {
      const timer = setTimeout(() => {
        if (answerTimeRemaining <= 5) {
          sounds.playCountdown();
        }
        setAnswerTimeRemaining(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      // Time is up for active player!
      handleTurnFinished();
    }
  }, [gamePhase, answerTimeRemaining]);

  // ================= 5. CPU SIMULATED GUESSES =================
  useEffect(() => {
    if (gamePhase !== 'ANSWER_INPUT' || activeTurnPlayer !== 'p2' || opponentType !== 'cpu') return;

    // CPU logic strictly simulated during answer phase based on difficulty
    // Rookie: 2 to 3 players, Pro: 4 to 6 players, Elite: 6 to 8 players, Legend: 8 to 10 players
    const maxTarget = 
      cpuDifficulty === 'Rookie' ? 3 :
      cpuDifficulty === 'Pro' ? 5 :
      cpuDifficulty === 'Elite' ? 7 : 9;

    const availablePlayers = [...currentLineup].sort(() => 0.5 - Math.random());
    const targetPlayerCount = Math.min(
      Math.max(1, Math.round(maxTarget + (Math.random() * 2 - 1))),
      11
    );

    const playersToGuess = availablePlayers.slice(0, targetPlayerCount);
    let guessIndex = 0;

    const intervalTime = 
      cpuDifficulty === 'Legend' ? 2200 :
      cpuDifficulty === 'Elite' ? 2800 :
      cpuDifficulty === 'Pro' ? 3500 : 4500;

    const cpuTimer = setInterval(() => {
      if (guessIndex < playersToGuess.length) {
        const target = playersToGuess[guessIndex];
        guessIndex++;

        // Add CPU guess
        setFoundPlayerIds(prev => [...prev, target.id]);
        setP2RoundScore(prev => prev + 1);
        setCurrentGuesses(prev => [
          {
            id: `cpu_${Date.now()}_${target.id}`,
            name: target.name,
            player: target,
            isCorrect: true,
            statusMessage: `✅ كان موجود: ${target.name}`
          },
          ...prev
        ]);
        sounds.playCorrect();
      } else {
        clearInterval(cpuTimer);
      }
    }, intervalTime);

    return () => clearInterval(cpuTimer);
  }, [gamePhase, activeTurnPlayer, opponentType, cpuDifficulty, currentLineup]);

  // ================= 6. SUBMIT NAME GUESS =================
  const handleSubmitName = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = inputName.trim();
    if (!clean) return;

    // Evaluate using smart name matching with Arabic & English support
    const result: MatchResult = matchPlayerName(clean, currentLineup, foundPlayerIds);

    if (result.matched && result.player && !result.alreadyFound) {
      // ✅ Correct! Was in the formation
      sounds.playCorrect();
      const newFound = [...foundPlayerIds, result.player.id];
      setFoundPlayerIds(newFound);

      if (activeTurnPlayer === 'p1') {
        setP1RoundScore(prev => prev + 1);
      } else {
        setP2RoundScore(prev => prev + 1);
      }

      setLastFeedback({
        message: `✅ كان موجود: ${result.player.name} (${result.player.position})`,
        type: 'success'
      });

      setCurrentGuesses(prev => [
        {
          id: `g_${Date.now()}`,
          name: clean,
          player: result.player || undefined,
          isCorrect: true,
          statusMessage: `✅ كان موجود: ${result.player!.name}`
        },
        ...prev
      ]);
    } else if (result.matched && result.alreadyFound) {
      // ⚠️ Already found
      sounds.playTap();
      setLastFeedback({
        message: result.statusMessage,
        type: 'duplicate'
      });
    } else {
      // ❌ Not in lineup
      sounds.playWrong();
      setLastFeedback({
        message: '❌ مش موجود في التشكيلة',
        type: 'error'
      });

      setCurrentGuesses(prev => [
        {
          id: `g_${Date.now()}`,
          name: clean,
          isCorrect: false,
          statusMessage: '❌ مش موجود'
        },
        ...prev
      ]);
    }

    setInputName('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // ================= 7. TURN FINISHED =================
  const handleTurnFinished = () => {
    sounds.playWhistle();

    if (opponentType === 'pass_phone' && activeTurnPlayer === 'p1') {
      // Player 1 finished on same device -> transition to Pass The Phone
      setGamePhase('PASS_PHONE');
    } else {
      // Both finished this round! Compute round result
      finalizeRound();
    }
  };

  // Start Player 2's turn on same device
  const startPlayer2Turn = () => {
    setActiveTurnPlayer('p2');
    setCurrentGuesses([]);
    setFoundPlayerIds([]);
    setLastFeedback(null);
    setInputName('');
    setViewCountdown(5);
    setGamePhase('FORMATION_VIEW');
  };

  // ================= 8. FINALIZE ROUND =================
  const finalizeRound = () => {
    const roundRecord: RoundData = {
      roundNumber: currentRoundIndex + 1,
      isTieBreak,
      lineup: currentLineup,
      p1Score: p1RoundScore,
      p2Score: p2RoundScore,
      p1Guesses: activeTurnPlayer === 'p1' ? currentGuesses : [],
      p2Guesses: activeTurnPlayer === 'p2' ? currentGuesses : []
    };

    const newHistory = [...roundsHistory, roundRecord];
    setRoundsHistory(newHistory);
    setGamePhase('ROUND_RESULT');
  };

  // ================= 9. ADVANCE TO NEXT ROUND OR COMPLETE =================
  const handleNextRoundOrFinish = () => {
    sounds.playTap();

    // Sum all rounds up to now
    const totalP1 = roundsHistory.reduce((sum, r) => sum + r.p1Score, 0);
    const totalP2 = roundsHistory.reduce((sum, r) => sum + r.p2Score, 0);

    if (isTieBreak) {
      // Check if tie break resolved the winner
      if (totalP1 !== totalP2) {
        finishMatch(totalP1, totalP2);
      } else {
        // Still tied! Repeat Tie Break with a new lineup
        prepareRound(currentRoundIndex + 1, true);
      }
      return;
    }

    // Standard 3 rounds
    if (currentRoundIndex < 2) {
      // Advance to round 2 or 3
      prepareRound(currentRoundIndex + 1, false);
    } else {
      // Round 3 finished! Check for tie
      if (totalP1 === totalP2) {
        // Tie! Start Tie Break
        prepareRound(3, true);
      } else {
        // Clear winner!
        finishMatch(totalP1, totalP2);
      }
    }
  };

  // ================= 10. FINISH MATCH & RECORD COINS =================
  const finishMatch = (totalP1: number, totalP2: number) => {
    let outcome: 'win' | 'loss' | 'draw' = 'draw';
    let winner: 'p1' | 'p2' | 'draw' = 'draw';

    if (totalP1 > totalP2) {
      outcome = 'win';
      winner = 'p1';
      sounds.playGoal();
    } else if (totalP2 > totalP1) {
      outcome = 'loss';
      winner = 'p2';
      sounds.playWrong();
    }

    setMatchWinner(winner);

    const coinsReward = outcome === 'win' ? 45 : outcome === 'draw' ? 20 : 10;
    recordMatchOutcome({
      matchId: `memxi_${Date.now()}_${currentRoundIndex}`,
      gameId: 'memory_xi',
      isOnline: false,
      outcome,
      customCoinsReward: coinsReward,
      awardSantraChest: outcome === 'win' ? 'Gold' : undefined,
    });

    setRewardCoins(coinsReward);
    setGamePhase('MATCH_RESULT');
    onGameComplete(winner, coinsReward);
  };

  // Cumulative totals
  const totalP1Score = roundsHistory.reduce((sum, r) => sum + r.p1Score, 0);
  const totalP2Score = roundsHistory.reduce((sum, r) => sum + r.p2Score, 0);

  return (
    <div className="min-h-screen bg-[#08080a] text-zinc-100 pb-20 select-none font-tajawal antialiased">
      {/* ================= TOP NAVIGATION BAR ================= */}
      <header className="sticky top-0 z-40 bg-[#0a0b0e]/95 backdrop-blur-md border-b border-zinc-800 px-4 py-2.5 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-amber-400 font-bold hover:text-amber-300 transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          <span>خروج</span>
        </button>

        <div className="flex items-center gap-1.5">
          <Brain className="w-4 h-4 text-amber-400 animate-pulse" />
          <h1 className="font-chakra font-black text-sm tracking-wider text-white">
            MEMORY XI
          </h1>
          <span className="text-[10px] text-amber-400 font-chakra font-bold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
            {isTieBreak ? 'TIE BREAK' : `جولة ${Math.min(currentRoundIndex + 1, 3)} / 3`}
          </span>
        </div>

        {/* Live Score Counter */}
        <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-lg text-xs font-chakra font-black">
          <span className="text-amber-400">{totalP1Score}</span>
          <span className="text-zinc-500">-</span>
          <span className="text-zinc-300">{totalP2Score}</span>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 py-3 space-y-4">
        {/* ================= 1. MODE SELECT SCREEN ================= */}
        {gamePhase === 'MODE_SELECT' && (
          <div className="space-y-4">
            {/* Banner Artwork */}
            <div className="relative rounded-2xl overflow-hidden border border-amber-500/40 shadow-2xl aspect-[16/9]">
              <img
                src="/src/assets/images/memory_xi_cover_1790801558164.jpg"
                alt="Memory XI"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex flex-col justify-end p-4">
                <span className="text-[10px] font-chakra font-bold text-amber-400 uppercase tracking-widest">
                  NEW CHALLENGE
                </span>
                <h2 className="text-2xl font-black font-chakra text-white">
                  MEMORY XI
                </h2>
                <p className="text-xs text-zinc-300 font-tajawal mt-0.5">
                  احفظ التشكيلة في 5 ثوانٍ، ثم تذكر واكتب أسماء اللاعبين!
                </p>
              </div>
            </div>

            {/* Rules Summary */}
            <div className="bg-zinc-900/90 rounded-2xl p-4 border border-zinc-800 space-y-2 text-xs text-zinc-300">
              <h3 className="font-bold text-amber-400 text-sm flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                قواعد اللعبة الرسمية
              </h3>
              <ul className="space-y-1.5 text-zinc-300 text-[11px] list-disc list-inside">
                <li>المباراة تتكون من <strong className="text-amber-300">3 جولات</strong> بالضبط.</li>
                <li>في كل جولة تظهر تشكيلة كاملة من <strong className="text-amber-300">11 لاعباً حقيقياً</strong> (1 GK · 4 DEF · 3 MID · 3 ATT).</li>
                <li>تظهر التشكيلة لمدة <strong className="text-amber-300">5 ثوانٍ فقط</strong> ثم تختفي تماماً.</li>
                <li>لا توجد اختيارات جاهزة؛ اكتب أسماء اللاعبين الذين تتذكرهم بنفسك.</li>
                <li>كل لاعب صحيح = <strong className="text-amber-300">+1 نقطة</strong> (بدون تكرار).</li>
                <li>في حالة التعادل بعد 3 جولات، يُلعب شوط كسر التعادل <strong className="text-amber-300">Tie Break</strong>.</li>
              </ul>
            </div>

            {/* Select Opponent Type */}
            <div className="bg-zinc-900/90 rounded-2xl p-4 border border-zinc-800 space-y-3">
              <h4 className="text-xs font-bold text-zinc-200">اختر طريقة اللعب:</h4>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    sounds.playTap();
                    setOpponentType('cpu');
                  }}
                  className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                    opponentType === 'cpu'
                      ? 'border-amber-400 bg-amber-500/10 text-amber-300'
                      : 'border-zinc-800 bg-black/40 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <Bot className="w-5 h-5 text-amber-400" />
                  <span className="font-bold text-xs">ضد الكمبيوتر (CPU)</span>
                  <span className="text-[10px] text-zinc-400">ذكاء يحاكي الذاكرة البشرية</span>
                </button>

                <button
                  onClick={() => {
                    sounds.playTap();
                    setOpponentType('pass_phone');
                  }}
                  className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                    opponentType === 'pass_phone'
                      ? 'border-amber-400 bg-amber-500/10 text-amber-300'
                      : 'border-zinc-800 bg-black/40 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <Users className="w-5 h-5 text-amber-400" />
                  <span className="font-bold text-xs">صديق على نفس الجهاز</span>
                  <span className="text-[10px] text-zinc-400">Pass the Phone</span>
                </button>
              </div>

              {/* CPU Difficulty Picker */}
              {opponentType === 'cpu' && (
                <div className="pt-2 border-t border-zinc-800/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400">مستوى ذكاء الكمبيوتر:</span>
                    <span className="text-amber-400 font-bold font-chakra">{cpuDifficulty}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(['Rookie', 'Pro', 'Elite', 'Legend'] as CpuDifficulty[]).map(diff => (
                      <button
                        key={diff}
                        onClick={() => {
                          sounds.playTap();
                          setCpuDifficulty(diff);
                        }}
                        className={`py-1.5 px-2 rounded-lg border text-center text-xs font-chakra font-bold transition-all ${
                          cpuDifficulty === diff
                            ? 'border-amber-400 bg-amber-500/20 text-amber-300'
                            : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700'
                        }`}
                      >
                        {diff}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <GoldButton onClick={startNewMatch} fullWidth size="lg">
              <Zap className="w-5 h-5" />
              بدء المباراة (3 جولات)
            </GoldButton>
          </div>
        )}

        {/* ================= 2. ROUND INTRO SCREEN ================= */}
        {gamePhase === 'ROUND_INTRO' && (
          <div className="bg-zinc-900/95 rounded-2xl p-6 border border-zinc-800 text-center space-y-5 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 border-2 border-amber-400 mx-auto flex items-center justify-center">
              <Brain className="w-8 h-8 text-amber-400" />
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-chakra font-bold text-amber-400 uppercase tracking-widest">
                {isTieBreak ? '⚡ TIE BREAK ROUND' : `الجولة ${currentRoundIndex + 1} من 3`}
              </span>
              <h2 className="text-2xl font-black text-white">
                {opponentType === 'pass_phone'
                  ? `دور: ${activeTurnPlayer === 'p1' ? player1Name : player2Name}`
                  : `استعد يا ${player1Name}!`}
              </h2>
              <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                ستظهر تشكيلة من 11 لاعباً حقيقياً لمدة <strong className="text-amber-300">5 ثوانٍ فقط</strong>.
                احفظ أكبر عدد ممكن من الأسماء!
              </p>
            </div>

            <div className="p-3 bg-black/40 rounded-xl border border-zinc-800 text-xs text-zinc-300 flex items-center justify-around">
              <div>
                <span className="text-[10px] text-zinc-500 block">وقت الظهور</span>
                <span className="font-chakra font-bold text-amber-400 text-sm">5 ثوانٍ</span>
              </div>
              <div className="w-px h-8 bg-zinc-800" />
              <div>
                <span className="text-[10px] text-zinc-500 block">وقت الإجابة</span>
                <span className="font-chakra font-bold text-amber-400 text-sm">{isTieBreak ? '15 ثانية' : '25 ثانية'}</span>
              </div>
              <div className="w-px h-8 bg-zinc-800" />
              <div>
                <span className="text-[10px] text-zinc-500 block">التشكيلة</span>
                <span className="font-chakra font-bold text-amber-400 text-sm">4-3-3</span>
              </div>
            </div>

            <GoldButton onClick={startFormationView} fullWidth size="lg">
              <Eye className="w-5 h-5" />
              عرض التشكيلة (5 ثوانٍ)
            </GoldButton>
          </div>
        )}

        {/* ================= 3. 5-SECOND FORMATION VIEW ================= */}
        {gamePhase === 'FORMATION_VIEW' && (
          <div className="space-y-3">
            {/* Countdown Banner */}
            <div className="bg-amber-500/10 border border-amber-500/50 rounded-2xl p-3 flex items-center justify-between shadow-lg animate-pulse">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-400 animate-spin" />
                <div>
                  <h3 className="text-xs font-bold text-amber-300">احفظ أسماء التشكيلة الآن!</h3>
                  <span className="text-[10px] text-zinc-400">ستختفي بعد انتهاء العد التنازلي</span>
                </div>
              </div>

              <div className="w-12 h-12 rounded-xl bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center font-chakra font-black text-2xl text-amber-400">
                {viewCountdown}
              </div>
            </div>

            {/* 2D Pitch with 11 Real Players */}
            <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-600/60 shadow-2xl bg-gradient-to-b from-[#0b381e] via-[#0d4625] to-[#082915] p-3 aspect-[3/4]">
              {/* Pitch Markings */}
              <div className="absolute inset-0 pointer-events-none opacity-25">
                <div className="absolute top-1/2 left-0 right-0 h-px bg-white" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full border border-white" />
                <div className="absolute top-0 left-1/4 right-1/4 h-16 border-b border-x border-white" />
                <div className="absolute bottom-0 left-1/4 right-1/4 h-16 border-t border-x border-white" />
              </div>

              {/* 11 Players Grid in 4-3-3: 1 GK, 4 DEF, 3 MID, 3 ATT */}
              <div className="relative z-10 h-full flex flex-col justify-between py-1">
                {/* Attackers (3) */}
                <div className="grid grid-cols-3 gap-1">
                  {currentLineup.slice(8, 11).map((p, idx) => (
                    <div key={p.id || idx} className="flex flex-col items-center">
                      <div className="relative w-12 h-12 rounded-full border-2 border-amber-400 overflow-hidden shadow-md bg-zinc-900">
                        <img src={p.image} alt={p.name} className="w-full h-full object-cover object-top" />
                      </div>
                      <span className="text-[10px] font-bold text-white bg-black/70 px-1.5 py-0.5 rounded-md mt-1 truncate max-w-[85px] text-center border border-zinc-700">
                        {p.name}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Midfielders (3) */}
                <div className="grid grid-cols-3 gap-1">
                  {currentLineup.slice(5, 8).map((p, idx) => (
                    <div key={p.id || idx} className="flex flex-col items-center">
                      <div className="relative w-12 h-12 rounded-full border-2 border-emerald-400 overflow-hidden shadow-md bg-zinc-900">
                        <img src={p.image} alt={p.name} className="w-full h-full object-cover object-top" />
                      </div>
                      <span className="text-[10px] font-bold text-white bg-black/70 px-1.5 py-0.5 rounded-md mt-1 truncate max-w-[85px] text-center border border-zinc-700">
                        {p.name}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Defenders (4) */}
                <div className="grid grid-cols-4 gap-1">
                  {currentLineup.slice(1, 5).map((p, idx) => (
                    <div key={p.id || idx} className="flex flex-col items-center">
                      <div className="relative w-11 h-11 rounded-full border-2 border-blue-400 overflow-hidden shadow-md bg-zinc-900">
                        <img src={p.image} alt={p.name} className="w-full h-full object-cover object-top" />
                      </div>
                      <span className="text-[9px] font-bold text-white bg-black/70 px-1 py-0.5 rounded-md mt-1 truncate max-w-[70px] text-center border border-zinc-700">
                        {p.name}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Goalkeeper (1) */}
                <div className="flex flex-col items-center">
                  {currentLineup[0] && (
                    <>
                      <div className="relative w-12 h-12 rounded-full border-2 border-yellow-400 overflow-hidden shadow-md bg-zinc-900">
                        <img src={currentLineup[0].image} alt={currentLineup[0].name} className="w-full h-full object-cover object-top" />
                      </div>
                      <span className="text-[10px] font-bold text-white bg-black/70 px-1.5 py-0.5 rounded-md mt-1 truncate max-w-[85px] text-center border border-zinc-700">
                        {currentLineup[0].name}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= 4. ANSWER INPUT PHASE ================= */}
        {gamePhase === 'ANSWER_INPUT' && (
          <div className="space-y-4">
            {/* Top Timer & Turn Status */}
            <div className="bg-zinc-900/90 rounded-2xl p-3 border border-zinc-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-zinc-400 block font-chakra uppercase">
                  {activeTurnPlayer === 'p1' ? player1Name : player2Name}
                </span>
                <span className="text-xs font-bold text-zinc-100">
                  تم تذكر: <strong className="text-amber-400 font-chakra text-sm">{foundPlayerIds.length}</strong> / 11 لاعبين
                </span>
              </div>

              {/* Countdown circle */}
              <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 font-chakra font-black text-sm ${
                answerTimeRemaining <= 5 
                  ? 'border-red-500 bg-red-950/40 text-red-400 animate-pulse'
                  : 'border-amber-500/40 bg-amber-500/10 text-amber-400'
              }`}>
                <Clock className="w-4 h-4" />
                <span>{answerTimeRemaining}s</span>
              </div>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmitName} className="space-y-2">
              <label className="text-xs font-bold text-amber-300 block">
                اكتب اسم أي لاعب فاكره:
              </label>

              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputName}
                  onChange={e => setInputName(e.target.value)}
                  placeholder="مثال: صلاح أو بنزيما أو ميسي أو مبابي..."
                  className="w-full bg-black/80 border-2 border-amber-500/50 rounded-xl px-4 py-3 text-base text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 shadow-inner"
                  autoComplete="off"
                />
                <button
                  type="submit"
                  disabled={!inputName.trim()}
                  className="absolute left-2 top-2 bottom-2 px-4 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold text-xs hover:brightness-110 active:scale-95 disabled:opacity-40 transition-all"
                >
                  إرسال
                </button>
              </div>
            </form>

            {/* Immediate Match Feedback Banner */}
            {lastFeedback && (
              <div className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                lastFeedback.type === 'success'
                  ? 'bg-emerald-950/50 border-emerald-500 text-emerald-300'
                  : lastFeedback.type === 'duplicate'
                  ? 'bg-amber-950/50 border-amber-500 text-amber-300'
                  : 'bg-red-950/50 border-red-500 text-red-300'
              }`}>
                {lastFeedback.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                {lastFeedback.type === 'duplicate' && <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />}
                {lastFeedback.type === 'error' && <XCircle className="w-4 h-4 text-red-400 shrink-0" />}
                <span>{lastFeedback.message}</span>
              </div>
            )}

            {/* List of Remembered / Guessed Players */}
            <div className="bg-zinc-900/90 rounded-2xl p-4 border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-zinc-300">سجل الإجابات في هذه الجولة:</h4>
                <span className="text-[10px] text-zinc-500">{currentGuesses.length} محاولات</span>
              </div>

              {currentGuesses.length === 0 ? (
                <div className="py-6 text-center text-xs text-zinc-500">
                  لم ترسل أي اسم بعد. اكتب اسم اللاعب واضغط إرسال!
                </div>
              ) : (
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {currentGuesses.map((g) => (
                    <div
                      key={g.id}
                      className={`p-2 rounded-xl border flex items-center justify-between text-xs ${
                        g.isCorrect
                          ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                          : 'bg-red-950/20 border-red-500/30 text-red-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {g.isCorrect ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                        )}
                        <span className="font-bold">{g.name}</span>
                        {g.player && (
                          <span className="text-[10px] text-zinc-400">
                            ({g.player.club} · {g.player.position})
                          </span>
                        )}
                      </div>

                      <span className="text-[10px] font-chakra font-bold">
                        {g.isCorrect ? '+1 نقطة' : '0'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Finish Turn Early button */}
            <button
              onClick={handleTurnFinished}
              className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-300 active:scale-98 transition-all"
            >
              إنهاء دوري الآن والانتقال للنتيجة
            </button>
          </div>
        )}

        {/* ================= 5. PASS THE PHONE SCREEN ================= */}
        {gamePhase === 'PASS_PHONE' && (
          <div className="bg-zinc-900/95 rounded-2xl p-6 border border-zinc-800 text-center space-y-5 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 border-2 border-amber-400 mx-auto flex items-center justify-center">
              <Users className="w-8 h-8 text-amber-400" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-black text-white">
                أعطِ الهاتف لـ {player2Name}!
              </h2>
              <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                تم حفظ إجابات {player1Name} وإخفاؤها تماماً. الآن جاء دور {player2Name} لرؤية التشكيلة لمدة 5 ثوانٍ ومحاولة تذكر الأسماء.
              </p>
            </div>

            <div className="p-3 bg-black/40 rounded-xl border border-zinc-800 text-xs text-amber-300">
              🔒 تم حجب الإجابات السابقة لضمان النزاهة التامة
            </div>

            <GoldButton onClick={startPlayer2Turn} fullWidth size="lg">
              <Eye className="w-5 h-5" />
              أنا {player2Name}، اعرض التشكيلة (5 ثوانٍ)
            </GoldButton>
          </div>
        )}

        {/* ================= 6. ROUND RESULT SCREEN ================= */}
        {gamePhase === 'ROUND_RESULT' && (
          <div className="space-y-4">
            <div className="bg-zinc-900/90 rounded-2xl p-5 border border-zinc-800 text-center space-y-4">
              <span className="text-[10px] font-chakra font-bold text-amber-400 uppercase tracking-widest">
                {isTieBreak ? '⚡ نتيـجة كسر التعادل' : `نتيجة الجولة ${currentRoundIndex + 1}`}
              </span>

              {/* Round Score Comparison */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-black/50 border border-zinc-800 space-y-1">
                  <span className="text-[11px] text-zinc-400 block truncate">{player1Name}</span>
                  <span className="text-3xl font-chakra font-black text-amber-400">{p1RoundScore}</span>
                  <span className="text-[10px] text-zinc-500 block">نقاط الجولة</span>
                </div>

                <div className="p-3 rounded-xl bg-black/50 border border-zinc-800 space-y-1">
                  <span className="text-[11px] text-zinc-400 block truncate">{player2Name}</span>
                  <span className="text-3xl font-chakra font-black text-zinc-200">{p2RoundScore}</span>
                  <span className="text-[10px] text-zinc-500 block">نقاط الجولة</span>
                </div>
              </div>

              {/* Cumulative Scoreboard */}
              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 space-y-2">
                <h5 className="text-[11px] font-bold text-zinc-400">مجموع النقاط حتى الآن:</h5>
                <div className="flex items-center justify-center gap-4 text-sm font-chakra font-black">
                  <span className="text-amber-400">{player1Name}: {totalP1Score}</span>
                  <span className="text-zinc-600">VS</span>
                  <span className="text-zinc-200">{player2Name}: {totalP2Score}</span>
                </div>
              </div>
            </div>

            {/* Complete 11 Players Revealed */}
            <div className="bg-zinc-900/90 rounded-2xl p-4 border border-zinc-800 space-y-3">
              <h4 className="text-xs font-bold text-amber-400">التشكيلة الكاملة للجولة (11 لاعباً):</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {currentLineup.map((p) => {
                  const wasFoundByP1 = foundPlayerIds.includes(p.id);
                  return (
                    <div
                      key={p.id}
                      className="p-2 rounded-xl bg-black/40 border border-zinc-800 flex items-center gap-2"
                    >
                      <img src={p.image} alt={p.name} className="w-8 h-8 rounded-lg object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-zinc-200 truncate">{p.name}</p>
                        <p className="text-[10px] text-zinc-400">{p.position} · {p.club}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <GoldButton onClick={handleNextRoundOrFinish} fullWidth size="lg">
              {currentRoundIndex < 2 && !isTieBreak
                ? `الانتقال إلى الجولة ${currentRoundIndex + 2}`
                : isTieBreak
                ? 'متابعة نتيجة كسر التعادل'
                : 'عرض النتيجة النهائية للمباراة'}
            </GoldButton>
          </div>
        )}

        {/* ================= 7. MATCH RESULT SCREEN ================= */}
        {gamePhase === 'MATCH_RESULT' && (
          <div className="bg-zinc-900/95 rounded-2xl p-6 border border-zinc-800 text-center space-y-5 shadow-2xl">
            <div className="w-20 h-20 rounded-full bg-amber-500/10 border-2 border-amber-400 mx-auto flex items-center justify-center shadow-lg">
              <Trophy className="w-10 h-10 text-amber-400" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-chakra font-bold text-amber-400 uppercase tracking-widest">
                FINAL MATCH RESULT
              </span>
              <h2 className="text-2xl font-black text-white">
                {matchWinner === 'p1'
                  ? `مبروك الفوز يا ${player1Name}! 🏆`
                  : matchWinner === 'p2'
                  ? `فاز ${player2Name}! حظ أوفر في المرة القادمة`
                  : 'تعادل تاريخي! 🤝'}
              </h2>
            </div>

            {/* Rounds Score Breakdown (e.g. Round 1: 7-5, Round 2: 4-6, Round 3: 8-7 -> Final 19-18) */}
            <div className="bg-black/50 rounded-xl p-4 border border-zinc-800 space-y-2 text-xs">
              <h5 className="font-bold text-zinc-400 text-center mb-2">تفاصيل الجولات الثلاث:</h5>
              {roundsHistory.map((r, i) => (
                <div key={i} className="flex items-center justify-between py-1 border-b border-zinc-800/60 last:border-none">
                  <span className="text-zinc-400">{r.isTieBreak ? 'Tie Break' : `الجولة ${r.roundNumber}`}</span>
                  <span className="font-chakra font-bold text-zinc-200">
                    {r.p1Score} - {r.p2Score}
                  </span>
                </div>
              ))}

              <div className="pt-2 border-t border-zinc-700 flex items-center justify-between font-chakra font-black text-sm">
                <span className="text-amber-400">FINAL TOTAL:</span>
                <span className="text-amber-400 text-base">
                  {totalP1Score} - {totalP2Score}
                </span>
              </div>
            </div>

            {/* Economic Coins Reward Banner */}
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/40 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-zinc-300 font-medium">مكافأة المباراة:</span>
              </div>
              <span className="font-chakra font-black text-amber-300 text-sm">
                {rewardCoins >= 0 ? `+${rewardCoins}` : rewardCoins} Coins
              </span>
            </div>

            <div className="space-y-2">
              <GoldButton onClick={startNewMatch} fullWidth size="lg">
                <RotateCcw className="w-5 h-5" />
                مباراة جديدة
              </GoldButton>

              <button
                onClick={onBack}
                className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-300 transition-colors"
              >
                العودة إلى مركز الألعاب
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
