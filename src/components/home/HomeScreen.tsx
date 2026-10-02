import React from 'react';
import { GameId, Player, UserProfile } from '../../types/game';
import { getRankTierInfo, REWARDS_CATALOG, getRewardProgress, getUserSquad } from '../../services/storage';
import { GoldButton } from '../common/GoldButton';
import { NavTab } from '../common/BottomNav';
import { sounds } from '../../services/audio';
import {
  Play,
  Trophy,
  Shield,
  ShoppingBag,
  Sparkles,
  Award,
  Globe,
  Brain,
  Swords,
  Package,
  Gift,
  Coins,
  Activity,
  Settings,
  User,
  Crown,
  CreditCard,
} from 'lucide-react';
import heroBanner from '../../assets/images/goalix_hero_banner_1790797297425.jpg';
import statArenaCover from '../../assets/images/stat_arena_cover_1790797310047.jpg';
import santraCover from '../../assets/images/santra_mystery_cover_1790797320678.jpg';
import memoryXICover from '../../assets/images/memory_xi_cover_1790801558164.jpg';
import packShowcase from '../../assets/images/pack_showcase_vault_1790797331130.jpg';

interface HomeScreenProps {
  profile: UserProfile;
  onNavigate: (tab: NavTab) => void;
  onStartGame: (game: GameId) => void;
  onOpenProfile?: () => void;
  onOpenSettings?: () => void;
  onOpenStoreTab?: (section: 'packs' | 'chests' | 'topup' | 'owner' | 'rewards') => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  profile,
  onNavigate,
  onStartGame,
  onOpenProfile,
  onOpenSettings,
  onOpenStoreTab,
}) => {
  const squadPlayers = getUserSquad().filter((p): p is Player => p !== null);

  const squadOvr =
    squadPlayers.length > 0
      ? Math.round(squadPlayers.reduce((sum, p) => sum + (p.ovr || 0), 0) / squadPlayers.length)
      : 84;

  const userRp = profile.rankPoints ?? 0;
  const rankInfo = getRankTierInfo(userRp);
  const progressPercent = Math.min(
    100,
    Math.round(
      ((userRp - rankInfo.minPoints) / Math.max(1, rankInfo.nextPoints - rankInfo.minPoints)) * 100
    )
  );

  const unopenedChestsCount = profile.santraChests?.length || 0;
  const unopenedPacksCount = profile.ownedPacks?.length || 0;
  const claimableRewardsCount = REWARDS_CATALOG.filter((r) => {
    const prog = getRewardProgress(profile, r);
    return prog.unlocked && !prog.claimed;
  }).length;

  const recentActivity = profile.recentActivity || [];
  const displayName = profile.username || 'كابتن جواليكس';

  return (
    <div className="max-w-4xl mx-auto px-4 py-5 pb-28 space-y-6 animate-fade-in">
      {/* 1. PLAYER / PROFILE COMMAND DASHBOARD + RANK + COINS */}
      <div className="rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-950 to-black border-2 border-amber-500/35 p-5 shadow-[0_18px_45px_rgba(0,0,0,0.85)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Player Identity */}
          <div className="flex items-center gap-3.5">
            <button
              onClick={() => {
                sounds.playTap();
                onOpenProfile?.();
              }}
              className="relative w-15 h-15 rounded-2xl bg-gradient-to-br from-amber-300 via-yellow-500 to-amber-700 p-[2px] shadow-[0_0_25px_rgba(245,158,11,0.35)] shrink-0 group"
            >
              <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center group-hover:bg-zinc-900 transition-colors overflow-hidden">
                {profile.avatar ? (
                  <img
                    src={profile.avatar}
                    alt={displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="font-chakra text-2xl font-black text-amber-400">
                    {displayName.charAt(0)}
                  </span>
                )}
              </div>
              <span className="absolute -bottom-1.5 -right-1.5 px-1.5 py-0.5 rounded-md bg-zinc-950 border border-amber-500/50 text-xs">
                {rankInfo.badgeIcon}
              </span>
            </button>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-black text-white">{displayName}</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px] font-black">
                  {rankInfo.titleAr}
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-bold mt-0.5">{rankInfo.titleEn}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <button
                  onClick={() => {
                    sounds.playTap();
                    onOpenProfile?.();
                  }}
                  className="text-[11px] font-black text-amber-400 hover:text-amber-300 flex items-center gap-1 bg-zinc-900 px-2.5 py-1 rounded-lg border border-zinc-800"
                >
                  <User className="w-3 h-3" />
                  الملف الشخصي
                </button>
                <button
                  onClick={() => {
                    sounds.playTap();
                    onOpenSettings?.();
                  }}
                  className="text-[11px] font-black text-zinc-300 hover:text-white flex items-center gap-1 bg-zinc-900 px-2.5 py-1 rounded-lg border border-zinc-800"
                >
                  <Settings className="w-3 h-3 text-amber-400" />
                  الإعدادات
                </button>
              </div>
            </div>
          </div>

          {/* 4 Live KPI Counters (Coins, Rank Points, Squad OVR, Wins) */}
          <div className="grid grid-cols-4 gap-2 sm:min-w-[330px]">
            <button
              onClick={() => {
                sounds.playTap();
                onNavigate('store');
              }}
              className="bg-zinc-950 hover:bg-zinc-900 border border-amber-500/30 rounded-2xl p-2.5 text-center transition-all shadow-[0_4px_0_rgba(0,0,0,0.6)] active:translate-y-0.5"
            >
              <Coins className="w-4 h-4 text-amber-400 mx-auto mb-0.5" />
              <div className="font-chakra text-sm font-black text-amber-300 tabular-nums">
                {profile.coins.toLocaleString()}
              </div>
              <div className="text-[9px] text-zinc-500 font-bold">الكوينز</div>
            </button>

            <button
              onClick={() => {
                sounds.playTap();
                onNavigate('ranking');
              }}
              className="bg-zinc-950 hover:bg-zinc-900 border border-emerald-500/30 rounded-2xl p-2.5 text-center transition-all shadow-[0_4px_0_rgba(0,0,0,0.6)] active:translate-y-0.5"
            >
              <Award className="w-4 h-4 text-emerald-400 mx-auto mb-0.5" />
              <div className="font-chakra text-sm font-black text-emerald-400 tabular-nums">
                {userRp} RP
              </div>
              <div className="text-[9px] text-zinc-500 font-bold">نقاط التصنيف</div>
            </button>

            <button
              onClick={() => {
                sounds.playTap();
                onNavigate('squad');
              }}
              className="bg-zinc-950 hover:bg-zinc-900 border border-sky-500/30 rounded-2xl p-2.5 text-center transition-all shadow-[0_4px_0_rgba(0,0,0,0.6)] active:translate-y-0.5"
            >
              <Shield className="w-4 h-4 text-sky-400 mx-auto mb-0.5" />
              <div className="font-chakra text-sm font-black text-white tabular-nums">{squadOvr}</div>
              <div className="text-[9px] text-zinc-500 font-bold">قوة التشكيلة</div>
            </button>

            <button
              onClick={() => {
                sounds.playTap();
                onOpenProfile?.();
              }}
              className="bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 rounded-2xl p-2.5 text-center transition-all shadow-[0_4px_0_rgba(0,0,0,0.6)] active:translate-y-0.5"
            >
              <Trophy className="w-4 h-4 text-amber-400 mx-auto mb-0.5" />
              <div className="font-chakra text-sm font-black text-white tabular-nums">
                {profile.matchesWon || 0}
              </div>
              <div className="text-[9px] text-zinc-500 font-bold">الانتصارات</div>
            </button>
          </div>
        </div>

        {/* Rank Progress Strip */}
        <div className="bg-zinc-950/80 border border-zinc-800/90 rounded-2xl px-4 py-2.5 flex items-center justify-between gap-4">
          <div className="text-[11px] font-bold text-zinc-300 shrink-0">
            رتبتك: <strong className="text-amber-400">{rankInfo.titleAr}</strong> ({userRp} /{' '}
            {rankInfo.nextPoints} RP)
          </div>
          <div className="flex-1 h-2 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-400 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <button
            onClick={() => {
              sounds.playTap();
              onNavigate('ranking');
            }}
            className="text-[11px] font-black text-amber-400 hover:underline shrink-0"
          >
            الترتيب العام ←
          </button>
        </div>
      </div>

      {/* 2. HERO BANNER & QUICK PLAY 3D ACTIONS */}
      <div className="relative rounded-3xl overflow-hidden border-2 border-amber-500/40 shadow-[0_20px_55px_rgba(0,0,0,0.9)]">
        <img
          src={heroBanner}
          alt="GOALIX Arena"
          className="w-full h-68 sm:h-76 object-cover object-center brightness-75"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/65 to-transparent" />

        <div className="absolute inset-0 p-5 sm:p-7 flex flex-col justify-end">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold w-fit mb-2 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" />
            <span>QUICK PLAY — اللعب السريع والمباشر</span>
          </div>
          <h2 className="font-chakra text-2xl sm:text-4xl font-black text-white leading-tight mb-1.5 drop-shadow-lg">
            اصنع مجدك الكروي في <span className="text-amber-400">GOALIX</span>
          </h2>
          <p className="text-zinc-200 text-xs sm:text-sm max-w-xl mb-4 leading-relaxed">
            خض تحديات SANTRA بلوحها التكتيكي وصناديقها ثلاثية الأبعاد، أو نافس في STAT ARENA وMEMORY XI ومحاكي الـ 90 دقيقة!
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <GoldButton onClick={() => onStartGame('santra')} size="md">
              <span className="flex items-center justify-center gap-1.5 text-xs">
                <Package className="w-4 h-4" />
                سانترا 3D
              </span>
            </GoldButton>
            <GoldButton onClick={() => onStartGame('stat_arena')} size="md" variant="secondary">
              <span className="flex items-center justify-center gap-1.5 text-xs text-amber-300">
                <Play className="w-4 h-4 fill-current" />
                STAT ARENA
              </span>
            </GoldButton>
            <GoldButton onClick={() => onStartGame('memory_xi')} size="md" variant="secondary">
              <span className="flex items-center justify-center gap-1.5 text-xs text-sky-300">
                <Brain className="w-4 h-4" />
                MEMORY XI
              </span>
            </GoldButton>
            <GoldButton onClick={() => onStartGame('squad_match')} size="md" variant="secondary">
              <span className="flex items-center justify-center gap-1.5 text-xs text-emerald-300">
                <Swords className="w-4 h-4" />
                محاكي 90 د
              </span>
            </GoldButton>
          </div>
        </div>
      </div>

      {/* 3. ORNATE PACKS, 3D SANTRA CHESTS, TOP-UP STORE & OWNER PANEL ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Ornate 2D Packs Card */}
        <button
          onClick={() => {
            sounds.playTap();
            if (onOpenStoreTab) onOpenStoreTab('packs');
            else onNavigate('store');
          }}
          className="text-right rounded-3xl bg-gradient-to-b from-zinc-900 to-zinc-950 border-2 border-amber-500/45 hover:border-amber-400 p-4 flex items-center justify-between gap-3 shadow-[0_8px_0_rgba(0,0,0,0.6)] active:translate-y-1 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shrink-0">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-black text-white">الباكات المزخرفة 2D</div>
              <div className="text-[11px] text-amber-400 font-bold mt-0.5">
                {unopenedPacksCount > 0
                  ? `${unopenedPacksCount} باك محفوظ في خزينتك`
                  : 'باكات ملكية مزخرفة'}
              </div>
            </div>
          </div>
        </button>

        {/* Top-Up Store & Owner Recharge Card */}
        <button
          onClick={() => {
            sounds.playTap();
            if (onOpenStoreTab) onOpenStoreTab('owner');
            else onNavigate('store');
          }}
          className="text-right rounded-3xl bg-gradient-to-b from-amber-500/15 via-zinc-900 to-zinc-950 border-2 border-amber-400/60 hover:border-amber-300 p-4 flex items-center justify-between gap-3 shadow-[0_8px_0_rgba(0,0,0,0.6)] active:translate-y-1 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-400/20 border border-amber-400/50 flex items-center justify-center text-amber-300 shrink-0">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-black text-white">متجر الشحن ولوحة المالك</div>
              <div className="text-[11px] text-emerald-400 font-bold mt-0.5">
                شحن بالأيدي (ID) والعداد والباقات
              </div>
            </div>
          </div>
          <CreditCard className="w-4 h-4 text-amber-300 shrink-0" />
        </button>

        {/* 3D Santra Chests Card */}
        <button
          onClick={() => {
            sounds.playTap();
            if (onOpenStoreTab) onOpenStoreTab('chests');
            else onNavigate('store');
          }}
          className="text-right rounded-3xl bg-gradient-to-b from-zinc-900 to-zinc-950 border-2 border-zinc-800 hover:border-amber-400 p-4 flex items-center justify-between gap-3 shadow-[0_8px_0_rgba(0,0,0,0.6)] active:translate-y-1 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-black text-white">صناديق سانترا 3D</div>
              <div className="text-[11px] text-zinc-400 font-bold mt-0.5">
                {unopenedChestsCount > 0
                  ? `لديك ${unopenedChestsCount} صندوق جاهز!`
                  : 'افتح صناديق 3D المعدنية'}
              </div>
            </div>
          </div>
          {unopenedChestsCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-zinc-950 font-black text-xs">
              {unopenedChestsCount}
            </span>
          )}
        </button>

        {/* Claimable Rewards Card */}
        <button
          onClick={() => {
            sounds.playTap();
            if (onOpenStoreTab) onOpenStoreTab('rewards');
            else onNavigate('store');
          }}
          className="text-right rounded-3xl bg-gradient-to-b from-zinc-900 to-zinc-950 border-2 border-zinc-800 hover:border-emerald-500/50 p-4 flex items-center justify-between gap-3 shadow-[0_8px_0_rgba(0,0,0,0.6)] active:translate-y-1 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-black text-white">المكافآت والإنجازات</div>
              <div className="text-[11px] text-emerald-400 font-bold mt-0.5">
                {claimableRewardsCount > 0
                  ? `${claimableRewardsCount} مكافأة جاهزة للاستلام!`
                  : 'مكافأة الدخول والمهام'}
              </div>
            </div>
          </div>
          {claimableRewardsCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-400 text-zinc-950 font-black text-xs animate-bounce">
              {claimableRewardsCount}
            </span>
          )}
        </button>
      </div>

      {/* 4. COMPETITIVE GAMES SHOWCASE */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span>الألعاب التنافسية (GAMES)</span>
          </h3>
          <button
            onClick={() => {
              sounds.playTap();
              onNavigate('games');
            }}
            className="text-xs font-black text-amber-400 hover:text-amber-300"
          >
            عرض تفاصيل جميع الألعاب ←
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* SANTRA 3D Card */}
          <div
            onClick={() => {
              sounds.playTap();
              onStartGame('santra');
            }}
            className="group relative rounded-3xl overflow-hidden border-2 border-amber-500/35 bg-zinc-900 cursor-pointer hover:border-amber-400 transition-all shadow-xl"
          >
            <img
              src={santraCover}
              alt="SANTRA 3D"
              className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-500 brightness-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/45 to-transparent" />
            <div className="absolute bottom-0 inset-x-0 p-4">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-zinc-950 font-black text-[10px]">
                SANTRA 3D BOARD
              </span>
              <h4 className="text-base font-black text-white mt-1">سانترا — اللوح التكتيكي وصناديق 3D</h4>
              <p className="text-[11px] text-zinc-300 mt-0.5">نرد تكتيكي • ألغاز • صناديق 3D • محاكاة</p>
            </div>
          </div>

          {/* STAT ARENA Card */}
          <div
            onClick={() => {
              sounds.playTap();
              onStartGame('stat_arena');
            }}
            className="group relative rounded-3xl overflow-hidden border-2 border-amber-500/35 bg-zinc-900 cursor-pointer hover:border-amber-400 transition-all shadow-xl"
          >
            <img
              src={statArenaCover}
              alt="STAT ARENA"
              className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-500 brightness-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/45 to-transparent" />
            <div className="absolute bottom-0 inset-x-0 p-4">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-zinc-950 font-black text-[10px]">
                STAT ARENA
              </span>
              <h4 className="text-base font-black text-white mt-1">ساحة الإحصائيات التنافسية</h4>
              <p className="text-[11px] text-zinc-300 mt-0.5">ضد الذكاء AI أو لاعبين • خطف مراكز</p>
            </div>
          </div>

          {/* MEMORY XI Card */}
          <div
            onClick={() => {
              sounds.playTap();
              onStartGame('memory_xi');
            }}
            className="group relative rounded-3xl overflow-hidden border-2 border-amber-500/35 bg-zinc-900 cursor-pointer hover:border-amber-400 transition-all shadow-xl"
          >
            <img
              src={memoryXICover}
              alt="MEMORY XI"
              className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-500 brightness-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/45 to-transparent" />
            <div className="absolute bottom-0 inset-x-0 p-4">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-zinc-950 font-black text-[10px]">
                MEMORY XI
              </span>
              <h4 className="text-base font-black text-white mt-1">ذاكرة التشكيلة الفوتوغرافية</h4>
              <p className="text-[11px] text-zinc-300 mt-0.5">30 ثانية حفظ • 60 ثانية استرجاع</p>
            </div>
          </div>
        </div>
      </div>

      {/* 5. ROOMS & PACKS VAULT BANNERS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Online Rooms Card */}
        <div
          onClick={() => {
            sounds.playTap();
            onNavigate('rooms');
          }}
          className="rounded-3xl bg-gradient-to-br from-amber-500/20 via-zinc-900 to-zinc-950 border-2 border-amber-500/40 p-5 flex items-center justify-between gap-4 cursor-pointer hover:border-amber-400 transition-all shadow-xl"
        >
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-amber-400 text-xs font-black">
              <Globe className="w-4 h-4" />
              <span>غرف اللعب الجماعي (ROOMS)</span>
            </div>
            <h4 className="text-lg font-black text-white">أنشئ غرفة أو انضم بالكود</h4>
            <p className="text-xs text-zinc-400">
              يدعم اللعب مع الأصدقاء أو إضافة منافس ذكي داخل الغرفة فورًا!
            </p>
          </div>
          <GoldButton size="sm" className="shrink-0">
            دخول الغرف
          </GoldButton>
        </div>

        {/* Store & Vault Banner */}
        <div
          onClick={() => {
            sounds.playTap();
            onNavigate('store');
          }}
          className="relative rounded-3xl overflow-hidden border-2 border-zinc-800 hover:border-amber-500/40 cursor-pointer transition-all shadow-xl min-h-[124px] flex items-center"
        >
          <img
            src={packShowcase}
            alt="Packs Vault"
            className="absolute inset-0 w-full h-full object-cover brightness-40"
          />
          <div className="relative z-10 p-5 w-full flex items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-xs font-black text-amber-400">PACKS & CHESTS VAULT</div>
              <h4 className="text-lg font-black text-white">افتح باكات الأساطير وصناديق 3D</h4>
              <p className="text-xs text-zinc-300">عزز تشكيلتك بنجوم النخبة والأساطير (ICONS)</p>
            </div>
            <GoldButton size="sm" className="shrink-0">
              المتجر
            </GoldButton>
          </div>
        </div>
      </div>

      {/* 6. RECENT ACTIVITY FEED */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-5 space-y-3 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-amber-400" />
            <span>النشاط الأخير في حسابك (RECENT ACTIVITY)</span>
          </h3>
          <span className="text-[11px] text-zinc-500 font-bold">محفوظ تلقائيًا</span>
        </div>

        {recentActivity.length === 0 ? (
          <div className="text-xs text-zinc-500 py-4 text-center">
            لا يوجد نشاط مسجل بعد — ابدأ أول مباراة أو افتح باك الآن!
          </div>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto pl-1">
            {recentActivity.slice(0, 8).map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-2xl bg-zinc-950/90 border border-zinc-800/80 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                      item.type === 'match'
                        ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                        : item.type === 'chest'
                        ? 'bg-purple-500/15 border-purple-500/30 text-purple-400'
                        : item.type === 'pack'
                        ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                        : 'bg-sky-500/15 border-sky-500/30 text-sky-400'
                    }`}
                  >
                    {item.type === 'match' && <Trophy className="w-4 h-4" />}
                    {item.type === 'chest' && <Package className="w-4 h-4" />}
                    {item.type === 'pack' && <ShoppingBag className="w-4 h-4" />}
                    {item.type === 'reward' && <Gift className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-black text-white truncate">{item.titleAr}</div>
                    <div className="text-[11px] text-zinc-400 truncate">{item.subtitleAr}</div>
                  </div>
                </div>

                <div className="text-left shrink-0">
                  {item.coinsDelta !== undefined && item.coinsDelta !== 0 && (
                    <div
                      className={`font-chakra text-xs font-black tabular-nums ${
                        item.coinsDelta > 0 ? 'text-amber-400' : 'text-rose-400'
                      }`}
                    >
                      {item.coinsDelta > 0 ? `+${item.coinsDelta}` : item.coinsDelta} كوينز
                    </div>
                  )}
                  {item.rankPointsDelta !== undefined && item.rankPointsDelta > 0 && (
                    <div className="font-chakra text-[11px] font-black text-emerald-400 tabular-nums">
                      +{item.rankPointsDelta} RP
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
