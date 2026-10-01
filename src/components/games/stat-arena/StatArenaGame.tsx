import React, { useState } from 'react';
import { 
  GameMode, 
  CpuDifficulty, 
  PositionType, 
  StatQuestion, 
  Player 
} from '../../../types/game';
import { getQuestionsForGame } from '../../../data/questions';
import { getRandomPlayerByPosition } from '../../../data/players';
import { 
  getPositionOrder, 
  getPositionLabelAr 
} from '../../../services/positions';
import { GoldButton } from '../../common/GoldButton';
import { PassThePhoneModal } from '../../common/PassThePhoneModal';
import { MatchSimulationScreen } from '../simulation/MatchSimulationScreen';
import { sounds } from '../../../services/audio';
import { Trophy, HelpCircle, User, Bot, ArrowRight, Check, Award } from 'lucide-react';

interface StatArenaGameProps {
  onBack: () => void;
  onGameComplete: (winner: 'p1' | 'p2' | 'draw', coinsReward: number) => void;
  player1Name?: string;
}

type OpponentType = 'cpu' | 'same_device';

export const StatArenaGame: React.FC<StatArenaGameProps> = ({
  onBack,
  onGameComplete,
  player1Name: defaultP1Name = 'كابتن جواليكس'
}) => {
  // Game Setup State
  const [inSetup, setInSetup] = useState(true);
  const [p1CustomName, setP1CustomName] = useState(defaultP1Name);
  const [p2CustomName, setP2CustomName] = useState('اللاعب 2');
  const [mode, setMode] = useState<GameMode>('quick_five');
  const [opponentType, setOpponentType] = useState<OpponentType>('cpu');
  const [cpuDifficulty, setCpuDifficulty] = useState<CpuDifficulty>('Pro');

  // Active Match State
  const [positions, setPositions] = useState<PositionType[]>(getPositionOrder('quick_five'));
  const [questions, setQuestions] = useState<StatQuestion[]>([]);
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);

  // Answers & Differences
  const [p1Answer, setP1Answer] = useState<string>('');
  const [p2Answer, setP2Answer] = useState<string>('');
  const [p1DiffSum, setP1DiffSum] = useState<number>(0);
  const [p2DiffSum, setP2DiffSum] = useState<number>(0);

  // Same-Device Passing
  const [waitingForP2Turn, setWaitingForP2Turn] = useState(false);
  const [showPassModal, setShowPassModal] = useState(false);

  // Round Results
  const [roundRevealed, setRoundRevealed] = useState(false);
  const [lastRoundWinner, setLastRoundWinner] = useState<'p1' | 'p2' | 'tie' | null>(null);
  const [loserReward, setLoserReward] = useState<{ recipient: string; player: Player } | null>(null);

  // Accumulated Squads
  const [p1Squad, setP1Squad] = useState<Player[]>([]);
  const [p2Squad, setP2Squad] = useState<Player[]>([]);

  // Challenge Complete & Simulation
  const [challengeFinished, setChallengeFinished] = useState(false);
  const [showSimScreen, setShowSimScreen] = useState(false);

  const startMatch = () => {
    sounds.playTap();
    const posList = getPositionOrder(mode);
    const matchQuestions = getQuestionsForGame(posList);

    setPositions(posList);
    setQuestions(matchQuestions);
    setCurrentRoundIndex(0);
    setP1DiffSum(0);
    setP2DiffSum(0);
    setP1Squad([]);
    setP2Squad([]);
    setP1Answer('');
    setP2Answer('');
    setRoundRevealed(false);
    setLastRoundWinner(null);
    setLoserReward(null);
    setChallengeFinished(false);
    setInSetup(false);
  };

  const currentPos = positions[currentRoundIndex];
  const currentQ = questions[currentRoundIndex];

  // Submit Player 1 Answer
  const handleP1Submit = () => {
    if (!p1Answer.trim() || isNaN(Number(p1Answer))) return;
    sounds.playTap();

    if (opponentType === 'cpu') {
      // Calculate intelligent CPU Answer based on difficulty
      const correct = currentQ.correctAnswer;
      let variance = 0;
      if (cpuDifficulty === 'Rookie') variance = Math.floor(Math.random() * 25) - 12;
      else if (cpuDifficulty === 'Pro') variance = Math.floor(Math.random() * 12) - 6;
      else if (cpuDifficulty === 'Elite') variance = Math.floor(Math.random() * 6) - 3;
      else if (cpuDifficulty === 'Legend') variance = Math.floor(Math.random() * 3) - 1;

      const generatedCpuAns = Math.max(0, correct + variance);
      evaluateRound(Number(p1Answer), generatedCpuAns);
    } else {
      // Same-Device: Hide P1 answer and prompt to pass the phone to P2
      setWaitingForP2Turn(true);
      setShowPassModal(true);
    }
  };

  // Submit Player 2 Answer (Same Device)
  const handleP2Submit = () => {
    if (!p2Answer.trim() || isNaN(Number(p2Answer))) return;
    sounds.playTap();
    evaluateRound(Number(p1Answer), Number(p2Answer));
  };

  // Authoritative Round Evaluation
  const evaluateRound = (ans1: number, ans2: number) => {
    sounds.playReveal();
    const correct = currentQ.correctAnswer;
    const diff1 = Math.abs(ans1 - correct);
    const diff2 = Math.abs(ans2 - correct);

    const newP1DiffSum = p1DiffSum + diff1;
    const newP2DiffSum = p2DiffSum + diff2;
    setP1DiffSum(newP1DiffSum);
    setP2DiffSum(newP2DiffSum);

    let winner: 'p1' | 'p2' | 'tie' = 'tie';
    let reward: { recipient: string; player: Player } | null = null;

    if (diff1 < diff2) {
      winner = 'p1';
      // P2 is loser -> receives random player from CURRENT POSITION PHASE
      const rewardPlayer = getRandomPlayerByPosition(currentPos);
      setP2Squad(prev => [...prev, rewardPlayer]);
      reward = { recipient: opponentType === 'cpu' ? `الكمبيوتر (${cpuDifficulty})` : p2CustomName, player: rewardPlayer };
    } else if (diff2 < diff1) {
      winner = 'p2';
      // P1 is loser -> receives random player from CURRENT POSITION PHASE
      const rewardPlayer = getRandomPlayerByPosition(currentPos);
      setP1Squad(prev => [...prev, rewardPlayer]);
      reward = { recipient: p1CustomName, player: rewardPlayer };
    } else {
      winner = 'tie';
      const r1 = getRandomPlayerByPosition(currentPos);
      const r2 = getRandomPlayerByPosition(currentPos, [r1.id]);
      setP1Squad(prev => [...prev, r1]);
      setP2Squad(prev => [...prev, r2]);
    }

    setLastRoundWinner(winner);
    setLoserReward(reward);
    setRoundRevealed(true);
    setWaitingForP2Turn(false);
  };

  // Move to next round or finish challenge
  const handleNextRound = () => {
    sounds.playTap();
    if (currentRoundIndex + 1 < positions.length) {
      setCurrentRoundIndex(prev => prev + 1);
      setP1Answer('');
      setP2Answer('');
      setRoundRevealed(false);
      setLastRoundWinner(null);
      setLoserReward(null);
    } else {
      // Challenge phase complete! Show comparison & start simulation
      setChallengeFinished(true);
    }
  };

  // Calculate challenge winner for 1-0 advantage
  const challengeAdvantage = p1DiffSum < p2DiffSum ? 'p1' : p2DiffSum < p1DiffSum ? 'p2' : 'none';

  return (
    <div className="min-h-screen bg-[#08080a] text-zinc-100 pb-20 select-none">
      {/* Top Header */}
      <div className="sticky top-0 z-30 bg-[#0a0b0e]/95 backdrop-blur-md border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-amber-400 font-tajawal hover:text-amber-300"
        >
          <ArrowRight className="w-4 h-4" />
          <span>خروج من اللعبة</span>
        </button>

        <div className="text-center">
          <h2 className="font-chakra font-black text-sm tracking-wider bg-gradient-to-r from-amber-200 to-amber-500 bg-clip-text text-transparent">
            STAT ARENA
          </h2>
          <span className="text-[10px] text-zinc-400">تحدي التوقعات الإحصائية</span>
        </div>

        <div className="w-16" />
      </div>

      <div className="max-w-md mx-auto px-4 py-4">
        {/* ================= 1. SETUP SCREEN ================= */}
        {inSetup && (
          <div className="space-y-4">
            {/* Game Cover Art */}
            <div className="relative rounded-2xl overflow-hidden border border-amber-500/30 aspect-[16/9] shadow-xl">
              <img
                src="/src/assets/images/stat_arena_cover_1790797310047.jpg"
                alt="STAT ARENA"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex flex-col justify-end p-4">
                <span className="text-xs font-chakra font-bold text-amber-400 uppercase tracking-widest">
                  COMPETITIVE PREDICTION ARENA
                </span>
                <h3 className="text-xl font-black font-tajawal text-white">
                  تحدي أرقام وإحصائيات كرة القدم
                </h3>
              </div>
            </div>

            {/* Mode Selection */}
            <div className="bg-zinc-900/90 rounded-2xl p-4 border border-zinc-800 space-y-3">
              {/* Player Names Input */}
              <div className="space-y-2 pb-2 border-b border-zinc-800">
                <label className="text-xs font-bold text-amber-400 block font-tajawal">
                  أسماء اللاعبين (Player Names):
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-zinc-400 font-tajawal block mb-1">اللاعب 1:</span>
                    <input
                      type="text"
                      value={p1CustomName}
                      onChange={e => setP1CustomName(e.target.value)}
                      className="w-full bg-black/60 border border-zinc-700 rounded-xl px-3 py-2 text-xs font-bold text-amber-300 focus:outline-none focus:border-amber-400 text-center"
                      placeholder="اسمك"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-400 font-tajawal block mb-1">اللاعب 2:</span>
                    <input
                      type="text"
                      value={p2CustomName}
                      onChange={e => setP2CustomName(e.target.value)}
                      disabled={opponentType === 'cpu'}
                      className="w-full bg-black/60 border border-zinc-700 rounded-xl px-3 py-2 text-xs font-bold text-zinc-200 focus:outline-none focus:border-amber-400 text-center disabled:opacity-50"
                      placeholder="اسم المنافس"
                    />
                  </div>
                </div>
              </div>

              <label className="text-xs font-bold text-amber-400 block font-tajawal">
                اختر نظام الجولات (التسلسل التلقائي للمراكز):
              </label>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setMode('quick_five')}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    mode === 'quick_five'
                      ? 'border-amber-400 bg-amber-500/10 text-amber-300'
                      : 'border-zinc-800 bg-black/40 text-zinc-400'
                  }`}
                >
                  <p className="font-chakra font-bold text-sm">Quick Five</p>
                  <p className="text-[10px] text-zinc-400 mt-1">5 مراكز (GK, DEF, MID, 2 ATT)</p>
                </button>

                <button
                  onClick={() => setMode('full_eleven')}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    mode === 'full_eleven'
                      ? 'border-amber-400 bg-amber-500/10 text-amber-300'
                      : 'border-zinc-800 bg-black/40 text-zinc-400'
                  }`}
                >
                  <p className="font-chakra font-bold text-sm">Full Eleven</p>
                  <p className="text-[10px] text-zinc-400 mt-1">11 مركزاً (تشكيلة كاملة)</p>
                </button>
              </div>

              {/* Opponent Selection */}
              <label className="text-xs font-bold text-amber-400 block font-tajawal pt-2">
                اختر نوع المنافسة:
              </label>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setOpponentType('cpu')}
                  className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${
                    opponentType === 'cpu'
                      ? 'border-amber-400 bg-amber-500/10 text-amber-300'
                      : 'border-zinc-800 bg-black/40 text-zinc-400'
                  }`}
                >
                  <Bot className="w-4 h-4" />
                  <span className="text-xs font-tajawal font-bold">ضد الكمبيوتر</span>
                </button>

                <button
                  onClick={() => setOpponentType('same_device')}
                  className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${
                    opponentType === 'same_device'
                      ? 'border-amber-400 bg-amber-500/10 text-amber-300'
                      : 'border-zinc-800 bg-black/40 text-zinc-400'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span className="text-xs font-tajawal font-bold">صديق (نفس الجهاز)</span>
                </button>
              </div>

              {/* CPU Difficulty if CPU */}
              {opponentType === 'cpu' ? (
                <div className="pt-2">
                  <span className="text-[11px] text-zinc-400 block mb-1.5 font-tajawal">مستوى ذكاء الكمبيوتر:</span>
                  <div className="grid grid-cols-4 gap-1">
                    {(['Rookie', 'Pro', 'Elite', 'Legend'] as CpuDifficulty[]).map(diff => (
                      <button
                        key={diff}
                        onClick={() => setCpuDifficulty(diff)}
                        className={`py-1.5 px-2 rounded-lg text-xs font-chakra transition-all ${
                          cpuDifficulty === diff
                            ? 'bg-amber-500 text-black font-bold'
                            : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        {diff}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="pt-2">
                  <span className="text-[11px] text-zinc-400 block mb-1 font-tajawal">اسم المنافس:</span>
                  <input
                    type="text"
                    value={p2CustomName}
                    onChange={e => setP2CustomName(e.target.value)}
                    className="w-full bg-black/50 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
                    placeholder="اسم اللاعب الثاني"
                  />
                </div>
              )}

              <GoldButton onClick={startMatch} fullWidth size="lg" className="mt-4">
                بدء التحدي الآن
              </GoldButton>
            </div>
          </div>
        )}

        {/* ================= 2. ACTIVE CHALLENGE SCREEN ================= */}
        {!inSetup && !challengeFinished && currentQ && (
          <div className="space-y-4">
            {/* Header Score & Position Status */}
            <div className="bg-zinc-900/90 rounded-2xl p-3 border border-zinc-800 flex items-center justify-between">
              {/* P1 Score */}
              <div className="text-center">
                <span className="text-[10px] text-zinc-400 block font-tajawal">{p1CustomName}</span>
                <span className="font-chakra font-black text-amber-400 text-xl tabular-nums">
                  {p1DiffSum}
                </span>
                <span className="text-[9px] text-zinc-500 block">فارق التوقعات</span>
              </div>

              {/* Center Round & Position Indicator */}
              <div className="text-center px-3 py-1 bg-black/60 rounded-xl border border-amber-500/30">
                <div className="text-[10px] text-amber-400 font-chakra font-bold">
                  الجولة {currentRoundIndex + 1} / {positions.length}
                </div>
                <div className="text-sm font-chakra font-black text-white mt-0.5">
                  مركز: <span className="text-amber-300">{currentPos}</span>
                </div>
              </div>

              {/* P2 Score */}
              <div className="text-center">
                <span className="text-[10px] text-zinc-400 block font-tajawal">
                  {opponentType === 'cpu' ? `الكمبيوتر` : p2CustomName}
                </span>
                <span className="font-chakra font-black text-zinc-200 text-xl tabular-nums">
                  {p2DiffSum}
                </span>
                <span className="text-[9px] text-zinc-500 block">فارق التوقعات</span>
              </div>
            </div>

            {/* Question Card */}
            <div className="bg-[#12141a] rounded-2xl border border-amber-500/40 p-4 shadow-xl relative overflow-hidden space-y-3">
              {/* Question Category & Season */}
              <div className="flex items-center justify-between text-xs text-zinc-400 font-chakra pb-2 border-b border-zinc-800">
                <span className="text-amber-400 font-bold font-tajawal">{currentQ.category}</span>
                <span>الموسم: {currentQ.season}</span>
              </div>

              {/* Player Image & Name */}
              <div className="flex items-center gap-3 bg-black/40 p-3 rounded-xl border border-zinc-800">
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-amber-400 bg-zinc-800 shrink-0 shadow">
                  <img
                    src={currentQ.playerImage || (currentQ.playerId ? `/players/${currentQ.playerId}.jpg` : '')}
                    alt={currentQ.player}
                    className="w-full h-full object-cover object-top"
                  />
                </div>

                <div>
                  <h4 className="font-bold text-base font-tajawal text-zinc-100">
                    {currentQ.player}
                  </h4>
                  <p className="text-xs text-amber-400/80 font-tajawal">
                    {currentQ.statisticType}
                  </p>
                </div>
              </div>

              {/* Statistical Question Prompt */}
              <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 text-right">
                <p className="text-sm font-tajawal text-zinc-200 font-medium leading-relaxed">
                  {currentQ.question}
                </p>
                {currentQ.hint && (
                  <p className="text-[11px] text-zinc-400 mt-2 font-tajawal flex items-center gap-1">
                    <HelpCircle className="w-3 h-3 text-amber-400 shrink-0" />
                    <span>تلميح: {currentQ.hint}</span>
                  </p>
                )}
              </div>

              {/* ================= INPUT PHASE (NOT REVEALED) ================= */}
              {!roundRevealed && (
                <div className="space-y-3 pt-2">
                  {!waitingForP2Turn ? (
                    // Player 1 Input
                    <div className="space-y-2">
                      <label className="text-xs text-zinc-400 block font-tajawal">
                        إجابة <span className="text-amber-400 font-bold">{p1CustomName}</span>:
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={p1Answer}
                          onChange={e => setP1Answer(e.target.value)}
                          placeholder="أدخل رقماً..."
                          className="flex-1 bg-black/60 border border-amber-500/40 rounded-xl px-4 py-3 text-lg font-chakra font-bold text-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-400 text-center"
                        />
                        <GoldButton onClick={handleP1Submit} disabled={!p1Answer.trim()}>
                          تأكيد الإجابة
                        </GoldButton>
                      </div>
                    </div>
                  ) : (
                    // Player 2 Input (Same Device)
                    <div className="space-y-2">
                      <label className="text-xs text-zinc-400 block font-tajawal">
                        إجابة <span className="text-amber-400 font-bold">{p2CustomName}</span>:
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={p2Answer}
                          onChange={e => setP2Answer(e.target.value)}
                          placeholder="أدخل رقماً..."
                          className="flex-1 bg-black/60 border border-amber-500/40 rounded-xl px-4 py-3 text-lg font-chakra font-bold text-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-400 text-center"
                        />
                        <GoldButton onClick={handleP2Submit} disabled={!p2Answer.trim()}>
                          تأكيد الإجابة
                        </GoldButton>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ================= REVEAL PHASE ================= */}
              {roundRevealed && (
                <div className="space-y-3 pt-2 border-t border-zinc-800">
                  {/* Correct Answer Banner */}
                  <div className="bg-amber-500/15 border border-amber-500/40 rounded-xl p-3 text-center">
                    <span className="text-[11px] text-amber-400 font-tajawal block">الإجابة الإحصائية الدقيقة:</span>
                    <span className="font-chakra font-black text-3xl text-amber-300 tabular-nums">
                      {currentQ.correctAnswer}
                    </span>
                    <span className="text-[10px] text-zinc-400 block mt-1">المصدر: {currentQ.source}</span>
                  </div>

                  {/* Answers Comparison */}
                  <div className="grid grid-cols-2 gap-2 text-center text-xs font-tajawal">
                    <div className="bg-zinc-900 p-2.5 rounded-xl border border-zinc-800">
                      <p className="text-zinc-400">{p1CustomName}:</p>
                      <p className="font-chakra font-bold text-lg text-white mt-0.5">{p1Answer}</p>
                      <p className="text-[11px] text-zinc-400 mt-1">
                        الفارق: <span className="font-chakra text-amber-400 font-bold">{Math.abs(Number(p1Answer) - currentQ.correctAnswer)}</span>
                      </p>
                    </div>

                    <div className="bg-zinc-900 p-2.5 rounded-xl border border-zinc-800">
                      <p className="text-zinc-400">
                        {opponentType === 'cpu' ? `الكمبيوتر` : p2CustomName}:
                      </p>
                      <p className="font-chakra font-bold text-lg text-white mt-0.5">{p2Answer}</p>
                      <p className="text-[11px] text-zinc-400 mt-1">
                        الفارق: <span className="font-chakra text-amber-400 font-bold">{Math.abs(Number(p2Answer) - currentQ.correctAnswer)}</span>
                      </p>
                    </div>
                  </div>

                  {/* Round Winner & Loser Reward Card */}
                  <div className="p-3 rounded-xl bg-zinc-900/90 border border-amber-500/30 text-center space-y-1">
                    <p className="text-xs font-bold font-tajawal text-amber-300">
                      {lastRoundWinner === 'p1'
                        ? `🏆 فاز ${p1CustomName} بالجولة لتوقعه الأدق!`
                        : lastRoundWinner === 'p2'
                        ? `🏆 فاز ${opponentType === 'cpu' ? 'الكمبيوتر' : p2CustomName} بالجولة لتوقعه الأدق!`
                        : '🤝 تعادل كامل في دقة التوقع!'}
                    </p>

                    {loserReward && (
                      <div className="flex items-center gap-2.5 p-2 bg-black/60 rounded-xl border border-amber-500/30 text-right mt-1.5 animate-fade-in">
                        <div className="w-12 h-12 rounded-xl overflow-hidden border border-amber-400 shrink-0 bg-zinc-900">
                          <img
                            src={loserReward.player.image || `/players/${loserReward.player.id}.jpg`}
                            alt={loserReward.player.name}
                            className="w-full h-full object-cover object-top"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-chakra font-black text-amber-400 text-xs">
                              {loserReward.player.ovr} OVR
                            </span>
                            <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1 py-0.2 rounded font-chakra font-bold">
                              {loserReward.player.position}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-white font-tajawal truncate mt-0.5">
                            {loserReward.player.name}
                          </p>
                          <p className="text-[10px] text-zinc-400 font-tajawal truncate">
                            🎁 جائزة الخاسر ({loserReward.recipient}) · {loserReward.player.club}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <GoldButton onClick={handleNextRound} fullWidth size="lg">
                    {currentRoundIndex + 1 < positions.length ? 'الانتقال للجولة التالية' : 'عرض التشكيلتين ومحاكاة المباراة'}
                  </GoldButton>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= 3. SQUAD COMPARISON & 2D SIMULATION ================= */}
        {challengeFinished && (
          <div className="space-y-4">
            {/* Challenge Summary Banner */}
            <div className="bg-zinc-900/90 rounded-2xl p-4 border border-amber-500/40 text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-chakra font-bold">
                <Award className="w-3.5 h-3.5" />
                نهاية مرحلة التحدي الإحصائي
              </div>

              <h3 className="text-lg font-bold font-tajawal text-white">
                {challengeAdvantage === 'p1'
                  ? `أفضلية (1 - 0) لصالح ${p1CustomName}!`
                  : challengeAdvantage === 'p2'
                  ? `أفضلية (1 - 0) لصالح ${opponentType === 'cpu' ? 'الكمبيوتر' : p2CustomName}!`
                  : 'تعادل في مجموع الفوارق - بداية متكافئة (0 - 0)!'}
              </h3>

              <div className="flex justify-around text-xs font-chakra pt-2 border-t border-zinc-800">
                <div>
                  <span className="text-zinc-400 font-tajawal block">{p1CustomName}</span>
                  <span className="font-bold text-amber-400 text-base">{p1DiffSum} فارق إجمالي</span>
                </div>
                <div>
                  <span className="text-zinc-400 font-tajawal block">
                    {opponentType === 'cpu' ? 'الكمبيوتر' : p2CustomName}
                  </span>
                  <span className="font-bold text-zinc-200 text-base">{p2DiffSum} فارق إجمالي</span>
                </div>
              </div>
            </div>

            {/* Squad Previews */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-amber-400 font-tajawal">
                تشكيلة اللاعبين المكتسبة خلال الجولات:
              </h4>

              <div className="bg-zinc-900 rounded-xl p-3 border border-zinc-800">
                <p className="text-xs font-tajawal font-bold text-zinc-300 mb-2">
                  تشكيلة {p1CustomName} ({p1Squad.length} لاعبين)
                </p>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {p1Squad.length === 0 ? (
                    <p className="text-[11px] text-zinc-500 font-tajawal">لم يتلق أي لاعبين خاسرين (فاز بجميع الجولات!)</p>
                  ) : (
                    p1Squad.map((p, idx) => (
                      <div key={idx} className="shrink-0 p-2 rounded-xl bg-black/60 border border-zinc-800 text-center w-20 flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-amber-400/60 bg-zinc-900 mb-1">
                          <img
                            src={p.image || `/players/${p.id}.jpg`}
                            alt={p.name}
                            className="w-full h-full object-cover object-top"
                          />
                        </div>
                        <span className="text-[9px] text-amber-400 font-chakra font-bold">{p.position}</span>
                        <p className="text-[10px] font-bold truncate text-zinc-100 w-full">{p.name}</p>
                        <p className="text-[9px] text-zinc-400 font-chakra">{p.ovr} OVR</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-zinc-900 rounded-xl p-3 border border-zinc-800">
                <p className="text-xs font-tajawal font-bold text-zinc-300 mb-2">
                  تشكيلة {opponentType === 'cpu' ? 'الكمبيوتر' : p2CustomName} ({p2Squad.length} لاعبين)
                </p>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {p2Squad.length === 0 ? (
                    <p className="text-[11px] text-zinc-500 font-tajawal">لم يتلق أي لاعبين خاسرين</p>
                  ) : (
                    p2Squad.map((p, idx) => (
                      <div key={idx} className="shrink-0 p-2 rounded-xl bg-black/60 border border-zinc-800 text-center w-20 flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-amber-400/60 bg-zinc-900 mb-1">
                          <img
                            src={p.image || `/players/${p.id}.jpg`}
                            alt={p.name}
                            className="w-full h-full object-cover object-top"
                          />
                        </div>
                        <span className="text-[9px] text-amber-400 font-chakra font-bold">{p.position}</span>
                        <p className="text-[10px] font-bold truncate text-zinc-100 w-full">{p.name}</p>
                        <p className="text-[9px] text-zinc-400 font-chakra">{p.ovr} OVR</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Launch 2D Match Simulation */}
            <GoldButton onClick={() => setShowSimScreen(true)} fullWidth size="lg">
              <Trophy className="w-4 h-4 fill-black" />
              انطلاق شاشة محاكاة المباراة التكتيكية (2D)
            </GoldButton>
          </div>
        )}
      </div>

      {/* Same Device Pass The Phone Modal */}
      {showPassModal && (
        <PassThePhoneModal
          nextPlayerName={p2CustomName}
          onReady={() => setShowPassModal(false)}
        />
      )}

      {/* 2D Match Simulation Screen */}
      {showSimScreen && (
        <MatchSimulationScreen
          team1Name={p1CustomName}
          team2Name={opponentType === 'cpu' ? `الكمبيوتر (${cpuDifficulty})` : p2CustomName}
          team1Squad={p1Squad.length > 0 ? p1Squad : [getRandomPlayerByPosition('ATT')]}
          team2Squad={p2Squad.length > 0 ? p2Squad : [getRandomPlayerByPosition('ATT')]}
          advantageGoalsTeam1={challengeAdvantage === 'p1' ? 1 : 0}
          advantageGoalsTeam2={challengeAdvantage === 'p2' ? 1 : 0}
          onFinishMatch={(winner, coins) => {
            onGameComplete(winner === 'team1' ? 'p1' : winner === 'team2' ? 'p2' : 'draw', coins);
          }}
          onClose={() => {
            setShowSimScreen(false);
            onBack();
          }}
        />
      )}
    </div>
  );
};
