import React, { useState, useEffect, useCallback } from 'react';
import {
  GoalixLeagueMatchRecord,
  GoalixLeagueStandingRow,
  Player,
  UserProfile,
} from '../../types/game';
import {
  getRankTierInfo,
  getUserSquad,
  getUserCollection,
  getFormattedAccountId,
} from '../../services/storage';
import {
  fetchGoalixLeagueStandings,
  syncPlayerAccountWithServer,
} from '../../services/roomApi';
import { GoldButton } from '../common/GoldButton';
import { sounds } from '../../services/audio';
import {
  Trophy,
  Medal,
  Crown,
  Shield,
  Calendar,
  Clock,
  RefreshCw,
  Users,
  Swords,
  CheckCircle2,
} from 'lucide-react';

interface RankingScreenProps {
  profile: UserProfile;
  onNavigateToRooms?: () => void;
}

export const RankingScreen: React.FC<RankingScreenProps> = ({
  profile,
  onNavigateToRooms,
}) => {
  const [leaguePeriod, setLeaguePeriod] = useState<'daily' | 'weekly'>('daily');
  const [dailyTable, setDailyTable] = useState<GoalixLeagueStandingRow[]>([]);
  const [weeklyTable, setWeeklyTable] = useState<GoalixLeagueStandingRow[]>([]);
  const [recentMatches, setRecentMatches] = useState<GoalixLeagueMatchRecord[]>([]);
  const [dailyResetAt, setDailyResetAt] = useState<number>(Date.now() + 3600000);
  const [weeklyResetAt, setWeeklyResetAt] = useState<number>(Date.now() + 86400000);
  const [loading, setLoading] = useState<boolean>(true);
  const [nowTs, setNowTs] = useState<number>(Date.now());

  const myAccountId = getFormattedAccountId(profile);

  const squadPlayers = getUserSquad().filter((p): p is Player => p !== null);
  const userSquadOvr =
    squadPlayers.length > 0
      ? Math.round(squadPlayers.reduce((sum, p) => sum + (p.ovr || 0), 0) / squadPlayers.length)
      : 85;

  const loadLeagueData = useCallback(async () => {
    setLoading(true);
    try {
      await syncPlayerAccountWithServer(
        profile,
        userSquadOvr,
        getUserCollection().length
      );
      const res = await fetchGoalixLeagueStandings();
      setDailyTable(res.daily || []);
      setWeeklyTable(res.weekly || []);
      setRecentMatches(res.recentMatches || []);
      if (res.dailyResetAt) setDailyResetAt(res.dailyResetAt);
      if (res.weeklyResetAt) setWeeklyResetAt(res.weeklyResetAt);
    } catch {
      // Fallback: ensure current user is shown if offline
      const selfRow: GoalixLeagueStandingRow = {
        playerId: profile.id,
        accountId: myAccountId,
        playerName: profile.username || 'كابتن جواليكس',
        squadOvr: userSquadOvr,
        played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDiff: 0,
        points: 0,
        form: [],
        lastPlayedAt: Date.now(),
      };
      setDailyTable((prev) => (prev.length > 0 ? prev : [selfRow]));
      setWeeklyTable((prev) => (prev.length > 0 ? prev : [selfRow]));
    } finally {
      setLoading(false);
    }
  }, [profile, userSquadOvr, myAccountId]);

  useEffect(() => {
    loadLeagueData();
    const poll = setInterval(loadLeagueData, 8000);
    const clock = setInterval(() => setNowTs(Date.now()), 1000);
    return () => {
      clearInterval(poll);
      clearInterval(clock);
    };
  }, [loadLeagueData]);

  const activeTable = leaguePeriod === 'daily' ? dailyTable : weeklyTable;
  const targetReset = leaguePeriod === 'daily' ? dailyResetAt : weeklyResetAt;
  const remainingMs = Math.max(0, targetReset - nowTs);
  const remHours = Math.floor(remainingMs / (1000 * 60 * 60));
  const remMinutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
  const remDays = Math.floor(remHours / 24);

  const myRowIndex = activeTable.findIndex(
    (r) => r.playerId === profile.id || r.accountId === myAccountId
  );
  const myRow = myRowIndex >= 0 ? activeTable[myRowIndex] : null;
  const myRank = myRowIndex >= 0 ? myRowIndex + 1 : 1;
  const rankInfo = getRankTierInfo(myRow ? myRow.points : profile.rankPoints ?? 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-28 space-y-6 animate-fade-in">
      {/* Official GOALIX League Header */}
      <div className="text-center space-y-2.5">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/35 text-amber-300 text-xs font-black">
          <Crown className="w-4 h-4" />
          <span>جدول دوري جولكس الحقيقي للغرف — OFFICIAL ROOMS LEAGUE</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white">
          جدول دوري GOALIX (مباريات الغرف فقط)
        </h2>
        <p className="text-xs sm:text-sm text-zinc-300 max-w-xl mx-auto">
          جدول حقيقي 100% مخصص للاعبين المتنافسين في <strong className="text-amber-300">الغرف (ROOMS)</strong> بدون أي حسابات وهمية:{' '}
          <strong className="text-emerald-400">الفوز = 3 نقاط</strong> •{' '}
          <strong className="text-sky-400">التعادل = 1 نقطة</strong> •{' '}
          <strong className="text-rose-400">الهزيمة = 0 نقاط</strong>
        </p>
      </div>

      {/* Daily vs Weekly League Selector Tabs */}
      <div className="grid grid-cols-2 gap-3 bg-zinc-900/95 p-2 rounded-2xl border border-amber-500/30 shadow-xl">
        <button
          onClick={() => {
            sounds.playTap();
            setLeaguePeriod('daily');
          }}
          className={`py-3.5 px-4 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all ${
            leaguePeriod === 'daily'
              ? 'bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 text-zinc-950 shadow-[0_0_25px_rgba(245,158,11,0.35)]'
              : 'text-zinc-400 hover:text-white bg-zinc-950/50'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>الجدول اليومي (دوري اليوم)</span>
        </button>

        <button
          onClick={() => {
            sounds.playTap();
            setLeaguePeriod('weekly');
          }}
          className={`py-3.5 px-4 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all ${
            leaguePeriod === 'weekly'
              ? 'bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 text-zinc-950 shadow-[0_0_25px_rgba(245,158,11,0.35)]'
              : 'text-zinc-400 hover:text-white bg-zinc-950/50'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>الجدول الأسبوعي (دوري الأسبوع)</span>
        </button>
      </div>

      {/* Player's Current League Standing Card */}
      <div className="rounded-3xl bg-gradient-to-br from-amber-500/20 via-zinc-900 to-zinc-950 border-2 border-amber-500/50 p-5 sm:p-6 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-zinc-950 border-2 border-amber-400 flex flex-col items-center justify-center shadow-[0_0_25px_rgba(245,158,11,0.3)] shrink-0">
              <span className="text-2xl">{rankInfo.badgeIcon}</span>
              <span className="font-chakra text-xs font-black text-amber-400">#{myRank}</span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg sm:text-xl font-black text-white">
                  {profile.username || 'كابتن جواليكس'}
                </h3>
                <span className="px-2.5 py-0.5 rounded-lg bg-zinc-950 border border-amber-500/40 font-chakra text-xs font-black text-amber-300">
                  {myAccountId}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-black text-[10px]">
                  {leaguePeriod === 'daily' ? 'ترتيبك اليومي' : 'ترتيبك الأسبوعي'}
                </span>
              </div>

              <div className="flex items-center gap-3 mt-2 text-xs font-bold flex-wrap">
                <span className="text-zinc-300">لعب: {myRow?.played || 0}</span>
                <span className="text-zinc-600">•</span>
                <span className="text-emerald-400">فوز: {myRow?.wins || 0}</span>
                <span className="text-zinc-600">•</span>
                <span className="text-sky-400">تعادل: {myRow?.draws || 0}</span>
                <span className="text-zinc-600">•</span>
                <span className="text-rose-400">هزيمة: {myRow?.losses || 0}</span>
                <span className="text-zinc-600">•</span>
                <span className="text-amber-300 font-chakra">
                  الأهداف: {myRow?.goalsFor || 0}:{myRow?.goalsAgainst || 0}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 self-stretch sm:self-auto justify-between sm:justify-end">
            <div className="bg-zinc-950/90 border border-amber-500/40 rounded-2xl px-5 py-3 text-center">
              <div className="text-[11px] font-bold text-zinc-400">
                {leaguePeriod === 'daily' ? 'نقاط اليوم' : 'نقاط الأسبوع'}
              </div>
              <div className="font-chakra text-3xl font-black text-amber-400 tabular-nums">
                {myRow?.points || 0} <span className="text-xs text-emerald-400">نقطة</span>
              </div>
            </div>

            {onNavigateToRooms && (
              <GoldButton onClick={onNavigateToRooms} size="md">
                <Swords className="w-4 h-4" />
                العب غرفة الآن
              </GoldButton>
            )}
          </div>
        </div>

        {/* League Period Timer & Rules Bar */}
        <div className="pt-3 border-t border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-zinc-300 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              يتم احتساب النقاط تلقائيًا فور انتهاء أي مباراة داخل قسم{' '}
              <strong className="text-amber-300">الغرف (ROOMS)</strong>
            </span>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <span className="px-3 py-1 rounded-xl bg-zinc-950 border border-zinc-800 text-amber-300 font-chakra text-xs font-bold">
              {leaguePeriod === 'daily'
                ? `يتجدد الجدول اليومي بعد: ${remHours} س و ${remMinutes} د`
                : `يتجدد الجدول الأسبوعي بعد: ${remDays} يوم و ${remHours % 24} س`}
            </span>

            <button
              onClick={() => {
                sounds.playTap();
                loadLeagueData();
              }}
              className="p-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-amber-400 transition-all"
              title="تحديث جدول الدوري"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-400' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* OFFICIAL FOOTBALL LEAGUE STANDINGS TABLE */}
      <div className="bg-zinc-900/95 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between flex-wrap gap-2 bg-zinc-950/60">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm sm:text-base font-black text-white">
              {leaguePeriod === 'daily'
                ? 'جدول ترتيب دوري جولكس اليومي (Daily Rooms League)'
                : 'جدول ترتيب دوري جولكس الأسبوعي (Weekly Rooms League)'}
            </h3>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-400">
            <Users className="w-4 h-4 text-amber-400" />
            <span>اللاعبون المسجلون: {activeTable.length}</span>
          </div>
        </div>

        {/* Responsive League Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-zinc-950/90 border-b border-zinc-800 text-[11px] font-black text-zinc-400 uppercase">
                <th className="py-3.5 px-3 text-center w-12">#</th>
                <th className="py-3.5 px-3">اللاعب (Player & ID)</th>
                <th className="py-3.5 px-2 text-center" title="المباريات الملعوبة">
                  لعب
                </th>
                <th className="py-3.5 px-2 text-center text-emerald-400" title="فوز (3 نقاط)">
                  فوز
                </th>
                <th className="py-3.5 px-2 text-center text-sky-400" title="تعادل (1 نقطة)">
                  تعادل
                </th>
                <th className="py-3.5 px-2 text-center text-rose-400" title="هزيمة (0 نقاط)">
                  هزيمة
                </th>
                <th className="py-3.5 px-2 text-center hidden sm:table-cell" title="له : عليه">
                  الأهداف
                </th>
                <th className="py-3.5 px-2 text-center hidden md:table-cell" title="فارق الأهداف">
                  +/-
                </th>
                <th className="py-3.5 px-2 text-center hidden sm:table-cell">آخر المباريات</th>
                <th className="py-3.5 px-4 text-center text-amber-400">النقاط (PTS)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80 text-xs sm:text-sm">
              {activeTable.map((row, idx) => {
                const rank = idx + 1;
                const isMe =
                  row.playerId === profile.id || row.accountId === myAccountId;

                return (
                  <tr
                    key={row.playerId}
                    className={`transition-colors ${
                      isMe
                        ? 'bg-gradient-to-l from-amber-500/20 via-amber-500/10 to-transparent'
                        : 'hover:bg-zinc-950/60'
                    }`}
                  >
                    {/* Rank Number / Medal */}
                    <td className="py-3.5 px-3 text-center">
                      <div
                        className={`w-8 h-8 rounded-xl mx-auto flex items-center justify-center font-chakra font-black text-xs ${
                          rank === 1
                            ? 'bg-gradient-to-br from-amber-300 to-yellow-600 text-zinc-950 shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                            : rank === 2
                            ? 'bg-gradient-to-br from-slate-200 to-slate-400 text-zinc-950'
                            : rank === 3
                            ? 'bg-gradient-to-br from-amber-600 to-amber-800 text-white'
                            : 'bg-zinc-800/90 text-zinc-400'
                        }`}
                      >
                        {rank <= 3 ? <Medal className="w-4 h-4" /> : rank}
                      </div>
                    </td>

                    {/* Player Name & Account ID */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-zinc-950 border border-amber-500/35 flex items-center justify-center font-chakra font-black text-amber-300 text-xs shrink-0">
                          {(row.playerName || 'G').charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-black text-white">{row.playerName}</span>
                            {isMe && (
                              <span className="px-2 py-0.5 rounded-full bg-amber-400 text-zinc-950 text-[10px] font-black">
                                أنت
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-chakra mt-0.5">
                            <span className="text-amber-300/90 font-bold">{row.accountId}</span>
                            <span>•</span>
                            <span className="flex items-center gap-0.5 text-sky-400 font-bold">
                              <Shield className="w-3 h-3" />
                              {row.squadOvr} OVR
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Played */}
                    <td className="py-3.5 px-2 text-center font-chakra font-black text-zinc-200 tabular-nums">
                      {row.played}
                    </td>

                    {/* Wins */}
                    <td className="py-3.5 px-2 text-center font-chakra font-black text-emerald-400 tabular-nums">
                      {row.wins}
                    </td>

                    {/* Draws */}
                    <td className="py-3.5 px-2 text-center font-chakra font-black text-sky-400 tabular-nums">
                      {row.draws}
                    </td>

                    {/* Losses */}
                    <td className="py-3.5 px-2 text-center font-chakra font-black text-rose-400 tabular-nums">
                      {row.losses}
                    </td>

                    {/* Goals For : Against */}
                    <td className="py-3.5 px-2 text-center font-chakra font-bold text-zinc-300 hidden sm:table-cell tabular-nums">
                      {row.goalsFor} : {row.goalsAgainst}
                    </td>

                    {/* Goal Difference */}
                    <td className="py-3.5 px-2 text-center font-chakra font-black hidden md:table-cell tabular-nums">
                      <span
                        className={
                          row.goalDiff > 0
                            ? 'text-emerald-400'
                            : row.goalDiff < 0
                            ? 'text-rose-400'
                            : 'text-zinc-400'
                        }
                      >
                        {row.goalDiff > 0 ? `+${row.goalDiff}` : row.goalDiff}
                      </span>
                    </td>

                    {/* Recent Form (Last 5 Room Matches) */}
                    <td className="py-3.5 px-2 text-center hidden sm:table-cell">
                      {row.form.length === 0 ? (
                        <span className="text-[10px] text-zinc-600 font-bold">—</span>
                      ) : (
                        <div className="inline-flex items-center gap-1">
                          {row.form.map((f, i) => (
                            <span
                              key={i}
                              className={`w-5 h-5 rounded-md font-chakra text-[10px] font-black flex items-center justify-center ${
                                f === 'W'
                                  ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40'
                                  : f === 'D'
                                  ? 'bg-sky-500/25 text-sky-300 border border-sky-500/40'
                                  : 'bg-rose-500/25 text-rose-300 border border-rose-500/40'
                              }`}
                            >
                              {f}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>

                    {/* Official Points (Win=3, Draw=1, Loss=0) */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex flex-col items-center justify-center bg-zinc-950 border border-amber-500/40 rounded-xl px-3 py-1 min-w-[56px]">
                        <span className="font-chakra text-base sm:text-lg font-black text-amber-400 tabular-nums leading-tight">
                          {row.points}
                        </span>
                        <span className="text-[9px] font-black text-emerald-400 uppercase">
                          نقطة
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* RECENT REAL ROOM MATCHES LOG */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
            <Swords className="w-5 h-5 text-amber-400" />
            <span>سجل نتائج مباريات الغرف المحتسبة في الدوري</span>
          </h3>
          <span className="text-[11px] text-zinc-400 font-bold">
            الفوز +3 نقاط • التعادل +1 نقطة • الهزيمة 0
          </span>
        </div>

        {recentMatches.length === 0 ? (
          <div className="text-center py-8 bg-zinc-950/70 rounded-2xl border border-zinc-800/80 space-y-3">
            <Swords className="w-9 h-9 text-amber-400/60 mx-auto" />
            <div className="text-sm font-black text-white">
              لم تُلعب مباريات غرف مكتملة في هذه الفترة بعد
            </div>
            <p className="text-xs text-zinc-400 max-w-md mx-auto">
              أنشئ غرفة أو انضم لغرفة مع منافسك وأكمل المباراة ليتم تسجيل النتيجة والنقاط رسميًا في
              جدول دوري جولكس اليومي والأسبوعي!
            </p>
            {onNavigateToRooms && (
              <div className="pt-1">
                <GoldButton size="sm" onClick={onNavigateToRooms}>
                  انتقل إلى غرف اللعب الآن (ROOMS)
                </GoldButton>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recentMatches.slice(0, 10).map((m) => {
              const hostWon = m.hostGoals > m.guestGoals;
              const guestWon = m.guestGoals > m.hostGoals;
              return (
                <div
                  key={m.id}
                  className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-3"
                >
                  <div className="flex-1 text-right">
                    <div className="text-xs font-black text-white truncate">{m.hostName}</div>
                    <div className="text-[10px] font-chakra font-bold text-emerald-400">
                      {hostWon ? '+3 نقاط (فوز)' : !guestWon ? '+1 نقطة (تعادل)' : '0 نقاط'}
                    </div>
                  </div>

                  <div className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-amber-500/30 text-center shrink-0">
                    <div className="font-chakra text-base font-black text-amber-300 tabular-nums">
                      {m.hostGoals} - {m.guestGoals}
                    </div>
                    <div className="text-[9px] font-chakra text-zinc-400">غرفة #{m.roomCode}</div>
                  </div>

                  <div className="flex-1 text-left">
                    <div className="text-xs font-black text-white truncate">{m.guestName}</div>
                    <div className="text-[10px] font-chakra font-bold text-sky-400">
                      {guestWon ? '+3 نقاط (فوز)' : !hostWon ? '+1 نقطة (تعادل)' : '0 نقاط'}
                    </div>
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
