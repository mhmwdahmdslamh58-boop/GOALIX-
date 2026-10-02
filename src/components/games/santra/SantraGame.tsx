import React, { useState, useEffect, useCallback } from 'react';
import { FormationType, GameMode, Player, SantraChestTier } from '../../../types/game';
import { getRandomPlayerByPosition } from '../../../data/players';
import { getPositionOrder, getPositionLabelAr } from '../../../services/positions';
import { GoldButton } from '../../common/GoldButton';
import { PlayerCard } from '../../common/PlayerCard';
import { PitchTactics } from '../../common/PitchTactics';
import { PassThePhoneModal } from '../../common/PassThePhoneModal';
import { SantraLivePitch } from './SantraLivePitch';
import { SantraChest3DCard } from '../../common/SantraChest3D';
import { MatchSimulationScreen } from '../simulation/MatchSimulationScreen';
import { MatchSimulationOutput } from '../simulation/MatchEngine';
import { sounds } from '../../../services/audio';
import { 
  recordMatchOutcome, addPlayerToCollection, 
  addSantraChestToUser, addCoinsToUser 
} from '../../../services/storage';
import confetti from 'canvas-confetti';
import { 
  ArrowRight, Trophy, Sparkles, Dices, Coins, Award, Bot, Users, RotateCcw, Package
} from 'lucide-react';

interface SantraGameProps {
  onBack: () => void;
  onFinishSave: () => void;
}

interface BoardTile {
  index: number;
  label: string;
  type: 'start' | 'pitch' | 'coins' | 'boost' | 'card' | 'chest' | 'goal';
  desc: string;
  color: string;
}

const SANTRA_BOARD_TILES: BoardTile[] = [
  { index: 0, label: 'نقطة السنترة', type: 'start', desc: 'بداية المشوار التكتيكي', color: 'border-amber-500/40 bg-amber-500/10' },
  { index: 1, label: 'بناء الهجمة', type: 'pitch', desc: 'تقدم تكتيكي بالكرة', color: 'border-zinc-700 bg-zinc-900' },
  { index: 2, label: 'خزينة ذهب', type: 'coins', desc: '+40 كوينز فورية!', color: 'border-yellow-400/50 bg-yellow-500/15' },
  { index: 3, label: 'بطاقة تكتيكية', type: 'card', desc: '+1 نقطة تكتيكية إضافية!', color: 'border-sky-400/50 bg-sky-500/15' },
  { index: 4, label: 'ضغط عالي', type: 'pitch', desc: 'سيطرة في خط الوسط', color: 'border-zinc-700 bg-zinc-900' },
  { index: 5, label: 'ترقية الصندوق', type: 'boost', desc: 'ترقية صندوق هذه الجولة إلى نخبة/أسطوري!', color: 'border-emerald-400/50 bg-emerald-500/15' },
  { index: 6, label: 'صندوق مكافأة', type: 'chest', desc: 'ربح صندوق سانترا 3D إضافي في خزينتك!', color: 'border-purple-400/50 bg-purple-500/15' },
  { index: 7, label: 'جناح سريع', type: 'pitch', desc: 'اختراق من الأطراف', color: 'border-zinc-700 bg-zinc-900' },
  { index: 8, label: 'بطاقة القائد', type: 'card', desc: '+2 نقاط تكتيكية إضافية!', color: 'border-sky-400/50 bg-sky-500/15' },
  { index: 9, label: 'منطقة الجزاء', type: 'boost', desc: 'فرصة لاعب نخبة أو أسطوري!', color: 'border-emerald-400/50 bg-emerald-500/15' },
  { index: 10, label: 'مكافأة الجماهير', type: 'coins', desc: '+60 كوينز فورية!', color: 'border-yellow-400/50 bg-yellow-500/15' },
  { index: 11, label: 'مرمى البطولة', type: 'goal', desc: 'ذروة السيطرة التكتيكية (+3 نقاط)!', color: 'border-amber-400 bg-amber-500/25' },
];

export const SantraGame: React.FC<SantraGameProps> = ({ onBack, onFinishSave }) => {
  const [phase, setPhase] = useState<'setup' | 'playing' | 'pass' | 'round_summary' | 'simulating' | 'finished'>('setup');
  const [playType, setPlayType] = useState<'solo_ai' | 'local_2p'>('solo_ai');
  const [aiDifficulty, setAiDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [mode, setMode] = useState<GameMode>('quick_five');
  const [p1Name, setP1Name] = useState('كابتن جواليكس');
  const [p2Name, setP2Name] = useState('الذكاء التكتيكي AI');
  const [p1Formation, setP1Formation] = useState<FormationType>('4-3-3');
  const [p2Formation, setP2Formation] = useState<FormationType>('4-3-3');

  const [currentRound, setCurrentRound] = useState(0);
  const [activePlayer, setActivePlayer] = useState<1 | 2>(1);

  // Santra Board State
  const [p1BoardPos, setP1BoardPos] = useState(0);
  const [p2BoardPos, setP2BoardPos] = useState(0);
  const [diceValue, setDiceValue] = useState<number | null>(null);
  const [isRollingDice, setIsRollingDice] = useState(false);
  const [hasRolledThisTurn, setHasRolledThisTurn] = useState(false);
  const [boardEventBanner, setBoardEventBanner] = useState<string | null>(null);
  const [turnOvrBoost, setTurnOvrBoost] = useState(false);

  // 3D Mystery Box Selection State
  const [selectedBoxIndex, setSelectedBoxIndex] = useState<number | null>(null);
  const [awardedPlayer, setAwardedPlayer] = useState<Player | null>(null);
  const [lastAiSummary, setLastAiSummary] = useState<string | null>(null);

  // Match State
  const [p1Points, setP1Points] = useState(0);
  const [p2Points, setP2Points] = useState(0);
  const [p1Squad, setP1Squad] = useState<Player[]>([]);
  const [p2Squad, setP2Squad] = useState<Player[]>([]);
  const [simResult, setSimResult] = useState<MatchSimulationOutput | null>(null);
  const [rewardsSaved, setRewardsSaved] = useState(false);

  const positionOrder = getPositionOrder(mode);
  const totalRounds = positionOrder.length;
  const currentExpectedPos = positionOrder[currentRound] || 'ATT';

  useEffect(() => {
    if (playType === 'solo_ai' && p2Name === 'المدير الفني 2') {
      setP2Name('الذكاء التكتيكي AI');
    } else if (playType === 'local_2p' && p2Name === 'الذكاء التكتيكي AI') {
      setP2Name('المدير الفني 2');
    }
  }, [playType, p2Name]);

  const startGame = () => {
    sounds.playWhistle();
    setP1Squad([]);
    setP2Squad([]);
    setCurrentRound(0);
    setActivePlayer(1);
    setP1Points(0);
    setP2Points(0);
    setP1BoardPos(0);
    setP2BoardPos(0);
    setDiceValue(null);
    setHasRolledThisTurn(false);
    setBoardEventBanner(null);
    setTurnOvrBoost(false);
    setSelectedBoxIndex(null);
    setAwardedPlayer(null);
    setSimResult(null);
    setRewardsSaved(false);
    setLastAiSummary(null);
    setPhase('playing');
  };

  const handleRollDice = () => {
    if (hasRolledThisTurn || isRollingDice) return;
    sounds.playChestShake();
    setIsRollingDice(true);

    setTimeout(() => {
      const roll = Math.floor(Math.random() * 6) + 1;
      setDiceValue(roll);
      setIsRollingDice(false);
      setHasRolledThisTurn(true);
      sounds.playReveal();

      const oldPos = activePlayer === 1 ? p1BoardPos : p2BoardPos;
      const newPos = (oldPos + roll) % SANTRA_BOARD_TILES.length;
      if (activePlayer === 1) setP1BoardPos(newPos);
      else setP2BoardPos(newPos);

      const tile = SANTRA_BOARD_TILES[newPos];
      if (tile.type === 'coins') {
        const bonus = tile.index === 10 ? 60 : 40;
        if (activePlayer === 1) addCoinsToUser(bonus, `مكافأة لوح سانترا (${tile.label})`);
        setBoardEventBanner(`🎲 تقدم ${roll} خطوات إلى [${tile.label}]: +${bonus} كوينز فورية!`);
      } else if (tile.type === 'boost') {
        setTurnOvrBoost(true);
        setBoardEventBanner(`🎲 تقدم ${roll} خطوات إلى [${tile.label}]: تم ترقية صناديق هذه الجولة لنخبة وأساطير!`);
      } else if (tile.type === 'card') {
        const pts = tile.index === 8 ? 2 : 1;
        if (activePlayer === 1) setP1Points((p) => p + pts);
        else setP2Points((p) => p + pts);
        setBoardEventBanner(`🎲 تقدم ${roll} خطوات إلى [${tile.label}]: +${pts} نقاط تكتيكية مباشرة!`);
      } else if (tile.type === 'chest') {
        if (activePlayer === 1) {
          addSantraChestToUser('Silver', 'مكافأة لوح سانترا التكتيكي');
        }
        setBoardEventBanner(`🎲 تقدم ${roll} خطوات إلى [${tile.label}]: ربحت صندوق سانترا 3D فضي في خزينتك!`);
      } else if (tile.type === 'goal') {
        if (activePlayer === 1) setP1Points((p) => p + 3);
        else setP2Points((p) => p + 3);
        setBoardEventBanner(`🎲 تقدم ${roll} خطوات إلى [${tile.label}]: هـــدف على اللوح (+3 نقاط تكتيكية)!`);
      } else {
        setBoardEventBanner(`🎲 رميت ${roll} وتقدمت إلى خانة [${tile.label}] — ${tile.desc}`);
      }
    }, 500);
  };

  const handleSelectBox = (index: number) => {
    if (selectedBoxIndex !== null) return;
    setSelectedBoxIndex(index);

    const currentIds = (activePlayer === 1 ? p1Squad : p2Squad).map((p) => p.id);
    let picked = getRandomPlayerByPosition(currentExpectedPos, currentIds);

    if (turnOvrBoost && picked.ovr < 88) {
      // Try picking a higher rated player in the same position
      const secondTry = getRandomPlayerByPosition(currentExpectedPos, currentIds);
      if (secondTry.ovr > picked.ovr) picked = secondTry;
    }

    setAwardedPlayer(picked);
    if (picked.cardType === 'ICON' || picked.cardType === 'ELITE') {
      sounds.playGoalHorn();
    } else {
      sounds.playReveal();
    }

    if (activePlayer === 1) {
      setP1Squad((prev) => [...prev, picked]);
      addPlayerToCollection(picked);
    } else {
      setP2Squad((prev) => [...prev, picked]);
    }
  };

  const runAiTurnForRound = useCallback(
    (roundIdx: number) => {
      const aiRoll = Math.floor(Math.random() * 6) + 1;
      setP2BoardPos((prev) => (prev + aiRoll) % SANTRA_BOARD_TILES.length);

      const aiPts = aiDifficulty === 'hard' ? 2 : aiDifficulty === 'medium' ? 1 : 0;
      if (aiPts > 0) {
        setP2Points((p) => p + aiPts);
      }

      const aiPos = positionOrder[roundIdx] || 'ATT';
      const usedIds = p2Squad.map((p) => p.id);
      const aiPlayer = getRandomPlayerByPosition(aiPos, usedIds);

      setP2Squad((prev) => [...prev, aiPlayer]);

      setLastAiSummary(
        `🤖 ${p2Name}: رمى النرد (${aiRoll}) • فتح صندوق سانترا 3D وحصل على ${aiPlayer.name} (${aiPlayer.ovr} OVR - ${aiPlayer.position})`
      );
    },
    [aiDifficulty, p2Name, positionOrder, p2Squad]
  );

  const handleAfterBoxPick = () => {
    sounds.playTap();
    setTurnOvrBoost(false);
    setDiceValue(null);
    setHasRolledThisTurn(false);
    setBoardEventBanner(null);
    setSelectedBoxIndex(null);
    setAwardedPlayer(null);

    if (playType === 'solo_ai') {
      runAiTurnForRound(currentRound);
      setPhase('round_summary');
    } else {
      if (activePlayer === 1) {
        setActivePlayer(2);
        setPhase('pass');
      } else {
        setPhase('round_summary');
      }
    }
  };

  const handleNextRound = () => {
    sounds.playTap();
    setLastAiSummary(null);
    if (currentRound + 1 < totalRounds) {
      setCurrentRound((r) => r + 1);
      setActivePlayer(1);
      setDiceValue(null);
      setHasRolledThisTurn(false);
      setBoardEventBanner(null);
      if (playType === 'local_2p') {
        setPhase('pass');
      } else {
        setPhase('playing');
      }
    } else {
      setPhase('simulating');
    }
  };

  const calculateSquadPower = (squad: Player[], points: number) => {
    const ratingSum = squad.reduce((sum, p) => sum + (p?.ovr || 0), 0);
    return ratingSum + points * 5;
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
              SANTRA — لوح سانترا التكتيكي + صناديق 3D
            </span>
            <h2 className="text-2xl font-black text-white">إعدادات بطولة سانترا</h2>
            <p className="text-xs text-zinc-400">
              ارمِ نرد سانترا، تحرك على اللوح التكتيكي، وافتح صناديق سانترا 3D لبناء أقوى تشكيلة!
            </p>
          </div>

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
                  <div className="font-black text-sm">لاعب ضد الذكاء الاصطناعي</div>
                  <div className="text-[10px] text-zinc-400">منافس تكتيكي ذكي فوري</div>
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
                  <div className="font-black text-sm">لاعبان على نفس الجهاز</div>
                  <div className="text-[10px] text-zinc-400">تحدي مباشر (Pass & Play)</div>
                </div>
              </button>
            </div>
          </div>

          {playType === 'solo_ai' && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-300 block">مستوى الذكاء الاصطناعي (Difficulty)</label>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: 'easy', label: 'سهل (Easy)', reward: 'صندوق فضي' },
                  { id: 'medium', label: 'متوسط (Medium)', reward: 'صندوق ذهبي' },
                  { id: 'hard', label: 'محترف (Hard)', reward: 'صندوق نخبة Elite' },
                ].map((d) => (
                  <button
                    key={d.id}
                    onClick={() => {
                      sounds.playTap();
                      setAiDifficulty(d.id as 'easy' | 'medium' | 'hard');
                    }}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      aiDifficulty === d.id
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    <div className="text-xs font-black">{d.label}</div>
                    <div className="text-[10px] text-emerald-400 mt-0.5">الفوز: {d.reward}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-300 block">طول البطولة</label>
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
                <div className="text-[11px] opacity-75 mt-0.5">5 مراكز أساسية + محاكاة</div>
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
                <div className="text-[11px] opacity-75 mt-0.5">11 مركزًا كاملًا على الملعب</div>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-3">
              <span className="text-xs font-black text-amber-400 block">اللاعب الأول (أنت)</span>
              <input
                type="text"
                value={p1Name}
                onChange={(e) => setP1Name(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm font-bold"
              />
              <div>
                <label className="text-[10px] text-zinc-400 block mb-1">الخطة التكتيكية</label>
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
              <div>
                <label className="text-[10px] text-zinc-400 block mb-1">الخطة التكتيكية</label>
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
          </div>

          <GoldButton fullWidth size="lg" onClick={startGame}>
            انطلاق بطولة سانترا (START SANTRA)
          </GoldButton>
        </div>
      </div>
    );
  }

  if (phase === 'pass') {
    return (
      <PassThePhoneModal
        nextPlayerName={activePlayer === 1 ? p1Name : p2Name}
        titleAr={`الجولة ${currentRound + 1} من ${totalRounds} — المركز: ${currentExpectedPos}`}
        onReady={() => setPhase('playing')}
      />
    );
  }

  if (phase === 'round_summary') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6 pb-28 space-y-6 animate-fade-in">
        <div className="text-center space-y-1">
          <span className="text-xs font-bold text-amber-400">
            ملخص الجولة {currentRound + 1} من {totalRounds}
          </span>
          <h2 className="text-2xl font-black text-white">تحديث التشكيلتين ولوح سانترا</h2>
        </div>

        {lastAiSummary && (
          <div className="bg-sky-950/40 border border-sky-500/40 rounded-2xl p-3.5 text-xs font-bold text-sky-200 flex items-center gap-2">
            <Bot className="w-5 h-5 text-sky-400 shrink-0" />
            <span>{lastAiSummary}</span>
          </div>
        )}

        <SantraLivePitch
          mode={mode}
          currentRoundPosition={currentExpectedPos}
          player1Name={p1Name}
          player2Name={p2Name}
          p1Squad={p1Squad}
          p2Squad={p2Squad}
          activeTurn="p1"
        />

        <GoldButton fullWidth size="lg" onClick={handleNextRound}>
          {currentRound + 1 < totalRounds
            ? `الانتقال للجولة ${currentRound + 2}`
            : 'انطلاق صافرة محاكاة المباراة النهائية!'}
        </GoldButton>
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
        advantageGoalsTeam1={p1Points > p2Points ? 1 : 0}
        advantageGoalsTeam2={p2Points > p1Points ? 1 : 0}
        onFinishMatch={(winner, _coins, fullOutput) => {
          setSimResult(fullOutput);
          if (!rewardsSaved) {
            setRewardsSaved(true);
            const outcome: 'win' | 'draw' | 'loss' =
              winner === 'team1' ? 'win' : winner === 'draw' ? 'draw' : 'loss';
            const chestTier: SantraChestTier =
              aiDifficulty === 'hard' ? 'Elite' : aiDifficulty === 'medium' ? 'Gold' : 'Silver';
            recordMatchOutcome({
              matchId: `santra_${Date.now()}`,
              gameId: 'santra',
              isOnline: false,
              outcome,
              customCoinsReward: outcome === 'win' ? 120 : outcome === 'draw' ? 60 : 25,
              awardSantraChest: outcome === 'win' ? chestTier : undefined,
            });
            onFinishSave();
          }
          setPhase('finished');
          if (sounds.isEffectsEnabled()) {
            confetti({ particleCount: 110, spread: 80, origin: { y: 0.6 } });
          }
        }}
        onClose={() => setPhase('round_summary')}
      />
    );
  }

  if (phase === 'finished') {
    const p1Power = calculateSquadPower(p1Squad, p1Points) + (simResult ? simResult.goalsP1 * 25 : 0);
    const p2Power = calculateSquadPower(p2Squad, p2Points) + (simResult ? simResult.goalsP2 * 25 : 0);
    const isP1Winner = simResult ? simResult.winner === 'team1' : p1Power >= p2Power;
    const isDraw = simResult ? simResult.winner === 'draw' : p1Power === p2Power;
    const winner = isDraw ? 'تعادل تكتيكي!' : isP1Winner ? p1Name : p2Name;

    return (
      <div className="max-w-3xl mx-auto px-4 py-8 pb-28 text-center space-y-6 animate-fade-in">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400 to-yellow-600 mx-auto flex items-center justify-center shadow-[0_0_40px_rgba(245,158,11,0.5)]">
          <Trophy className="w-10 h-10 text-zinc-950" />
        </div>

        <div className="space-y-1">
          <span className="text-xs font-black uppercase tracking-widest text-amber-400">
            النتيجة النهائية لبطولة سانترا
          </span>
          <h2 className="text-3xl font-black text-white">
            {isDraw ? 'تعادل ملحمي بين الفريقين!' : `البطل: ${winner} 🏆`}
          </h2>
          {simResult && (
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-2xl bg-zinc-900 border border-amber-500/40 mt-2">
              <span className="font-black text-amber-400">{p1Name}</span>
              <span className="font-chakra text-2xl font-black text-white">
                {simResult.goalsP1} - {simResult.goalsP2}
              </span>
              <span className="font-black text-sky-400">{p2Name}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto">
          <div className="bg-zinc-900 border border-amber-500/30 rounded-2xl p-3">
            <Coins className="w-5 h-5 text-amber-400 mx-auto mb-1" />
            <div className="font-chakra text-lg font-black text-amber-300">
              +{isP1Winner ? 120 : isDraw ? 60 : 25}
            </div>
            <div className="text-[10px] text-zinc-400 font-bold">كوينز مضافة</div>
          </div>
          <div className="bg-zinc-900 border border-emerald-500/30 rounded-2xl p-3">
            <Award className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
            <div className="font-chakra text-lg font-black text-emerald-400">
              +{isP1Winner ? 3 : isDraw ? 1 : 0} RP
            </div>
            <div className="text-[10px] text-zinc-400 font-bold">نقاط التصنيف</div>
          </div>
          <div className="bg-zinc-900 border border-purple-500/30 rounded-2xl p-3">
            <Package className="w-5 h-5 text-purple-400 mx-auto mb-1" />
            <div className="text-xs font-black text-purple-300">
              {isP1Winner ? 'صندوق سانترا 3D' : 'بطاقات التشكيلة'}
            </div>
            <div className="text-[10px] text-zinc-400 font-bold">مكافأة البطولة</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-right">
          <div className="bg-zinc-900/90 border border-amber-500/30 rounded-3xl p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-black text-lg text-amber-400">{p1Name}</span>
              <span className="font-chakra text-xl font-black text-white">{p1Power} PWR</span>
            </div>
            <PitchTactics formation={p1Formation} players={p1Squad} interactive={false} />
          </div>

          <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-black text-lg text-sky-400">{p2Name}</span>
              <span className="font-chakra text-xl font-black text-white">{p2Power} PWR</span>
            </div>
            <PitchTactics formation={p2Formation} players={p2Squad} interactive={false} />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <GoldButton fullWidth onClick={startGame}>
            <RotateCcw className="w-4 h-4" />
            إعادة اللعب (RESTART)
          </GoldButton>
          <GoldButton variant="dark" fullWidth onClick={onBack}>
            حفظ والعودة للرئيسية
          </GoldButton>
        </div>
      </div>
    );
  }

  // PLAYING PHASE (12-Tile Santra Board + Dice + 3DSantra Chests + Live Pitch)
  const chestTiersForRound: SantraChestTier[] = turnOvrBoost
    ? ['Gold', 'Elite', 'Legendary']
    : ['Bronze', 'Silver', 'Gold'];

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 pb-28 space-y-4 animate-fade-in">
      {/* Top Status Bar */}
      <div className="flex items-center justify-between bg-zinc-900/90 border border-zinc-800 rounded-2xl px-4 py-3">
        <div>
          <span className="text-[11px] text-zinc-400 block">
            الجولة {currentRound + 1} من {totalRounds} • المركز:{' '}
            <strong className="text-amber-400">{getPositionLabelAr(currentExpectedPos)}</strong>
          </span>
          <span className="font-black text-sm text-white">
            دور: {activePlayer === 1 ? p1Name : p2Name}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-left px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30">
            <span className="text-[10px] text-zinc-400 block">نقاطك التكتيكية</span>
            <span className="font-chakra text-sm font-black text-amber-400">
              {activePlayer === 1 ? p1Points : p2Points} PTS
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

      {/* SANTRA TACTICAL GAME BOARD (12-Tile Trail + Dice Roll) */}
      <div className="bg-gradient-to-b from-zinc-900 to-zinc-950 border border-amber-500/35 rounded-3xl p-4 space-y-3 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Dices className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-xs sm:text-sm font-black text-white">لوح سانترا التكتيكي (SANTRA BOARD)</h3>
              <p className="text-[10px] text-zinc-400">ارمِ النرد للتحرك على اللوح وكسب مكافآت وترقيات لصناديق 3D</p>
            </div>
          </div>

          <button
            onClick={handleRollDice}
            disabled={hasRolledThisTurn || isRollingDice}
            className={`px-3.5 py-2 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all ${
              hasRolledThisTurn
                ? 'bg-zinc-800 text-emerald-400 border border-emerald-500/30'
                : 'bg-gradient-to-r from-amber-400 to-yellow-500 text-zinc-950 shadow-[0_4px_0_#92400e] active:translate-y-0.5'
            }`}
          >
            <Dices className={`w-4 h-4 ${isRollingDice ? 'animate-spin' : ''}`} />
            {isRollingDice
              ? 'جاري الرمي...'
              : hasRolledThisTurn
              ? `نتيجة النرد: ${diceValue}`
              : 'ارمِ نرد سانترا 🎲'}
          </button>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
          {SANTRA_BOARD_TILES.map((tile) => {
            const hasP1 = p1BoardPos === tile.index;
            const hasP2 = p2BoardPos === tile.index;
            return (
              <div
                key={tile.index}
                className={`relative rounded-xl p-2 border text-center transition-all ${tile.color} ${
                  hasP1 || hasP2 ? 'ring-2 ring-amber-400 shadow-lg scale-[1.02]' : 'opacity-85'
                }`}
              >
                <div className="flex items-center justify-between text-[9px] font-chakra text-zinc-400 mb-0.5">
                  <span>#{tile.index + 1}</span>
                  <div className="flex items-center gap-0.5">
                    {hasP1 && (
                      <span className="px-1 rounded bg-amber-500 text-zinc-950 font-black text-[8px]">P1</span>
                    )}
                    {hasP2 && (
                      <span className="px-1 rounded bg-sky-400 text-zinc-950 font-black text-[8px]">
                        {playType === 'solo_ai' ? 'AI' : 'P2'}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-[10px] font-black text-white truncate">{tile.label}</div>
              </div>
            );
          })}
        </div>

        {boardEventBanner && (
          <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-200 text-xs font-bold text-center animate-fade-in">
            {boardEventBanner}
          </div>
        )}
      </div>

      {/* 3D SANTRA CHESTS SELECTION FOR CURRENT POSITION */}
      <div className="bg-zinc-900/95 border border-amber-500/35 rounded-3xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-black text-white text-sm sm:text-base">
                اختر صندوق سانترا ثلاثي الأبعاد للمركز ({currentExpectedPos})
              </h3>
              <p className="text-[11px] text-zinc-400">
                اضغط على أحد الصناديق الثلاثة لفتحه وكشف لاعب هذا المركز!
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {chestTiersForRound.map((tier, idx) => (
            <SantraChest3DCard
              key={idx}
              tier={tier}
              boxNumber={idx + 1}
              isSelected={selectedBoxIndex === idx}
              isOpened={selectedBoxIndex === idx && awardedPlayer !== null}
              disabled={selectedBoxIndex !== null && selectedBoxIndex !== idx}
              onPressChest={() => handleSelectBox(idx)}
              revealedContent={
                awardedPlayer ? (
                  <div className="flex flex-col items-center space-y-2 py-1">
                    <PlayerCard player={awardedPlayer} size="sm" showStats={false} />
                    <span className="text-xs font-black text-amber-300">{awardedPlayer.name}</span>
                  </div>
                ) : null
              }
            />
          ))}
        </div>

        {awardedPlayer && (
          <div className="bg-zinc-950/90 border border-amber-500/40 rounded-2xl p-4 text-center space-y-3 animate-fade-in">
            <div className="text-xs font-black text-amber-400">
              تم كشف البطل من صندوق سانترا 3D: {awardedPlayer.name} ({awardedPlayer.ovr} OVR)
            </div>
            <div className="flex justify-center">
              <PlayerCard player={awardedPlayer} size="md" />
            </div>
            <GoldButton fullWidth size="lg" onClick={handleAfterBoxPick}>
              ضم اللاعب للتشكيلة والانتقال للخطوة التالية
            </GoldButton>
          </div>
        )}
      </div>

      {/* Live 2D Pitch */}
      <SantraLivePitch
        mode={mode}
        currentRoundPosition={currentExpectedPos}
        player1Name={p1Name}
        player2Name={p2Name}
        p1Squad={p1Squad}
        p2Squad={p2Squad}
        activeHighlightPlayerId={awardedPlayer?.id}
        activeTurn={activePlayer === 1 ? 'p1' : 'p2'}
      />
    </div>
  );
};
