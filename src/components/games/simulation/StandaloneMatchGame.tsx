import React, { useState } from 'react';
import { FormationType, Player, SantraChestTier, UserProfile } from '../../../types/game';
import { getAllPlayers } from '../../../data/players';
import { getPositionOrder } from '../../../services/positions';
import { recordMatchOutcome, getUserSquad, getUserFormation } from '../../../services/storage';
import { MatchSimulationScreen } from './MatchSimulationScreen';
import { MatchSimulationOutput } from './MatchEngine';
import { PitchTactics } from '../../common/PitchTactics';
import { GoldButton } from '../../common/GoldButton';
import { sounds } from '../../../services/audio';
import { 
  Trophy, Shield, Swords, Sparkles, ArrowRight, RotateCcw, 
  Coins, Award, Package, Flame
} from 'lucide-react';

interface StandaloneMatchGameProps {
  profile: UserProfile;
  onBack: () => void;
  onUpdateProfile: (profile: UserProfile) => void;
  onOpenStore?: () => void;
}

interface RivalClub {
  id: string;
  name: string;
  difficultyLabel: string;
  formation: FormationType;
  advantageGoals: number;
  minOvr: number;
  rewardCoinsWin: number;
  chestTier: SantraChestTier;
}

const RIVAL_CLUBS: RivalClub[] = [
  {
    id: 'rival_1',
    name: 'أكاديمية النجوم الصاعدة',
    difficultyLabel: 'سهل (Easy)',
    formation: '4-4-2',
    advantageGoals: 0,
    minOvr: 82,
    rewardCoinsWin: 60,
    chestTier: 'Bronze',
  },
  {
    id: 'rival_2',
    name: 'أتلتيكو التكتيكي',
    difficultyLabel: 'متوسط (Medium)',
    formation: '5-3-2',
    advantageGoals: 0,
    minOvr: 86,
    rewardCoinsWin: 100,
    chestTier: 'Silver',
  },
  {
    id: 'rival_3',
    name: 'ملوك أوروبا (Real Elite)',
    difficultyLabel: 'صعب (Hard)',
    formation: '4-3-3',
    advantageGoals: 0,
    minOvr: 89,
    rewardCoinsWin: 160,
    chestTier: 'Gold',
  },
  {
    id: 'rival_4',
    name: 'أساطير التاريخ (ICONS XI)',
    difficultyLabel: 'أسطوري (Legendary)',
    formation: '4-2-3-1',
    advantageGoals: 1,
    minOvr: 92,
    rewardCoinsWin: 250,
    chestTier: 'Elite',
  },
];

export const StandaloneMatchGame: React.FC<StandaloneMatchGameProps> = ({
  profile,
  onBack,
  onUpdateProfile,
  onOpenStore,
}) => {
  const [phase, setPhase] = useState<'setup' | 'simulating' | 'result'>('setup');
  const [selectedRival, setSelectedRival] = useState<RivalClub>(RIVAL_CLUBS[1]);
  const [userFormation, setUserFormation] = useState<FormationType>(() => getUserFormation());
  const [tacticalBoost, setTacticalBoost] = useState<'attack' | 'balanced' | 'defense'>('balanced');
  const [rivalSquad, setRivalSquad] = useState<(Player | null)[]>([]);
  const [matchResult, setMatchResult] = useState<MatchSimulationOutput | null>(null);
  const [earnedRewardSummary, setEarnedRewardSummary] = useState<{
    outcome: 'win' | 'draw' | 'loss';
    coins: number;
    rpDelta: number;
    chestAwarded: string | null;
  } | null>(null);

  const allPlayers = getAllPlayers();
  const rawSquad = getUserSquad();
  const filledUserSquad: (Player | null)[] = rawSquad.map((p, idx) => {
    if (p) return p;
    return allPlayers[idx % allPlayers.length] || null;
  });

  const buildRivalSquad = (rival: RivalClub): (Player | null)[] => {
    const positions = getPositionOrder('full_eleven');
    const usedIds = new Set<string>();
    return positions.map((pos) => {
      const candidates = allPlayers.filter(
        (p) => p.position === pos && p.ovr >= rival.minOvr && !usedIds.has(p.id)
      );
      const fallback = allPlayers.filter((p) => p.ovr >= rival.minOvr && !usedIds.has(p.id));
      const pool = candidates.length > 0 ? candidates : fallback.length > 0 ? fallback : allPlayers;
      const chosen = pool[Math.floor(Math.random() * pool.length)];
      if (chosen) usedIds.add(chosen.id);
      return chosen || null;
    });
  };

  const handleStartSimulation = () => {
    sounds.playWhistle();
    const generatedRival = buildRivalSquad(selectedRival);
    setRivalSquad(generatedRival);
    setPhase('simulating');
  };

  const handleFinishMatch = (
    winner: 'team1' | 'team2' | 'draw',
    _defaultCoins: number,
    fullOutput: MatchSimulationOutput
  ) => {
    setMatchResult(fullOutput);

    const outcome: 'win' | 'draw' | 'loss' =
      winner === 'team1' ? 'win' : winner === 'draw' ? 'draw' : 'loss';

    const coinsEarned =
      outcome === 'win'
        ? selectedRival.rewardCoinsWin
        : outcome === 'draw'
        ? Math.round(selectedRival.rewardCoinsWin * 0.45)
        : 20;

    const res = recordMatchOutcome({
      matchId: `sqmatch_${Date.now()}`,
      gameId: 'squad_match',
      isOnline: false,
      outcome,
      customCoinsReward: coinsEarned,
      awardSantraChest: outcome === 'win' ? selectedRival.chestTier : undefined,
    });

    onUpdateProfile(res.updatedProfile);

    setEarnedRewardSummary({
      outcome,
      coins: res.coinsChanged,
      rpDelta: res.rankPointsChanged,
      chestAwarded: outcome === 'win' ? selectedRival.chestTier : null,
    });
    setPhase('result');
  };

  if (phase === 'simulating') {
    return (
      <MatchSimulationScreen
        team1Name={profile.username}
        team2Name={selectedRival.name}
        team1Squad={filledUserSquad}
        team2Squad={rivalSquad}
        advantageGoalsTeam1={tacticalBoost === 'attack' ? 1 : 0}
        advantageGoalsTeam2={selectedRival.advantageGoals}
        onFinishMatch={handleFinishMatch}
        onClose={() => setPhase('setup')}
      />
    );
  }

  if (phase === 'result' && matchResult && earnedRewardSummary) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 pb-28 space-y-5 animate-fade-in">
        <div className="rounded-3xl bg-gradient-to-b from-zinc-900 to-zinc-950 border-2 border-amber-500/40 p-6 text-center shadow-2xl space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Trophy className="w-9 h-9" />
          </div>

          <div>
            <span className="text-xs font-black uppercase tracking-widest text-amber-400">
              تقرير نهاية المباراة التكتيكية
            </span>
            <h2 className="text-3xl font-black text-white mt-1">
              {earnedRewardSummary.outcome === 'win'
                ? 'انتصار تكتيكي ساحق! 🏆'
                : earnedRewardSummary.outcome === 'draw'
                ? 'تعادل تكتيكي مثير! 🤝'
                : 'هزيمة بشرف — عوضها في الجولة القادمة! ⚽'}
            </h2>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 flex items-center justify-around">
            <div>
              <div className="text-sm font-black text-amber-400">{profile.username}</div>
              <div className="text-[11px] text-zinc-500">OVR {matchResult.team1Ovr}</div>
            </div>
            <div className="font-chakra text-4xl font-black text-white">
              {matchResult.goalsP1} - {matchResult.goalsP2}
            </div>
            <div>
              <div className="text-sm font-black text-sky-400">{selectedRival.name}</div>
              <div className="text-[11px] text-zinc-500">OVR {matchResult.team2Ovr}</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div className="bg-zinc-950 border border-amber-500/30 rounded-2xl p-3">
              <Coins className="w-5 h-5 text-amber-400 mx-auto mb-1" />
              <div className="font-chakra text-lg font-black text-amber-300">
                +{earnedRewardSummary.coins}
              </div>
              <div className="text-[10px] text-zinc-400 font-bold">مكافأة الكوينز</div>
            </div>

            <div className="bg-zinc-950 border border-emerald-500/30 rounded-2xl p-3">
              <Award className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
              <div className="font-chakra text-lg font-black text-emerald-400">
                +{earnedRewardSummary.rpDelta} RP
              </div>
              <div className="text-[10px] text-zinc-400 font-bold">نقاط التصنيف</div>
            </div>

            <div className="bg-zinc-950 border border-purple-500/30 rounded-2xl p-3">
              <Package className="w-5 h-5 text-purple-400 mx-auto mb-1" />
              <div className="text-xs font-black text-purple-300">
                {earnedRewardSummary.chestAwarded ? `صندوق ${earnedRewardSummary.chestAwarded}` : '—'}
              </div>
              <div className="text-[10px] text-zinc-400 font-bold">صندوق سانترا 3D</div>
            </div>
          </div>

          {earnedRewardSummary.chestAwarded && onOpenStore && (
            <button
              onClick={onOpenStore}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/25 to-amber-500/20 border border-amber-500/50 text-amber-300 font-black text-xs flex items-center justify-center gap-2 hover:bg-amber-500/30 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              ربحت صندوق سانترا 3D ({earnedRewardSummary.chestAwarded})! افتحه الآن من الخزينة
            </button>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <GoldButton
              fullWidth
              onClick={() => {
                sounds.playTap();
                setPhase('setup');
              }}
            >
              <RotateCcw className="w-4 h-4" />
              لعب مباراة جديدة (PLAY AGAIN)
            </GoldButton>
            <GoldButton variant="dark" fullWidth onClick={onBack}>
              العودة إلى الألعاب
            </GoldButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-4 pb-28 space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            sounds.playTap();
            onBack();
          }}
          className="flex items-center gap-1.5 text-zinc-400 hover:text-white text-xs font-black bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-xl"
        >
          <ArrowRight className="w-4 h-4" />
          العودة للألعاب
        </button>
        <div className="flex items-center gap-2">
          <Swords className="w-5 h-5 text-amber-400" />
          <h2 className="text-lg font-black text-white">محاكي المباريات التكتيكي (SQUAD MATCH)</h2>
        </div>
      </div>

      {/* Opponent Selection */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-amber-400 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span>1. اختر الفريق المنافس ومستوى الصعوبة</span>
          </h3>
          <span className="text-[11px] text-zinc-400 font-bold">الفوز = +3 RP + كوينز + صندوق 3D</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {RIVAL_CLUBS.map((club) => {
            const isSelected = selectedRival.id === club.id;
            return (
              <button
                key={club.id}
                onClick={() => {
                  sounds.playTap();
                  setSelectedRival(club);
                }}
                className={`text-right p-4 rounded-2xl border-2 transition-all ${
                  isSelected
                    ? 'bg-gradient-to-br from-amber-500/20 to-zinc-950 border-amber-500 shadow-[0_6px_20px_rgba(245,158,11,0.2)]'
                    : 'bg-zinc-950/80 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-black text-sm text-white">{club.name}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-zinc-900 text-amber-400 border border-amber-500/30">
                    {club.difficultyLabel}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-2">
                  <span>خطة: {club.formation} • تقييم +{club.minOvr}</span>
                  <span className="text-emerald-400 font-black">+{club.rewardCoinsWin} كوينز</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Formation & Tactical Mentality */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-5 space-y-4">
        <h3 className="text-sm font-black text-amber-400 flex items-center gap-2">
          <Flame className="w-4 h-4" />
          <span>2. اختر الخطة والتكتيك لتشكيلتك الأساسية</span>
        </h3>

        <div className="grid grid-cols-5 gap-2">
          {(['4-3-3', '4-4-2', '4-2-3-1', '3-5-2', '5-3-2'] as FormationType[]).map((fmt) => (
            <button
              key={fmt}
              onClick={() => {
                sounds.playTap();
                setUserFormation(fmt);
              }}
              className={`py-2 rounded-xl font-chakra text-xs font-black border transition-all ${
                userFormation === fmt
                  ? 'bg-amber-500 text-zinc-950 border-amber-400 shadow'
                  : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white'
              }`}
            >
              {fmt}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'attack', label: '🔥 هجوم ضاغط', desc: '+أفضلية هجومية' },
            { id: 'balanced', label: '⚖️ توازن تكتيكي', desc: '+تناغم وسط' },
            { id: 'defense', label: '🛡️ تكتل ومرتدات', desc: '+صلابة دفاعية' },
          ].map((tac) => (
            <button
              key={tac.id}
              onClick={() => {
                sounds.playTap();
                setTacticalBoost(tac.id as 'attack' | 'balanced' | 'defense');
              }}
              className={`p-2.5 rounded-xl border text-center transition-all ${
                tacticalBoost === tac.id
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-400'
              }`}
            >
              <div className="text-xs font-black">{tac.label}</div>
              <div className="text-[10px] text-zinc-500 mt-0.5">{tac.desc}</div>
            </button>
          ))}
        </div>

        {/* Squad Preview on Pitch */}
        <PitchTactics
          formation={userFormation}
          players={filledUserSquad}
          interactive={false}
        />

        <GoldButton fullWidth size="lg" onClick={handleStartSimulation}>
          <Swords className="w-5 h-5" />
          انطلاق صافرة المباراة ضد {selectedRival.name} (START MATCH)
        </GoldButton>
      </div>
    </div>
  );
};
