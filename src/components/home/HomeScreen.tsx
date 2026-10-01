import React from 'react';
import { UserProfile, Player } from '../../types/game';
import { getUserSquad, getUserCollection } from '../../services/storage';
import { calculateTeamRatings } from '../games/simulation/MatchEngine';
import { GoldButton } from '../common/GoldButton';
import { sounds } from '../../services/audio';
import { 
  Play, 
  Gamepad2, 
  ShoppingBag, 
  Users, 
  Shield, 
  Trophy, 
  Sparkles, 
  ArrowLeft, 
  Wifi,
  Coins
} from 'lucide-react';

interface HomeScreenProps {
  userProfile: UserProfile;
  onNavigateTab: (tab: 'games' | 'squad' | 'store' | 'ranking' | 'rooms') => void;
  onSelectGame: (gameId: 'stat_arena' | 'santra') => void;
  onOpenOnlineRooms: () => void;
  onSelectPlayer: (player: Player) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  userProfile,
  onNavigateTab,
  onSelectGame,
  onOpenOnlineRooms,
  onSelectPlayer
}) => {
  const squad = getUserSquad();
  const collection = getUserCollection();
  const activePlayers = squad.filter((p): p is Player => p !== null);
  const teamRatings = calculateTeamRatings(activePlayers);

  // Marquee players in collection to showcase
  const showcasePlayers = collection.slice(0, 4);

  return (
    <div className="pb-24 pt-2 px-4 max-w-md mx-auto space-y-4 select-none">
      {/* ================= 1. HERO BANNER ================= */}
      <div className="relative rounded-2xl overflow-hidden border border-amber-500/40 shadow-2xl aspect-[16/9]">
        <img
          src="/src/assets/images/goalix_hero_banner_1790797297425.jpg"
          alt="GOALIX Stadium"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent flex flex-col justify-end p-4">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-[10px] font-chakra font-bold text-amber-300 uppercase tracking-widest">
              SEASON 1 · ULTIMATE EXPEDITION
            </span>
          </div>
          <h2 className="text-xl font-black font-tajawal text-white">
            مرحباً بك في GOALIX
          </h2>
          <p className="text-xs text-zinc-300 font-tajawal mt-0.5 line-clamp-1">
            منصة ألعاب وتحديات كرة القدم التنافسية المتكاملة
          </p>
        </div>
      </div>

      {/* ================= 2. QUICK SHORTCUT TILES ================= */}
      <div className="grid grid-cols-2 gap-3">
        {/* Play Games */}
        <div
          onClick={() => {
            sounds.playTap();
            onNavigateTab('games');
          }}
          className="rounded-xl p-3 bg-zinc-900/90 border border-zinc-800 hover:border-amber-400/50 cursor-pointer active:scale-98 transition-all flex items-center gap-3 shadow-md"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
            <Gamepad2 className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-zinc-100 font-tajawal">الألعاب التنافسية</h4>
            <span className="text-[10px] text-zinc-400 font-tajawal">STAT ARENA & SANTRA</span>
          </div>
        </div>

        {/* Online Rooms */}
        <div
          onClick={() => {
            sounds.playTap();
            onOpenOnlineRooms();
          }}
          className="rounded-xl p-3 bg-zinc-900/90 border border-zinc-800 hover:border-amber-400/50 cursor-pointer active:scale-98 transition-all flex items-center gap-3 shadow-md"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
            <Wifi className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-zinc-100 font-tajawal">غرف الأونلاين</h4>
            <span className="text-[10px] text-zinc-400 font-tajawal">تحديات مباشرة برمز</span>
          </div>
        </div>
      </div>

      {/* ================= LEAGUE RANKING SHORTCUT ================= */}
      <div 
        onClick={() => {
          sounds.playButtonClick();
          onNavigateTab('ranking');
        }}
        className="bg-gradient-to-r from-amber-950/40 via-zinc-900 to-zinc-950 rounded-2xl p-3.5 border border-amber-500/30 flex items-center justify-between cursor-pointer hover:border-amber-400/60 active:scale-98 transition-all shadow-lg"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
            <Trophy className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="font-bold text-xs text-white font-tajawal">جدول ترتيب دوري الغرف</h4>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[9px] text-emerald-400 font-bold">مباشر</span>
            </div>
            <p className="text-[10px] text-zinc-400 font-tajawal">الفوز = 3 نقاط · التعادل = نقطة واحدة</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs text-amber-300 font-bold font-tajawal">
          <span>الترتيب</span>
          <ArrowLeft className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* ================= 3. MY SQUAD PREVIEW ================= */}
      <div className="bg-zinc-900/90 rounded-2xl p-4 border border-zinc-800 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-xs text-zinc-100 font-tajawal">
              معاينة تشكيلتي الأساسية
            </h3>
          </div>

          <button
            onClick={() => onNavigateTab('squad')}
            className="flex items-center gap-1 text-[11px] text-amber-400 font-tajawal hover:text-amber-300"
          >
            <span>إدارة التشكيلة</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Squad Quick Stats */}
        <div className="flex items-center justify-between bg-black/40 p-3 rounded-xl border border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 p-[1px] flex items-center justify-center shadow">
              <div className="w-full h-full bg-zinc-950 rounded-[11px] flex flex-col items-center justify-center font-chakra">
                <span className="text-[8px] text-zinc-400">OVR</span>
                <span className="font-black text-amber-400 text-sm leading-none">
                  {teamRatings.ovrAvg}
                </span>
              </div>
            </div>

            <div>
              <p className="font-bold text-xs text-zinc-200 font-tajawal">{userProfile.username}</p>
              <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-chakra mt-0.5">
                <span>ATT: {teamRatings.attRating}</span>
                <span>·</span>
                <span>MID: {teamRatings.midRating}</span>
                <span>·</span>
                <span>DEF: {teamRatings.defRating}</span>
              </div>
            </div>
          </div>

          <GoldButton
            onClick={() => onNavigateTab('squad')}
            size="sm"
          >
            تعديل
          </GoldButton>
        </div>
      </div>

      {/* ================= 4. FEATURED GAME: STAT ARENA ================= */}
      <div className="rounded-2xl border border-amber-500/40 bg-zinc-900/90 overflow-hidden shadow-xl space-y-3">
        <div className="relative aspect-[16/8] w-full overflow-hidden">
          <img
            src="/src/assets/images/stat_arena_cover_1790797310047.jpg"
            alt="STAT ARENA"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent flex flex-col justify-end p-3">
            <span className="text-[10px] font-chakra font-bold text-amber-400 tracking-wider">
              FEATURED CHALLENGE
            </span>
            <h4 className="font-chakra font-black text-lg text-white">
              STAT ARENA
            </h4>
          </div>
        </div>

        <div className="p-3 pt-0 space-y-2">
          <p className="text-xs text-zinc-400 font-tajawal leading-relaxed">
            تحدي التوقعات الإحصائية الكروية. توقع الأرقام الصحيحة وحقق أفضلية (1-0) قبل انطلاق محاكاة المباراة التكتيكية!
          </p>

          <GoldButton
            onClick={() => onSelectGame('stat_arena')}
            fullWidth
            size="md"
          >
            <Play className="w-4 h-4 fill-black" />
            بدء اللعب في STAT ARENA
          </GoldButton>
        </div>
      </div>

      {/* ================= 5. SECONDARY GAME: SANTRA ================= */}
      <div className="rounded-2xl border border-zinc-800 hover:border-amber-500/30 bg-zinc-900/90 overflow-hidden shadow-xl space-y-3">
        <div className="relative aspect-[16/8] w-full overflow-hidden">
          <img
            src="/src/assets/images/santra_mystery_cover_1790797320678.jpg"
            alt="SANTRA"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent flex flex-col justify-end p-3">
            <span className="text-[10px] font-chakra font-bold text-amber-400 tracking-wider">
              MYSTERY BOXES
            </span>
            <h4 className="font-chakra font-black text-lg text-white">
              SANTRA
            </h4>
          </div>
        </div>

        <div className="p-3 pt-0 space-y-2">
          <p className="text-xs text-zinc-400 font-tajawal leading-relaxed">
            درافت الصناديق الغامضة الأربعة. اختر صندوقك لتكتشف ناديك وتحصل على لاعب عشوائي لمركز الجولة!
          </p>

          <GoldButton
            onClick={() => onSelectGame('santra')}
            fullWidth
            size="md"
          >
            <Play className="w-4 h-4 fill-black" />
            بدء اللعب في SANTRA
          </GoldButton>
        </div>
      </div>

      {/* ================= 6. STORE SHORTCUT ================= */}
      <div className="bg-gradient-to-r from-[#1c1607] via-zinc-900 to-zinc-950 rounded-2xl p-4 border border-amber-500/30 flex items-center justify-between">
        <div className="space-y-0.5">
          <span className="text-[10px] font-chakra font-bold text-amber-400">
            CINEMATIC WALKOUTS
          </span>
          <h4 className="text-sm font-bold font-tajawal text-white">
            متجر حزم البطاقات الكروية
          </h4>
          <p className="text-[11px] text-zinc-400 font-tajawal">افتح حزم الأسبوع ونخبة العالم والأساطير</p>
        </div>

        <GoldButton
          onClick={() => onNavigateTab('store')}
          size="sm"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          المتجر
        </GoldButton>
      </div>

      {/* ================= 7. RECENT STARS IN COLLECTION ================= */}
      <div className="bg-zinc-900/90 rounded-2xl p-4 border border-zinc-800 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-amber-400 font-tajawal flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" />
            نجوم مجموعتك المميزون
          </h4>
          <span className="text-[10px] text-zinc-400 font-tajawal">{collection.length} لاعب متاح</span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {showcasePlayers.map(p => (
            <div
              key={p.id}
              onClick={() => onSelectPlayer(p)}
              className="p-2 rounded-xl bg-black/50 border border-zinc-800 hover:border-amber-400/60 active:scale-95 transition-all text-center cursor-pointer flex flex-col items-center"
            >
              <div className="w-10 h-10 rounded-full overflow-hidden border border-amber-500/40 bg-zinc-800 mb-1 shadow">
                <img
                  src={p.image || `/players/${p.id}.jpg`}
                  alt={p.name}
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <span className="text-[9px] font-chakra font-bold text-amber-400">
                {p.ovr} OVR
              </span>
              <p className="text-[10px] font-bold text-zinc-200 truncate w-full mt-0.5">{p.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ================= 8. DEVELOPER ATTRIBUTION ================= */}
      <div className="bg-gradient-to-b from-zinc-900/90 to-black rounded-2xl p-4 border border-amber-500/30 text-center space-y-1.5 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />
        <div className="flex items-center justify-center gap-1.5 text-amber-400">
          <Shield className="w-3.5 h-3.5" />
          <span className="text-[11px] font-bold font-tajawal tracking-wide">
            فكرة وتطوير وإشراف المطور
          </span>
        </div>
        <h3 className="text-base font-black font-tajawal text-white tracking-wider">
          محمود أحمد سلامة
        </h3>
        <p className="text-[10px] text-zinc-400 font-chakra dir-ltr">
          Mahmoud Ahmed Salama · GOALIX Lead Developer
        </p>
        <p className="text-[10px] text-zinc-500 font-tajawal pt-1">
          منصة كرة القدم التنافسية الذكية © 2026 · جميع الحقوق محفوظة
        </p>
      </div>
    </div>
  );
};
