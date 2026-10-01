import React, { useState, useEffect } from 'react';
import { UserProfile, PastWinnerMedal } from '../../types/game';
import { sounds } from '../../services/audio';
import { GoldButton } from '../common/GoldButton';
import { 
  Trophy, 
  Crown, 
  Medal, 
  Coins, 
  Clock, 
  ArrowRight, 
  Sparkles, 
  Award, 
  TrendingUp, 
  User, 
  ShieldCheck,
  Calendar
} from 'lucide-react';

interface RankingScreenProps {
  userProfile: UserProfile;
  onBack: () => void;
  onOpenStore?: () => void;
}

type RankingTimeframe = 'daily' | 'weekly' | 'monthly';

interface LeaderboardUser {
  rank: number;
  id: string;
  username: string;
  avatar: string;
  coins: number;
  bestRank: number;
  badge?: string;
  countryFlag?: string;
  isCurrentUser?: boolean;
}

export const RankingScreen: React.FC<RankingScreenProps> = ({
  userProfile,
  onBack,
  onOpenStore
}) => {
  const [timeframe, setTimeframe] = useState<RankingTimeframe>('weekly');
  const [activeTabSection, setActiveTabSection] = useState<'leaderboard' | 'hall_of_fame' | 'rewards'>('leaderboard');
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 14,
    minutes: 32,
    seconds: 45
  });

  // Countdown timer simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Community Leaderboard Data
  const baseCommunityUsers: Omit<LeaderboardUser, 'rank'>[] = [
    { id: 'u1', username: 'المايسترو زيد', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80', coins: 1420, bestRank: 1, badge: '👑 بطل الأسبوع', countryFlag: '🇸🇦' },
    { id: 'u2', username: 'صقر قرطاج', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80', coins: 1180, bestRank: 2, badge: '⚡ هداف المنصة', countryFlag: '🇹🇳' },
    { id: 'u3', username: 'كابتن طارق', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80', coins: 950, bestRank: 3, badge: '🛡️ صخرة الدفاع', countryFlag: '🇪🇬' },
    { id: 'u4', username: 'فارس الميدان', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80', coins: 780, bestRank: 4, countryFlag: '🇲🇦' },
    { id: 'u5', username: 'أسد الرافدين', avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=120&q=80', coins: 640, bestRank: 5, countryFlag: '🇮🇶' },
    { id: 'u6', username: 'العقرب الأردني', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=120&q=80', coins: 510, bestRank: 6, countryFlag: '🇯🇴' },
    { id: 'u7', username: 'ساحر النيل', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=120&q=80', coins: 430, bestRank: 7, countryFlag: '🇪🇬' },
    { id: 'u8', username: 'النينجا الجزائري', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80', coins: 360, bestRank: 8, countryFlag: '🇩🇿' },
    { id: 'u9', username: 'قاهر الشباك', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80', coins: 290, bestRank: 9, countryFlag: '🇦🇪' },
    { id: 'u10', username: 'دينامو الخليج', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80', coins: 210, bestRank: 10, countryFlag: '🇰🇼' }
  ];

  // Scale coins based on timeframe
  const multiplier = timeframe === 'daily' ? 0.3 : timeframe === 'weekly' ? 1 : 3.2;

  // Insert current user into ranking dynamically based on coins
  const currentUserItem = {
    id: userProfile.id,
    username: userProfile.username,
    avatar: userProfile.avatar,
    coins: userProfile.coins,
    bestRank: userProfile.bestRank || 12,
    badge: '⭐ أنت',
    countryFlag: '⚽',
    isCurrentUser: true
  };

  const allLeaderboardUsers: LeaderboardUser[] = [
    ...baseCommunityUsers.map(u => ({ ...u, coins: Math.round(u.coins * multiplier) })),
    currentUserItem
  ]
    .sort((a, b) => b.coins - a.coins)
    .map((u, idx) => ({ ...u, rank: idx + 1 }));

  const currentUserRankInfo = allLeaderboardUsers.find(u => u.isCurrentUser) || {
    rank: 11,
    ...currentUserItem
  };

  // Hall of Fame - Previous Winners with Medals
  const previousWinners: {
    season: string;
    period: string;
    winnerName: string;
    avatar: string;
    coinsTotal: number;
    medalType: 'gold' | 'silver' | 'bronze';
    medalTitle: string;
  }[] = [
    { season: 'الموسم 3', period: 'الأسبوع الماضي', winnerName: 'المايسترو زيد', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80', coinsTotal: 1840, medalType: 'gold', medalTitle: 'وسام الذهب الأسبوعي #3' },
    { season: 'الموسم 2', period: 'قبل أسبوعين', winnerName: 'صقر قرطاج', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80', coinsTotal: 1690, medalType: 'gold', medalTitle: 'وسام الذهب الأسبوعي #2' },
    { season: 'الموسم 1', period: 'الشهر الماضي', winnerName: 'كابتن طارق', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80', coinsTotal: 2450, medalType: 'gold', medalTitle: 'كأس الشهر الممتاز #1' }
  ];

  return (
    <div className="min-h-screen bg-[#08080a] text-zinc-100 pb-24 select-none">
      {/* Top Header */}
      <div className="sticky top-0 z-30 bg-[#0a0b0e]/95 backdrop-blur-md border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => {
            sounds.playTap();
            onBack();
          }}
          className="flex items-center gap-1.5 text-xs text-amber-400 font-tajawal hover:text-amber-300"
        >
          <ArrowRight className="w-4 h-4" />
          <span>رجوع</span>
        </button>

        <div className="flex items-center gap-1.5">
          <Trophy className="w-4 h-4 text-amber-400" />
          <h2 className="font-chakra font-black text-sm tracking-wider bg-gradient-to-r from-amber-200 to-amber-500 bg-clip-text text-transparent">
            GOALIX RANKING
          </h2>
        </div>

        <div className="w-12" />
      </div>

      <div className="max-w-md mx-auto px-4 py-4 space-y-4">
        {/* Navigation between Leaderboard / Hall of Fame / Rewards */}
        <div className="grid grid-cols-3 gap-1 bg-black/60 p-1 rounded-2xl border border-zinc-800 text-center text-xs font-tajawal font-bold">
          <button
            onClick={() => {
              sounds.playTap();
              setActiveTabSection('leaderboard');
            }}
            className={`py-2 rounded-xl transition-all ${
              activeTabSection === 'leaderboard'
                ? 'bg-amber-500 text-black shadow-lg font-black'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            المتصدرون
          </button>
          <button
            onClick={() => {
              sounds.playTap();
              setActiveTabSection('hall_of_fame');
            }}
            className={`py-2 rounded-xl transition-all ${
              activeTabSection === 'hall_of_fame'
                ? 'bg-amber-500 text-black shadow-lg font-black'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            الفائزون السابقون
          </button>
          <button
            onClick={() => {
              sounds.playTap();
              setActiveTabSection('rewards');
            }}
            className={`py-2 rounded-xl transition-all ${
              activeTabSection === 'rewards'
                ? 'bg-amber-500 text-black shadow-lg font-black'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            الجوائز
          </button>
        </div>

        {/* ================= SECTION 1: LEADERBOARD ================= */}
        {activeTabSection === 'leaderboard' && (
          <div className="space-y-4">
            {/* Timeframe Selector (Daily / Weekly / Monthly) */}
            <div className="bg-zinc-900/90 rounded-2xl p-3 border border-zinc-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-tajawal text-zinc-300">
                  الفترة الزمنية للترتيب:
                </span>
                <div className="flex items-center gap-1 text-[11px] font-chakra text-amber-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>
                    {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'daily' as RankingTimeframe, label: 'يومي (Daily)' },
                  { id: 'weekly' as RankingTimeframe, label: 'أسبوعي (Weekly)' },
                  { id: 'monthly' as RankingTimeframe, label: 'شهري (Monthly)' }
                ].map(tf => (
                  <button
                    key={tf.id}
                    onClick={() => {
                      sounds.playTap();
                      setTimeframe(tf.id);
                    }}
                    className={`py-2 rounded-xl text-xs font-tajawal font-bold border transition-all ${
                      timeframe === tf.id
                        ? 'border-amber-400 bg-amber-500/15 text-amber-300 shadow-md'
                        : 'border-zinc-800 bg-black/40 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {tf.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Current User Status Card */}
            <div className="bg-gradient-to-r from-amber-950/40 via-zinc-900 to-black rounded-2xl p-4 border border-amber-500/40 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-amber-400 bg-zinc-900 shadow">
                      {userProfile.avatar ? (
                        <img src={userProfile.avatar} alt={userProfile.username} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-6 h-6 text-amber-400 m-auto mt-2.5" />
                      )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-amber-500 text-black font-chakra font-black text-[9px] px-1 rounded-sm border border-amber-300">
                      #{currentUserRankInfo.rank}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-white font-tajawal">
                      {userProfile.username} (أنت)
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-zinc-400 font-tajawal">
                        أفضل مركز: <strong className="text-zinc-200 font-chakra">#{userProfile.bestRank || currentUserRankInfo.rank}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-left bg-black/60 px-3 py-1.5 rounded-xl border border-amber-500/30">
                  <div className="flex items-center gap-1 text-amber-400 font-chakra font-black text-base justify-end">
                    <Coins className="w-4 h-4" />
                    <span>{userProfile.coins}</span>
                  </div>
                  <span className="text-[9px] text-zinc-400 font-tajawal block text-right">رصيد الكوينز</span>
                </div>
              </div>

              <div className="text-[11px] text-amber-300/90 font-tajawal bg-amber-500/10 p-2 rounded-xl border border-amber-500/20 text-center">
                💡 الترتيب يعتمد أساساً على رصيد الكوينز المكتسبة من الفوز بالمباريات.
              </div>
            </div>

            {/* Top 3 Podium Highlights */}
            <div className="grid grid-cols-3 gap-2 items-end pt-2">
              {/* #2 Runner up */}
              {allLeaderboardUsers[1] && (
                <div className="bg-zinc-900/90 border border-zinc-700/80 rounded-2xl p-2.5 text-center space-y-1.5 shadow-lg">
                  <div className="w-6 h-6 rounded-full bg-zinc-700 text-zinc-200 text-xs font-chakra font-black flex items-center justify-center mx-auto">
                    2
                  </div>
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-zinc-500 mx-auto">
                    <img src={allLeaderboardUsers[1].avatar} alt="" className="w-full h-full object-cover" />
                  </div>
                  <p className="text-[11px] font-bold text-zinc-200 font-tajawal truncate">
                    {allLeaderboardUsers[1].username}
                  </p>
                  <span className="text-[10px] font-chakra font-bold text-zinc-300 block">
                    {allLeaderboardUsers[1].coins} C
                  </span>
                </div>
              )}

              {/* #1 Champion */}
              {allLeaderboardUsers[0] && (
                <div className="bg-gradient-to-b from-[#2b210a] via-zinc-900 to-zinc-950 border-2 border-amber-400 rounded-2xl p-3 text-center space-y-2 shadow-[0_0_20px_rgba(212,175,55,0.3)] -translate-y-2">
                  <div className="flex items-center justify-center gap-1 text-amber-400">
                    <Crown className="w-5 h-5 fill-amber-400 animate-bounce" />
                  </div>
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-amber-300 mx-auto shadow-md">
                    <img src={allLeaderboardUsers[0].avatar} alt="" className="w-full h-full object-cover" />
                  </div>
                  <p className="text-xs font-bold text-amber-300 font-tajawal truncate">
                    {allLeaderboardUsers[0].username}
                  </p>
                  <span className="text-xs font-chakra font-black text-amber-400 block">
                    {allLeaderboardUsers[0].coins} Coins
                  </span>
                  <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-tajawal block">
                    {allLeaderboardUsers[0].badge || 'المتصدر'}
                  </span>
                </div>
              )}

              {/* #3 Third place */}
              {allLeaderboardUsers[2] && (
                <div className="bg-zinc-900/90 border border-amber-900/60 rounded-2xl p-2.5 text-center space-y-1.5 shadow-lg">
                  <div className="w-6 h-6 rounded-full bg-amber-900/60 text-amber-300 text-xs font-chakra font-black flex items-center justify-center mx-auto">
                    3
                  </div>
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-amber-800 mx-auto">
                    <img src={allLeaderboardUsers[2].avatar} alt="" className="w-full h-full object-cover" />
                  </div>
                  <p className="text-[11px] font-bold text-zinc-200 font-tajawal truncate">
                    {allLeaderboardUsers[2].username}
                  </p>
                  <span className="text-[10px] font-chakra font-bold text-amber-400/90 block">
                    {allLeaderboardUsers[2].coins} C
                  </span>
                </div>
              )}
            </div>

            {/* Leaderboard Table List (#4 onwards) */}
            <div className="bg-zinc-900/90 rounded-2xl p-3 border border-zinc-800 shadow-xl space-y-2">
              <div className="flex items-center justify-between text-xs text-zinc-400 font-tajawal pb-2 border-b border-zinc-800 px-2">
                <span>المركز واللاعب</span>
                <span>الكوينز (Coins)</span>
              </div>

              <div className="space-y-1.5">
                {allLeaderboardUsers.map(user => {
                  const isUser = user.isCurrentUser;
                  return (
                    <div
                      key={user.id}
                      className={`flex items-center justify-between p-2.5 rounded-xl transition-all ${
                        isUser
                          ? 'bg-amber-500/20 border border-amber-400 text-amber-300 font-bold shadow-md'
                          : 'bg-black/40 border border-zinc-800/80 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={`w-6 text-center font-chakra font-black text-xs ${
                          user.rank === 1 ? 'text-amber-400' : user.rank === 2 ? 'text-zinc-300' : user.rank === 3 ? 'text-amber-600' : 'text-zinc-500'
                        }`}>
                          #{user.rank}
                        </span>

                        <div className="w-8 h-8 rounded-lg overflow-hidden border border-zinc-700 bg-zinc-800 shrink-0">
                          {user.avatar ? (
                            <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-4 h-4 text-zinc-400 m-auto mt-2" />
                          )}
                        </div>

                        <div className="truncate min-w-0">
                          <p className="text-xs font-tajawal font-medium text-zinc-100 truncate">
                            {user.username} {isUser && '(أنت)'}
                          </p>
                          {user.badge && (
                            <span className="text-[9px] text-amber-400/90 font-tajawal block">
                              {user.badge}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 font-chakra font-black text-xs text-amber-400 shrink-0">
                        <Coins className="w-3.5 h-3.5" />
                        <span>{user.coins}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ================= SECTION 2: HALL OF FAME (PREVIOUS WINNERS) ================= */}
        {activeTabSection === 'hall_of_fame' && (
          <div className="space-y-3">
            <div className="bg-zinc-900/90 rounded-2xl p-4 border border-zinc-800 space-y-2">
              <div className="flex items-center gap-2 text-amber-400">
                <Medal className="w-5 h-5" />
                <h3 className="font-chakra font-black text-sm text-zinc-100 uppercase tracking-wider">
                  HALL OF FAME · قاعة المشاهير
                </h3>
              </div>
              <p className="text-xs text-zinc-400 font-tajawal">
                سجل الفائزين السابقين بالبطولات والترتيب الدوري. يحتفظ الأبطال بأوسمتهم وميدالياتهم بشكل دائم في سجلهم.
              </p>
            </div>

            {/* User's own medals if any */}
            {userProfile.pastMedals && userProfile.pastMedals.length > 0 && (
              <div className="bg-gradient-to-r from-amber-950/40 via-zinc-900 to-black rounded-2xl p-4 border border-amber-500/40 space-y-2">
                <h4 className="text-xs font-bold text-amber-400 font-tajawal flex items-center gap-1.5">
                  <Award className="w-4 h-4" />
                  أوسمتك المحفوظة في السجل:
                </h4>
                <div className="space-y-1.5">
                  {userProfile.pastMedals.map(m => (
                    <div key={m.id} className="flex items-center justify-between p-2 rounded-xl bg-black/60 border border-amber-500/20 text-xs font-tajawal">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🏅</span>
                        <div>
                          <p className="font-bold text-white">{m.title}</p>
                          <span className="text-[10px] text-zinc-400">{m.season} · {m.date}</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-chakra text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                        {m.type.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Community Hall of Fame */}
            <div className="space-y-2">
              {previousWinners.map((winner, idx) => (
                <div
                  key={idx}
                  className="bg-zinc-900/90 rounded-2xl p-3.5 border border-zinc-800 flex items-center justify-between shadow-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden border border-amber-400/60 bg-zinc-800 shrink-0">
                      <img src={winner.avatar} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Crown className="w-3.5 h-3.5 text-amber-400" />
                        <h4 className="font-bold text-sm text-zinc-100 font-tajawal">{winner.winnerName}</h4>
                      </div>
                      <p className="text-[11px] text-amber-300 font-tajawal mt-0.5">
                        {winner.medalTitle}
                      </p>
                      <span className="text-[10px] text-zinc-400 font-chakra">
                        {winner.season} · {winner.period}
                      </span>
                    </div>
                  </div>

                  <div className="text-left">
                    <span className="text-xs font-chakra font-black text-amber-400 block">
                      {winner.coinsTotal} C
                    </span>
                    <span className="text-[9px] text-zinc-500 font-tajawal">مجموع الموسم</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= SECTION 3: REWARDS ================= */}
        {activeTabSection === 'rewards' && (
          <div className="space-y-3">
            <div className="bg-zinc-900/90 rounded-2xl p-4 border border-zinc-800 space-y-2">
              <div className="flex items-center gap-2 text-amber-400">
                <Sparkles className="w-5 h-5" />
                <h3 className="font-chakra font-black text-sm text-zinc-100 uppercase tracking-wider">
                  RANKING REWARDS · جوائز الترتيب
                </h3>
              </div>
              <p className="text-xs text-zinc-400 font-tajawal">
                تُوزع الجوائز تلقائياً عند انتهاء العد التنازلي لكل فترة لأصحاب المراكز الأولى.
              </p>
            </div>

            <div className="space-y-2.5">
              {[
                { rank: 'المركز الأول (#1)', reward: '+150 كوينز + وسام الذهب الدائم 🥇 + 30 Bids', border: 'border-amber-400 bg-amber-500/10' },
                { rank: 'المركز الثاني (#2)', reward: '+80 كوينز + وسام الفضة 🥈 + 20 Bids', border: 'border-zinc-500 bg-zinc-800/40' },
                { rank: 'المركز الثالث (#3)', reward: '+50 كوينز + وسام البرونز 🥉 + 10 Bids', border: 'border-amber-800 bg-amber-950/20' },
                { rank: 'المراكز 4 – 10', reward: '+25 كوينز + 5 Bids', border: 'border-zinc-800 bg-black/40' },
                { rank: 'المراكز 11 – 50', reward: '+10 كوينز + 2 Bids', border: 'border-zinc-800 bg-black/40' }
              ].map((tier, idx) => (
                <div key={idx} className={`p-3.5 rounded-2xl border ${tier.border} flex items-center justify-between`}>
                  <div>
                    <h4 className="font-bold text-xs text-white font-tajawal">{tier.rank}</h4>
                    <p className="text-[11px] text-amber-300 font-tajawal mt-0.5">{tier.reward}</p>
                  </div>
                  <Award className="w-5 h-5 text-amber-400/80" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
