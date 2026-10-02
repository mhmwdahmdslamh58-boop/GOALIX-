import React, { useState } from 'react';
import { UserProfile } from '../../types/game';
import { GoldButton } from '../common/GoldButton';
import { sounds } from '../../services/audio';
import { saveUserProfile, getRankTierInfo, getUserCollection, getFormattedAccountId } from '../../services/storage';
import { getAllPlayers } from '../../data/players';
import { 
  X, Trophy, Shield, Award, Edit3, Check, Sparkles, Coins, 
  Package, Settings, Layers, Flame, Copy
} from 'lucide-react';

interface ProfileModalProps {
  profile: UserProfile;
  onClose: () => void;
  onUpdateProfile: (newProfile: UserProfile) => void;
  onOpenSettings?: () => void;
  onNavigate?: (tab: 'home' | 'games' | 'rooms' | 'squad' | 'store' | 'collection' | 'ranking') => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  profile,
  onClose,
  onUpdateProfile,
  onOpenSettings,
  onNavigate,
}) => {
  const [username, setUsername] = useState(profile.username);
  const [isEditing, setIsEditing] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const accountId = getFormattedAccountId(profile);

  const handleCopyAccountId = () => {
    navigator.clipboard.writeText(accountId);
    sounds.playTap();
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    sounds.playReveal();
    const updated: UserProfile = {
      ...profile,
      username: username.trim(),
    };
    saveUserProfile(updated);
    onUpdateProfile(updated);
    setIsEditing(false);
  };

  const totalPlayersCount = getAllPlayers().length;
  const ownedCount = getUserCollection().length;
  const winRate = profile.matchesPlayed > 0
    ? Math.round(((profile.matchesWon || 0) / profile.matchesPlayed) * 100)
    : 0;
  const userRp = profile.rankPoints ?? 0;
  const rankInfo = getRankTierInfo(userRp);
  const progressPercent = Math.min(
    100,
    Math.round(((userRp - rankInfo.minPoints) / Math.max(1, rankInfo.nextPoints - rankInfo.minPoints)) * 100)
  );
  const chestsCount = profile.santraChests?.length || 0;
  const packsCount = profile.ownedPacks?.length || 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in">
      <div className="relative w-full max-w-md bg-zinc-900 border border-amber-500/35 rounded-3xl p-6 shadow-[0_25px_70px_rgba(0,0,0,0.95)] max-h-[92vh] overflow-y-auto">
        <button
          onClick={() => {
            sounds.playTap();
            onClose();
          }}
          className="absolute top-4 left-4 w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Avatar & Manager Header */}
        <div className="text-center mb-5">
          <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-300 via-yellow-500 to-amber-700 p-[2px] mx-auto mb-3 shadow-[0_0_30px_rgba(245,158,11,0.35)]">
            <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center">
              <span className="font-chakra text-3xl font-black text-amber-400">
                {(profile.username || 'G').charAt(0)}
              </span>
            </div>
            <div className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-lg bg-zinc-950 border border-amber-500/50 text-xs shadow">
              {rankInfo.badgeIcon}
            </div>
          </div>

          {!isEditing ? (
            <div>
              <div className="flex items-center justify-center gap-2">
                <h2 className="text-xl font-black text-white">{profile.username}</h2>
                <button
                  onClick={() => {
                    sounds.playTap();
                    setIsEditing(true);
                  }}
                  className="text-zinc-400 hover:text-amber-400 p-1 rounded-lg bg-zinc-800/70"
                  title="تعديل الاسم"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold mt-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{rankInfo.titleAr} ({rankInfo.titleEn})</span>
              </div>
              <div className="mt-2 flex items-center justify-center gap-2">
                <span className="px-3 py-1 rounded-xl bg-zinc-950 border border-amber-500/40 font-chakra text-xs font-black text-amber-300">
                  ID: {accountId}
                </span>
                <button
                  onClick={handleCopyAccountId}
                  className="px-2.5 py-1 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-[11px] font-bold text-zinc-200 flex items-center gap-1"
                >
                  {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId ? 'تم النسخ' : 'نسخ الأيدي'}</span>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-2.5 mt-3 text-right bg-zinc-950 p-3.5 rounded-2xl border border-zinc-800">
              <div>
                <label className="block text-[11px] font-bold text-zinc-400 mb-1">اسم المدير الفني</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  maxLength={20}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm font-bold focus:outline-none focus:border-amber-500"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <GoldButton type="submit" fullWidth size="sm">
                  <Check className="w-4 h-4" />
                  حفظ التعديلات
                </GoldButton>
                <GoldButton type="button" variant="dark" size="sm" onClick={() => setIsEditing(false)}>
                  إلغاء
                </GoldButton>
              </div>
            </form>
          )}
        </div>

        {/* Rank Card & Progress */}
        <div className="bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 border border-amber-500/30 rounded-2xl p-4 mb-4 shadow-inner">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{rankInfo.badgeIcon}</span>
              <div>
                <div className="text-[10px] font-bold text-zinc-400 uppercase">الرتبة التنافسية الحالية</div>
                <div className="text-base font-black text-amber-400">{rankInfo.titleAr}</div>
              </div>
            </div>
            <div className="text-left">
              <div className="text-[10px] font-bold text-zinc-400">نقاط التصنيف</div>
              <div className="font-chakra text-xl font-black text-emerald-400">
                {userRp} <span className="text-xs">RP</span>
              </div>
            </div>
          </div>

          <div className="w-full h-2.5 bg-zinc-800 rounded-full overflow-hidden p-0.5 border border-zinc-700">
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-zinc-400 font-bold mt-1.5">
            <span>الفوز = +3 RP | التعادل = +1 RP</span>
            <span>الرتبة القادمة عند {rankInfo.nextPoints} RP</span>
          </div>
        </div>

        {/* Career Record Grid */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <div className="bg-zinc-950/90 border border-zinc-800 rounded-2xl p-2.5 text-center">
            <Trophy className="w-4 h-4 text-amber-400 mx-auto mb-1" />
            <div className="font-chakra text-lg font-black text-white">{profile.matchesWon || 0}</div>
            <div className="text-[10px] text-zinc-400 font-bold">انتصار</div>
          </div>
          <div className="bg-zinc-950/90 border border-zinc-800 rounded-2xl p-2.5 text-center">
            <Shield className="w-4 h-4 text-sky-400 mx-auto mb-1" />
            <div className="font-chakra text-lg font-black text-white">{profile.matchesDrawn || 0}</div>
            <div className="text-[10px] text-zinc-400 font-bold">تعادل</div>
          </div>
          <div className="bg-zinc-950/90 border border-zinc-800 rounded-2xl p-2.5 text-center">
            <Flame className="w-4 h-4 text-rose-400 mx-auto mb-1" />
            <div className="font-chakra text-lg font-black text-white">{profile.matchesLost || 0}</div>
            <div className="text-[10px] text-zinc-400 font-bold">خسارة</div>
          </div>
          <div className="bg-zinc-950/90 border border-zinc-800 rounded-2xl p-2.5 text-center">
            <Award className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
            <div className="font-chakra text-lg font-black text-emerald-400">{winRate}%</div>
            <div className="text-[10px] text-zinc-400 font-bold">نسبة الفوز</div>
          </div>
        </div>

        {/* Economy & Inventory Summary */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          <div className="bg-zinc-950 border border-amber-500/20 rounded-xl p-2.5 text-center">
            <div className="flex items-center justify-center gap-1 text-amber-400 text-xs font-black">
              <Coins className="w-3.5 h-3.5" />
              {profile.coins.toLocaleString()}
            </div>
            <div className="text-[10px] text-zinc-500 font-bold mt-0.5">رصيد الكوينز</div>
          </div>
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-center">
            <div className="flex items-center justify-center gap-1 text-white text-xs font-black">
              <Layers className="w-3.5 h-3.5 text-sky-400" />
              {ownedCount}/{totalPlayersCount}
            </div>
            <div className="text-[10px] text-zinc-500 font-bold mt-0.5">بطاقات مملوكة</div>
          </div>
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-center">
            <div className="flex items-center justify-center gap-1 text-emerald-400 text-xs font-black">
              <Package className="w-3.5 h-3.5" />
              {chestsCount + packsCount}
            </div>
            <div className="text-[10px] text-zinc-500 font-bold mt-0.5">صناديق وباكات</div>
          </div>
        </div>

        {/* Action Shortcuts */}
        <div className="grid grid-cols-2 gap-2.5 mb-3">
          {onNavigate && (
            <button
              onClick={() => {
                sounds.playTap();
                onClose();
                onNavigate('store');
              }}
              className="py-2.5 px-3 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-amber-500/30 text-amber-300 font-black text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <Package className="w-4 h-4" />
              خزينة الباكات والمكافآت
            </button>
          )}
          {onOpenSettings && (
            <button
              onClick={() => {
                sounds.playTap();
                onClose();
                onOpenSettings();
              }}
              className="py-2.5 px-3 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 font-black text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <Settings className="w-4 h-4 text-amber-400" />
              الإعدادات وإضافة لاعبين
            </button>
          )}
        </div>

        <GoldButton variant="dark" fullWidth onClick={onClose}>
          إغلاق
        </GoldButton>
      </div>
    </div>
  );
};
