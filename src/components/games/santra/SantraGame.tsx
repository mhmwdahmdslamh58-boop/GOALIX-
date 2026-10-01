import React, { useState } from 'react';
import { 
  GameMode, 
  CpuDifficulty, 
  PositionType, 
  Player 
} from '../../../types/game';
import { getRandomClubsForRound, FootballClub } from '../../../data/clubs';
import { getRandomPlayerByClubAndPosition } from '../../../data/players';
import { 
  getPositionOrder, 
  getCurrentRoundPosition, 
  getPositionLabelAr 
} from '../../../services/positions';
import { SantraLivePitch } from './SantraLivePitch';
import { GoldButton } from '../../common/GoldButton';
import { PassThePhoneModal } from '../../common/PassThePhoneModal';
import { MatchSimulationScreen } from '../simulation/MatchSimulationScreen';
import { sounds } from '../../../services/audio';
import { 
  ArrowRight, 
  HelpCircle, 
  User, 
  Bot, 
  Trophy, 
  Sparkles, 
  Shield, 
  Check, 
  ChevronRight 
} from 'lucide-react';

interface SantraGameProps {
  onBack: () => void;
  onGameComplete: (winner: 'p1' | 'p2' | 'draw', coinsReward: number) => void;
  player1Name?: string;
}

type OpponentType = 'cpu' | 'same_device';
type SantraPhase = 
  | 'P1_CHOOSING'
  | 'P1_REVEALED'
  | 'P2_CHOOSING'
  | 'P2_REVEALED'
  | 'ROUND_FINISHED';

export const SantraGame: React.FC<SantraGameProps> = ({
  onBack,
  onGameComplete,
  player1Name: defaultP1Name = 'كابتن جواليكس'
}) => {
  // Setup State with custom names
  const [inSetup, setInSetup] = useState(true);
  const [p1CustomName, setP1CustomName] = useState(defaultP1Name);
  const [p2CustomName, setP2CustomName] = useState('اللاعب 2');
  const [mode, setMode] = useState<GameMode>('quick_five');
  const [opponentType, setOpponentType] = useState<OpponentType>('cpu');
  const [cpuDifficulty, setCpuDifficulty] = useState<CpuDifficulty>('Pro');

  // Match progression
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [positionsList, setPositionsList] = useState<PositionType[]>(getPositionOrder('quick_five'));
  const [roundClubs, setRoundClubs] = useState<FootballClub[]>([]);

  // Sequential Choices & Reveals
  const [phase, setPhase] = useState<SantraPhase>('P1_CHOOSING');
  const [cpuThinking, setCpuThinking] = useState(false);
  const [p1BoxChoice, setP1BoxChoice] = useState<number | null>(null);
  const [p2BoxChoice, setP2BoxChoice] = useState<number | null>(null);
  const [p1AcquiredPlayer, setP1AcquiredPlayer] = useState<Player | null>(null);
  const [p2AcquiredPlayer, setP2AcquiredPlayer] = useState<Player | null>(null);

  // Same-Device Passing
  const [showPassModal, setShowPassModal] = useState(false);

  // Squads
  const [p1Squad, setP1Squad] = useState<Player[]>([]);
  const [p2Squad, setP2Squad] = useState<Player[]>([]);

  // Simulation
  const [showSimScreen, setShowSimScreen] = useState(false);

  const startMatch = () => {
    sounds.playTap();
    const posList = getPositionOrder(mode);
    setPositionsList(posList);
    setCurrentRoundIndex(0);
    setP1Squad([]);
    setP2Squad([]);
    setP1BoxChoice(null);
    setP2BoxChoice(null);
    setP1AcquiredPlayer(null);
    setP2AcquiredPlayer(null);
    setPhase('P1_CHOOSING');
    setRoundClubs(getRandomClubsForRound(4));
    setInSetup(false);
  };

  const currentPos = positionsList[currentRoundIndex];

  // ================= 1. PLAYER 1 PICKS BOX =================
  const handleP1PickBox = (boxIdx: number) => {
    if (phase !== 'P1_CHOOSING') return;
    sounds.playTap();
    setP1BoxChoice(boxIdx);

    const club = roundClubs[boxIdx];
    const player = getRandomPlayerByClubAndPosition(club.name, currentPos);
    setP1AcquiredPlayer(player);
    setP1Squad(prev => [...prev, player]);
    sounds.playReveal();

    setPhase('P1_REVEALED');
  };

  // Move from P1 reveal to P2 turn
  const handleProceedToP2 = () => {
    sounds.playTap();
    if (opponentType === 'same_device') {
      setShowPassModal(true);
      setPhase('P2_CHOOSING');
    } else {
      // CPU turn: show transition then execute selection
      setPhase('P2_CHOOSING');
      setCpuThinking(true);
      setTimeout(() => {
        executeCpuTurn();
        setCpuThinking(false);
      }, 750);
    }
  };

  // CPU Pick Logic
  const executeCpuTurn = () => {
    let cpuBox = Math.floor(Math.random() * 4);
    if (cpuDifficulty === 'Legend' || cpuDifficulty === 'Elite') {
      const available = [0, 1, 2, 3].filter(i => i !== p1BoxChoice);
      cpuBox = available[Math.floor(Math.random() * available.length)];
    }

    setP2BoxChoice(cpuBox);
    const club = roundClubs[cpuBox];
    const player = getRandomPlayerByClubAndPosition(club.name, currentPos);
    setP2AcquiredPlayer(player);
    setP2Squad(prev => [...prev, player]);
    sounds.playReveal();
    setPhase('P2_REVEALED');
  };

  // ================= 2. PLAYER 2 PICKS BOX =================
  const handleP2PickBox = (boxIdx: number) => {
    if (phase !== 'P2_CHOOSING') return;
    sounds.playTap();
    setP2BoxChoice(boxIdx);

    const club = roundClubs[boxIdx];
    const player = getRandomPlayerByClubAndPosition(club.name, currentPos);
    setP2AcquiredPlayer(player);
    setP2Squad(prev => [...prev, player]);
    sounds.playReveal();

    setPhase('P2_REVEALED');
  };

  // Advance to next round or finish
  const handleNextRound = () => {
    sounds.playTap();
    if (currentRoundIndex + 1 < positionsList.length) {
      setCurrentRoundIndex(prev => prev + 1);
      setP1BoxChoice(null);
      setP2BoxChoice(null);
      setP1AcquiredPlayer(null);
      setP2AcquiredPlayer(null);
      setRoundClubs(getRandomClubsForRound(4));
      setPhase('P1_CHOOSING');
    } else {
      setPhase('ROUND_FINISHED');
    }
  };

  const p2DisplayName = opponentType === 'cpu' ? `الكمبيوتر (${cpuDifficulty})` : p2CustomName;

  return (
    <div className="min-h-screen bg-[#08080a] text-zinc-100 pb-20 select-none">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-[#0a0b0e]/95 backdrop-blur-md border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-xs text-amber-400 font-tajawal hover:text-amber-300"
        >
          <ArrowRight className="w-4 h-4" />
          <span>خروج</span>
        </button>

        <div className="text-center">
          <h2 className="font-chakra font-black text-sm tracking-wider text-amber-400">
            SANTRA
          </h2>
          <span className="text-[10px] text-zinc-400">درافت الصناديق الغامضة</span>
        </div>

        <div className="w-12" />
      </div>

      <div className="max-w-md mx-auto px-4 py-4 space-y-4">
        {/* ================= SETUP SCREEN ================= */}
        {inSetup && (
          <div className="space-y-4">
            <div className="relative rounded-2xl overflow-hidden border border-amber-500/30 aspect-[16/9] shadow-xl">
              <img
                src="/src/assets/images/santra_mystery_cover_1790797320678.jpg"
                alt="SANTRA"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex flex-col justify-end p-4">
                <span className="text-xs font-chakra font-bold text-amber-400 uppercase tracking-widest">
                  MYSTERY BOXES DRAFT
                </span>
                <h3 className="text-xl font-black font-tajawal text-white">
                  اختر صندوقك الغامض واكشف ناديك
                </h3>
              </div>
            </div>

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

              {/* Mode Selection */}
              <div>
                <label className="text-xs font-bold text-amber-400 block mb-1 font-tajawal">
                  نظام الجولات التلقائي:
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
                    <p className="text-[10px] text-zinc-400 mt-0.5">5 مراكز (GK, DEF, MID, 2 ATT)</p>
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
                    <p className="text-[10px] text-zinc-400 mt-0.5">11 مركزاً (تشكيلة كاملة)</p>
                  </button>
                </div>
              </div>

              {/* Opponent Selection */}
              <div>
                <label className="text-xs font-bold text-amber-400 block mb-1 font-tajawal">
                  نوع المنافسة:
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
                    <span className="text-xs font-tajawal font-bold">الكمبيوتر</span>
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
              </div>

              {/* CPU difficulty */}
              {opponentType === 'cpu' && (
                <div>
                  <span className="text-[11px] text-zinc-400 block mb-1 font-tajawal">مستوى الذكاء:</span>
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
              )}

              <GoldButton onClick={startMatch} fullWidth size="lg" className="mt-4">
                بدء الدرافت الآن
              </GoldButton>
            </div>
          </div>
        )}

        {/* ================= ACTIVE ROUND ================= */}
        {!inSetup && phase !== 'ROUND_FINISHED' && (
          <div className="space-y-3.5">
            {/* Round and Position Indicator */}
            <div className="bg-zinc-900/90 rounded-2xl p-3 border border-zinc-800 flex items-center justify-between text-center">
              <div>
                <span className="text-[10px] text-zinc-400 font-tajawal block">{p1CustomName}</span>
                <span className="font-chakra font-bold text-amber-400 text-xs">
                  {p1Squad.length} لاعبين
                </span>
              </div>

              <div className="px-3 py-1 bg-black/60 rounded-xl border border-amber-500/30">
                <div className="text-[10px] text-amber-400 font-chakra font-bold">
                  الجولة {currentRoundIndex + 1} / {positionsList.length}
                </div>
                <div className="text-sm font-chakra font-black text-white mt-0.5">
                  مركز: <span className="text-amber-300">{currentPos}</span> ({getPositionLabelAr(currentPos)})
                </div>
              </div>

              <div>
                <span className="text-[10px] text-zinc-400 font-tajawal block">{p2DisplayName}</span>
                <span className="font-chakra font-bold text-zinc-300 text-xs">
                  {p2Squad.length} لاعبين
                </span>
              </div>
            </div>

            {/* Turn status instruction banner */}
            <div className="p-2.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-zinc-900 to-black border border-amber-500/30 text-center">
              <p className="text-xs font-tajawal font-bold text-amber-300">
                {phase === 'P1_CHOOSING' && (
                  <>دور <span className="underline">{p1CustomName}</span>: اختر صندوقاً من الصناديق الأربعة لمركز {currentPos}</>
                )}
                {phase === 'P1_REVEALED' && (
                  <>تم كشف اختيار <span className="underline">{p1CustomName}</span> بنجاح!</>
                )}
                {phase === 'P2_CHOOSING' && (
                  cpuThinking ? (
                    <span className="flex items-center justify-center gap-1.5 animate-pulse text-amber-400">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                      الكمبيوتر يدرس خيارات مركز {currentPos}...
                    </span>
                  ) : (
                    <>دور <span className="underline">{p2DisplayName}</span>: اختر صندوقك لمركز {currentPos}</>
                  )
                )}
                {phase === 'P2_REVEALED' && (
                  <>تم كشف اختيار <span className="underline">{p2DisplayName}</span> بنجاح!</>
                )}
              </p>
            </div>

            {/* ================= 4 MYSTERY BOXES ================= */}
            <div className="grid grid-cols-2 gap-3">
              {[0, 1, 2, 3].map(boxIdx => {
                const isPickedByP1 = p1BoxChoice === boxIdx;
                const isPickedByP2 = p2BoxChoice === boxIdx;
                const club = roundClubs[boxIdx];

                // Revealed status: Strictly one at a time
                const isRevealedForP1 = isPickedByP1 && phase === 'P1_REVEALED';
                const isRevealedForP2 = isPickedByP2 && phase === 'P2_REVEALED';

                return (
                  <div
                    key={boxIdx}
                    onClick={() => {
                      if (phase === 'P1_CHOOSING') handleP1PickBox(boxIdx);
                      else if (phase === 'P2_CHOOSING' && opponentType === 'same_device') handleP2PickBox(boxIdx);
                    }}
                    className={`relative aspect-[4/3] rounded-2xl p-3 border transition-all duration-300 cursor-pointer overflow-hidden flex flex-col items-center justify-center select-none shadow-xl ${
                      isRevealedForP1 || isRevealedForP2
                        ? 'border-amber-400 bg-gradient-to-b from-zinc-800 to-zinc-950 scale-[1.02]'
                        : 'border-amber-500/30 bg-[#16181f] hover:border-amber-400 active:scale-95'
                    }`}
                  >
                    {/* Mystery Box pattern */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(212,175,55,0.08),transparent_70%)] pointer-events-none" />

                    {!(isRevealedForP1 || isRevealedForP2) ? (
                      // Unrevealed: Identical mystery vault
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-b from-amber-400/20 to-amber-600/10 border border-amber-500/40 flex items-center justify-center shadow-inner">
                          <HelpCircle className="w-6 h-6 text-amber-400 animate-pulse" />
                        </div>
                        <span className="font-chakra font-black text-xs text-amber-300 tracking-wider">
                          BOX #{boxIdx + 1}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-tajawal">مجهول النادي</span>
                      </div>
                    ) : (
                      // Revealed Club
                      <div className="flex flex-col items-center justify-center text-center space-y-1 animate-fade-in">
                        <span className="text-[10px] font-chakra font-bold text-amber-400">
                          {club.country}
                        </span>
                        <h4 className="text-sm font-bold font-tajawal text-white">
                          {club.nameAr}
                        </h4>
                        <span className="text-[10px] text-zinc-400 font-chakra">
                          {club.name}
                        </span>

                        <div className="flex gap-1 pt-1">
                          {isRevealedForP1 && (
                            <span className="bg-amber-500 text-black font-bold text-[9px] px-2 py-0.5 rounded font-tajawal shadow">
                              {p1CustomName}
                            </span>
                          )}
                          {isRevealedForP2 && (
                            <span className="bg-zinc-700 text-white font-bold text-[9px] px-2 py-0.5 rounded font-tajawal shadow">
                              {p2DisplayName}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* ================= ONE-AT-A-TIME REVEAL CARD ================= */}
            {phase === 'P1_REVEALED' && p1AcquiredPlayer && (
              <div className="bg-gradient-to-b from-[#1c180a] to-[#0f0d06] rounded-2xl p-4 border border-amber-500/60 shadow-2xl space-y-3 animate-fade-in">
                <div className="text-center">
                  <span className="text-[10px] font-chakra font-bold text-amber-400 tracking-widest uppercase">
                    PLAYER 1 RESULT · نتيجة اللاعب الأول
                  </span>
                  <h4 className="text-base font-bold font-tajawal text-white mt-0.5">
                    حصل <span className="text-amber-300">{p1CustomName}</span> على:
                  </h4>
                </div>

                {/* Player Card Showcase */}
                <div className="flex items-center gap-3 bg-black/60 p-3 rounded-xl border border-amber-500/40">
                  <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-amber-400 shrink-0 bg-zinc-800 shadow">
                    <img
                      src={p1AcquiredPlayer.image}
                      alt={p1AcquiredPlayer.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-chakra font-black text-amber-400 text-base">
                        {p1AcquiredPlayer.ovr} OVR
                      </span>
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-chakra font-bold">
                        {p1AcquiredPlayer.position}
                      </span>
                    </div>
                    <h5 className="font-bold text-sm text-zinc-100 font-tajawal mt-0.5">
                      {p1AcquiredPlayer.name}
                    </h5>
                    <p className="text-[11px] text-zinc-400 font-tajawal">
                      {p1AcquiredPlayer.club} · {p1AcquiredPlayer.nationality}
                    </p>
                  </div>
                </div>

                <GoldButton onClick={handleProceedToP2} fullWidth size="lg">
                  دور {p2DisplayName} لاختيار الصندوق
                </GoldButton>
              </div>
            )}

            {phase === 'P2_REVEALED' && p2AcquiredPlayer && (
              <div className="bg-gradient-to-b from-[#1c180a] to-[#0f0d06] rounded-2xl p-4 border border-amber-500/60 shadow-2xl space-y-3 animate-fade-in">
                <div className="text-center">
                  <span className="text-[10px] font-chakra font-bold text-amber-400 tracking-widest uppercase">
                    PLAYER 2 RESULT · نتيجة اللاعب الثاني
                  </span>
                  <h4 className="text-base font-bold font-tajawal text-white mt-0.5">
                    حصل <span className="text-amber-300">{p2DisplayName}</span> على:
                  </h4>
                </div>

                {/* Player Card Showcase */}
                <div className="flex items-center gap-3 bg-black/60 p-3 rounded-xl border border-amber-500/40">
                  <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-amber-400 shrink-0 bg-zinc-800 shadow">
                    <img
                      src={p2AcquiredPlayer.image}
                      alt={p2AcquiredPlayer.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-chakra font-black text-amber-400 text-base">
                        {p2AcquiredPlayer.ovr} OVR
                      </span>
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-chakra font-bold">
                        {p2AcquiredPlayer.position}
                      </span>
                    </div>
                    <h5 className="font-bold text-sm text-zinc-100 font-tajawal mt-0.5">
                      {p2AcquiredPlayer.name}
                    </h5>
                    <p className="text-[11px] text-zinc-400 font-tajawal">
                      {p2AcquiredPlayer.club} · {p2AcquiredPlayer.nationality}
                    </p>
                  </div>
                </div>

                <GoldButton onClick={handleNextRound} fullWidth size="lg">
                  {currentRoundIndex + 1 < positionsList.length ? 'الانتقال للمركز التالي' : 'عرض التشكيلات وبدء المباراة'}
                </GoldButton>
              </div>
            )}

            {/* ================= LIVE FORMATION BELOW BOXES ================= */}
            <SantraLivePitch
              mode={mode}
              currentRoundPosition={currentPos}
              player1Name={p1CustomName}
              player2Name={p2DisplayName}
              p1Squad={p1Squad}
              p2Squad={p2Squad}
              activeHighlightPlayerId={phase === 'P1_REVEALED' ? p1AcquiredPlayer?.id : p2AcquiredPlayer?.id}
              activeTurn={phase === 'P1_CHOOSING' || phase === 'P1_REVEALED' ? 'p1' : 'p2'}
            />
          </div>
        )}

        {/* ================= ROUND FINISHED & 2D SIMULATION ================= */}
        {phase === 'ROUND_FINISHED' && (
          <div className="space-y-4">
            <div className="bg-zinc-900/90 rounded-2xl p-4 border border-amber-500/40 text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-chakra font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                اكتمل درافت SANTRA بنجاح!
              </div>

              <h3 className="text-lg font-bold font-tajawal text-white">
                تم تشكيل فريقي {p1CustomName} و {p2DisplayName} بالكامل
              </h3>
            </div>

            {/* Live Pitches Summary */}
            <SantraLivePitch
              mode={mode}
              currentRoundPosition={currentPos}
              player1Name={p1CustomName}
              player2Name={p2DisplayName}
              p1Squad={p1Squad}
              p2Squad={p2Squad}
            />

            <GoldButton onClick={() => setShowSimScreen(true)} fullWidth size="lg">
              <Trophy className="w-4 h-4 fill-black" />
              انطلاق شاشة محاكاة المباراة التكتيكية (2D)
            </GoldButton>
          </div>
        )}
      </div>

      {showPassModal && (
        <PassThePhoneModal
          nextPlayerName={p2DisplayName}
          onReady={() => setShowPassModal(false)}
        />
      )}

      {showSimScreen && (
        <MatchSimulationScreen
          team1Name={p1CustomName}
          team2Name={p2DisplayName}
          team1Squad={p1Squad}
          team2Squad={p2Squad}
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
