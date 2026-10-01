import React, { useState, useEffect, useRef } from 'react';
import { UserProfile } from '../../types/game';
import { sounds } from '../../services/audio';
import { GoldButton } from '../common/GoldButton';
import { 
  fetchOnlineRanking, 
  syncUserRankingProfile, 
  RankedPlayer 
} from '../../services/rankingApi';
import { 
  Trophy, 
  Crown, 
  Medal, 
  Wifi, 
  RefreshCw, 
  TrendingUp, 
  ShieldCheck, 
  Sparkles,
  Info,
  Flame,
  ArrowUpRight
} from 'lucide-react';

interface RankingScreenProps {
  userProfile: UserProfile;
  onBack?: () => void;
  onOpenRooms?: () => void;
}

export const RankingScreen: React.FC<RankingScreenProps> = ({
  userProfile,
  onOpenRooms
}) => {
  const [players, setPlayers] = useState<RankedPlayer[]>([]);
  const [currentUserRank, setCurrentUserRank] = useState<RankedPlayer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<number>(Date.now());
  const [secondsUntilNextRefresh, setSecondsUntilNextRefresh] = useState(5);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync user profile on mount
  useEffect(() => {
    syncUserRankingProfile(userProfile.id, userProfile.username, userProfile.avatar).catch(() => {});
  }, [userProfile.id, userProfile.username, userProfile.avatar]);

  // Main polling function: fetches server rankings every 5 seconds
  const loadRanking = async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      const data = await fetchOnlineRanking(userProfile.id);
      setPlayers(data.players);
      if (data.currentUser) {
        setCurrentUserRank(data.currentUser);
      } else {
        const found = data.players.find(p => p.id === userProfile.id);
        if (found) setCurrentUserRank(found);
      }
      setLastUpdated(data.lastUpdated);
      setErrorMsg(null);
    } catch {
      setErrorMsg('تعذر جلب جدول الترتيب المباشر من الخادم');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      setSecondsUntilNextRefresh(5);
    }
  };

  // Initial load
  useEffect(() => {
    loadRanking();
  }, [userProfile.id]);

  // Server Poll: Exactly every 5 seconds as requested
  useEffect(() => {
    const pollInterval = setInterval(() => {
      loadRanking();
    }, 5000);

    // 1-second countdown visual tick for live polling feedback
    const tickInterval = setInterval(() => {
      setSecondsUntilNextRefresh(prev => (prev > 1 ? prev - 1 : 5));
    }, 1000);

    return () => {
      clearInterval(pollInterval);
      clearInterval(tickInterval);
    };
  }, [userProfile.id]);

  const top3 = players.slice(0, 3);

  return (
    <div className="pb-24 pt-2 px-3 sm:px-4 max-w-lg mx-auto space-y-4 select-none font-tajawal antialiased">
      {/* ================= 1. HEADER & LIVE 5S SERVER POLLING BADGE ================= */}
      <div className="flex items-center justify-between bg-zinc-900/90 border border-amber-500/30 rounded-2xl p-3.5 backdrop-blur-md shadow-xl">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-yellow-300 p-0.5 shadow-md flex items-center justify-center">
            <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center">
              <Trophy className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <div>
            <h2 className="text-base font-black text-white font-tajawal">
              دوري الغرف الأونلاين
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[11px] font-tajawal text-emerald-400 font-bold">
                تحديث حي من السيرفر كل {secondsUntilNextRefresh}ث
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            sounds.playButtonClick();
            loadRanking(true);
          }}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/50 border border-zinc-800 text-xs font-bold text-amber-300 hover:border-amber-400/60 active:scale-95 transition-all cursor-pointer"
          title="تحديث فوري من السيرفر"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
          <span className="hidden xs:inline">تحديث</span>
        </button>
      </div>

      {/* ================= 2. OFFICIAL POINTS RULES EXPLAINER ================= */}
      <div className="bg-gradient-to-r from-amber-950/40 via-zinc-900 to-zinc-950 border border-amber-500/30 rounded-2xl p-3.5 space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-amber-300">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>نظام احتساب النقاط الحقيقي (مباريات الغرف فقط)</span>
          </div>
          <span className="text-[10px] font-chakra px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
            ONLINE ROOMS
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center font-chakra pt-1">
          <div className="bg-emerald-950/40 border border-emerald-500/30 p-2 rounded-xl">
            <span className="text-[10px] text-emerald-300 font-tajawal block font-bold">الفوز</span>
            <span className="text-base font-black text-emerald-400">+3 نقاط</span>
          </div>

          <div className="bg-blue-950/40 border border-blue-500/30 p-2 rounded-xl">
            <span className="text-[10px] text-blue-300 font-tajawal block font-bold">التعادل</span>
            <span className="text-base font-black text-blue-300">+1 نقطة</span>
          </div>

          <div className="bg-red-950/40 border border-red-500/30 p-2 rounded-xl">
            <span className="text-[10px] text-red-300 font-tajawal block font-bold">الخسارة</span>
            <span className="text-base font-black text-red-400">0 نقاط</span>
          </div>
        </div>

        <p className="text-[11px] text-zinc-400 font-tajawal text-center">
          ⚽ النقاط تُكسب حصرياً عبر الفوز والتعادل في مواجهات الغرف التنافسية الأونلاين ضد لاعبين حقيقيين!
        </p>
      </div>

      {/* ================= 3. CURRENT USER STANDING CARD ================= */}
      <div className="bg-gradient-to-b from-zinc-900 via-zinc-900/95 to-black border-2 border-amber-500/50 rounded-2xl p-4 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-11 h-11 rounded-xl overflow-hidden border-2 border-amber-400 bg-zinc-800 shadow">
              <img 
                src={userProfile.avatar || currentUserRank?.avatar} 
                alt={userProfile.username} 
                className="w-full h-full object-cover" 
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-sm text-white">
                  {userProfile.username}
                </h3>
                <span className="px-1.5 py-0.5 rounded text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                  أنت
                </span>
              </div>
              <span className="text-[11px] text-zinc-400 font-tajawal block">
                {currentUserRank && currentUserRank.played > 0 
                  ? `خاض ${currentUserRank.played} مباراة في الغرف`
                  : 'لم تخض مباريات غرف بعد، العب الآن!'}
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-zinc-400 font-tajawal block">الترتيب الحالي</span>
            <div className="flex items-center justify-end gap-1">
              <Crown className="w-4 h-4 text-amber-400" />
              <span className="text-xl font-chakra font-black text-amber-400">
                {currentUserRank ? `#${currentUserRank.rank}` : '#-'}
              </span>
            </div>
          </div>
        </div>

        {/* Detailed User Stats */}
        <div className="grid grid-cols-5 gap-1.5 bg-black/60 rounded-xl p-2.5 border border-zinc-800 text-center font-chakra">
          <div>
            <span className="text-[10px] text-zinc-400 font-tajawal block">النقاط</span>
            <span className="text-base font-black text-amber-400">{currentUserRank?.points || 0}</span>
          </div>
          <div>
            <span className="text-[10px] text-zinc-400 font-tajawal block">لعب</span>
            <span className="text-sm font-bold text-zinc-200">{currentUserRank?.played || 0}</span>
          </div>
          <div>
            <span className="text-[10px] text-emerald-400 font-tajawal block">فوز</span>
            <span className="text-sm font-bold text-emerald-400">{currentUserRank?.wins || 0}</span>
          </div>
          <div>
            <span className="text-[10px] text-blue-400 font-tajawal block">تعادل</span>
            <span className="text-sm font-bold text-blue-300">{currentUserRank?.draws || 0}</span>
          </div>
          <div>
            <span className="text-[10px] text-zinc-400 font-tajawal block">فارق الأهداف</span>
            <span className={`text-sm font-bold ${(currentUserRank?.goalDiff || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {(currentUserRank?.goalDiff || 0) > 0 ? `+${currentUserRank?.goalDiff}` : currentUserRank?.goalDiff || 0}
            </span>
          </div>
        </div>

        {onOpenRooms && (
          <div className="mt-3">
            <GoldButton 
              onClick={() => {
                sounds.playButtonClick();
                onOpenRooms();
              }} 
              fullWidth 
              size="sm"
            >
              <Wifi className="w-4 h-4" />
              <span>دخول الغرف وخوض مباراة (+3 نقاط للفوز)</span>
              <ArrowUpRight className="w-4 h-4 mr-0.5" />
            </GoldButton>
          </div>
        )}
      </div>

      {/* ================= 4. TOP 3 PODIUM ================= */}
      {top3.length > 0 && (
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-amber-400 font-tajawal flex items-center gap-1.5">
              <Crown className="w-4 h-4" />
              قمة صدارة الدوري (Top 3)
            </h3>
            <span className="text-[10px] text-zinc-400 font-tajawal">سيرفر مُعتمد</span>
          </div>

          <div className="grid grid-cols-3 gap-2 items-end pt-3">
            {/* Rank 2 (Silver) */}
            {top3[1] && (
              <div className="bg-zinc-900/90 border border-zinc-700/60 rounded-2xl p-2.5 text-center flex flex-col items-center shadow-lg relative">
                <div className="w-6 h-6 rounded-full bg-slate-300 text-black font-chakra font-black text-xs flex items-center justify-center -mt-5 mb-1 border-2 border-zinc-900 shadow">
                  2
                </div>
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-slate-300 bg-zinc-800 mb-1">
                  <img src={top3[1].avatar} alt={top3[1].username} className="w-full h-full object-cover" />
                </div>
                <span className="text-[11px] font-bold text-zinc-100 truncate w-full block">
                  {top3[1].username}
                </span>
                <span className="text-xs font-chakra font-black text-slate-300 mt-0.5">
                  {top3[1].points} <span className="text-[9px] font-tajawal">نقطة</span>
                </span>
                <span className="text-[9px] text-zinc-400 font-chakra">
                  {top3[1].wins}ف · {top3[1].draws}ت
                </span>
              </div>
            )}

            {/* Rank 1 (Gold Champion) */}
            {top3[0] && (
              <div className="bg-gradient-to-b from-amber-950/60 to-zinc-900 border-2 border-amber-400 rounded-2xl p-3 text-center flex flex-col items-center shadow-[0_4px_20px_rgba(212,175,55,0.25)] relative -translate-y-2">
                <Crown className="w-5 h-5 text-amber-400 -mt-6 mb-0.5 drop-shadow animate-bounce" />
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-amber-400 bg-zinc-800 mb-1 shadow-lg">
                  <img src={top3[0].avatar} alt={top3[0].username} className="w-full h-full object-cover" />
                </div>
                <span className="text-xs font-black text-white truncate w-full block">
                  {top3[0].username}
                </span>
                <span className="text-sm font-chakra font-black text-amber-400 mt-0.5">
                  {top3[0].points} <span className="text-[10px] font-tajawal">نقطة</span>
                </span>
                <span className="text-[10px] text-amber-200/80 font-chakra font-medium">
                  {top3[0].wins} فوز · {top3[0].played} مباراة
                </span>
                {top3[0].badge && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/40 mt-1">
                    {top3[0].badge}
                  </span>
                )}
              </div>
            )}

            {/* Rank 3 (Bronze) */}
            {top3[2] && (
              <div className="bg-zinc-900/90 border border-amber-700/60 rounded-2xl p-2.5 text-center flex flex-col items-center shadow-lg relative">
                <div className="w-6 h-6 rounded-full bg-amber-700 text-white font-chakra font-black text-xs flex items-center justify-center -mt-5 mb-1 border-2 border-zinc-900 shadow">
                  3
                </div>
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-amber-700 bg-zinc-800 mb-1">
                  <img src={top3[2].avatar} alt={top3[2].username} className="w-full h-full object-cover" />
                </div>
                <span className="text-[11px] font-bold text-zinc-100 truncate w-full block">
                  {top3[2].username}
                </span>
                <span className="text-xs font-chakra font-black text-amber-600 mt-0.5">
                  {top3[2].points} <span className="text-[9px] font-tajawal">نقطة</span>
                </span>
                <span className="text-[9px] text-zinc-400 font-chakra">
                  {top3[2].wins}ف · {top3[2].draws}ت
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= 5. FULL LEADERBOARD TABLE ================= */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-3 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-sm text-zinc-100 font-tajawal">
              جدول ترتيب المتنافسين
            </h3>
          </div>
          <span className="text-[11px] font-chakra text-zinc-400">
            {players.length} لاعب مسجل
          </span>
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-12 gap-1 px-3 py-2 bg-black/40 text-[10px] font-bold text-zinc-400 font-tajawal text-center border-b border-zinc-800/80">
          <div className="col-span-1">#</div>
          <div className="col-span-5 text-right pr-2">اللاعب</div>
          <div className="col-span-1">ل</div>
          <div className="col-span-1 text-emerald-400">ف</div>
          <div className="col-span-1 text-blue-300">ت</div>
          <div className="col-span-1 text-red-400">خ</div>
          <div className="col-span-1">+/-</div>
          <div className="col-span-1 font-chakra font-black text-amber-400">ن</div>
        </div>

        {/* Table Rows */}
        {players.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <Trophy className="w-8 h-8 text-amber-400/50 mx-auto" />
            <p className="text-sm font-bold text-zinc-300">جدول الدوري الحقيقي فارغ حالياً</p>
            <p className="text-xs text-zinc-500">لا توجد حسابات وهمية — خض مباريات حقيقية في الغرف لحصد النقاط وتصدر القائمة!</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/60 max-h-[380px] overflow-y-auto">
            {players.map((p) => {
              const isUser = p.id === userProfile.id;
              return (
                <div
                  key={p.id}
                  className={`grid grid-cols-12 gap-1 items-center px-3 py-2.5 text-center text-xs transition-colors ${
                    isUser
                      ? 'bg-amber-950/30 border-r-2 border-r-amber-400 font-bold'
                      : 'hover:bg-zinc-800/40'
                  }`}
                >
                  {/* Rank */}
                  <div className="col-span-1 font-chakra font-black">
                    {p.rank === 1 && <span className="text-amber-400">🥇</span>}
                    {p.rank === 2 && <span className="text-slate-300">🥈</span>}
                    {p.rank === 3 && <span className="text-amber-600">🥉</span>}
                    {p.rank > 3 && <span className="text-zinc-400 text-xs">#{p.rank}</span>}
                  </div>

                  {/* Player Profile & Name */}
                  <div className="col-span-5 flex items-center gap-2 text-right pr-1 overflow-hidden">
                    <div className="w-7 h-7 rounded-lg overflow-hidden border border-zinc-700 bg-zinc-800 shrink-0">
                      <img src={p.avatar} alt={p.username} className="w-full h-full object-cover" />
                    </div>
                    <div className="truncate">
                      <span className={`block truncate ${isUser ? 'text-amber-300 font-black' : 'text-zinc-200'}`}>
                        {p.username}
                      </span>
                      {p.badge && (
                        <span className="text-[9px] text-amber-400/80 block truncate">
                          {p.badge}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Played */}
                  <div className="col-span-1 font-chakra text-zinc-300 text-xs">
                    {p.played}
                  </div>

                  {/* Wins */}
                  <div className="col-span-1 font-chakra text-emerald-400 font-bold text-xs">
                    {p.wins}
                  </div>

                  {/* Draws */}
                  <div className="col-span-1 font-chakra text-blue-300 text-xs">
                    {p.draws}
                  </div>

                  {/* Losses */}
                  <div className="col-span-1 font-chakra text-zinc-500 text-xs">
                    {p.losses}
                  </div>

                  {/* Goal Diff */}
                  <div className={`col-span-1 font-chakra text-[11px] ${p.goalDiff >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {p.goalDiff > 0 ? `+${p.goalDiff}` : p.goalDiff}
                  </div>

                  {/* Points */}
                  <div className="col-span-1 font-chakra font-black text-amber-400 text-sm">
                    {p.points}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
