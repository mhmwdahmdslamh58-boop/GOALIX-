import React, { useState } from 'react';
import { UserProfile } from '../../types/game';
import { saveUserProfile } from '../../services/storage';
import { GoldButton } from '../common/GoldButton';
import { sounds } from '../../services/audio';
import { X, Trophy, Check, UserCheck, Shield } from 'lucide-react';

interface ProfileModalProps {
  userProfile: UserProfile;
  onUpdate: (updated: UserProfile) => void;
  onClose: () => void;
  onReplaySplash?: () => void;
  onOpenAdmin?: () => void;
  onOpenAuth?: () => void;
}

const AVAILABLE_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80'
];

export const ProfileModal: React.FC<ProfileModalProps> = ({
  userProfile,
  onUpdate,
  onClose,
  onReplaySplash,
  onOpenAdmin,
  onOpenAuth
}) => {
  const [username, setUsername] = useState(userProfile.username);
  const [selectedAvatar, setSelectedAvatar] = useState(userProfile.avatar);
  const [isSaved, setIsSaved] = useState(false);
  const isDevAdmin = userProfile.username.includes('محمود') || userProfile.id === 'dev_mahmoud_salama';

  const winRate = userProfile.matchesPlayed > 0 
    ? Math.round((userProfile.matchesWon / userProfile.matchesPlayed) * 100) 
    : 0;

  const handleSave = () => {
    sounds.playTap();
    const updated: UserProfile = {
      ...userProfile,
      username: username.trim() || 'كابتن جواليكس',
      avatar: selectedAvatar
    };
    saveUserProfile(updated);
    onUpdate(updated);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="max-w-sm w-full bg-[#111317] border border-amber-500/40 rounded-2xl p-5 shadow-2xl relative space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
          <div className="flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-base font-tajawal text-zinc-100">
              الملف الشخصي
            </h3>
          </div>
          <button
            onClick={() => {
              sounds.playTap();
              onClose();
            }}
            className="p-1 rounded-full bg-zinc-800 text-zinc-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Avatar & Username */}
        <div className="flex flex-col items-center space-y-3">
          <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-amber-400 p-0.5 bg-zinc-800 shadow-xl">
            <img src={selectedAvatar} alt="Avatar" className="w-full h-full object-cover rounded-[14px]" />
          </div>

          <div className="flex gap-2">
            {AVAILABLE_AVATARS.map((av, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedAvatar(av)}
                className={`w-9 h-9 rounded-xl overflow-hidden border transition-all ${
                  selectedAvatar === av ? 'border-amber-400 scale-105' : 'border-zinc-700 opacity-60'
                }`}
              >
                <img src={av} alt="option" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>

          <div className="w-full">
            <label className="text-[11px] text-zinc-400 font-tajawal block mb-1">اسم المدرب:</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full bg-black/50 border border-zinc-700 rounded-xl px-3 py-2 text-xs font-bold text-zinc-200 focus:outline-none focus:border-amber-400 text-center"
            />
          </div>
        </div>

        {/* User Stats Card */}
        <div className="bg-zinc-900/90 rounded-xl p-3 border border-zinc-800 space-y-2 text-center">
          <span className="text-[11px] font-tajawal text-amber-400 font-bold block">سجل الإنجازات والمباريات</span>
          <div className="grid grid-cols-3 gap-2 font-chakra">
            <div className="bg-black/40 p-2 rounded-lg">
              <span className="text-[10px] text-zinc-400 font-tajawal block">المباريات</span>
              <span className="font-bold text-sm text-zinc-100">{userProfile.matchesPlayed}</span>
            </div>
            <div className="bg-black/40 p-2 rounded-lg">
              <span className="text-[10px] text-zinc-400 font-tajawal block">الانتصارات</span>
              <span className="font-bold text-sm text-amber-400">{userProfile.matchesWon}</span>
            </div>
            <div className="bg-black/40 p-2 rounded-lg">
              <span className="text-[10px] text-zinc-400 font-tajawal block">نسبة الفوز</span>
              <span className="font-bold text-sm text-green-400">{winRate}%</span>
            </div>
          </div>
        </div>

        {/* Developer Tribute Card */}
        <div className="bg-gradient-to-r from-amber-950/30 via-zinc-900 to-black rounded-xl p-3 border border-amber-500/30 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] font-tajawal text-amber-400 font-bold block">
              مطور ومصمم المنصة:
            </span>
            <span className="text-xs font-black text-white font-tajawal block">
              محمود أحمد سلامة
            </span>
            <span className="text-[10px] text-zinc-400 font-chakra block">
              Mahmoud Ahmed Salama
            </span>
          </div>

          {onReplaySplash && (
            <button
              onClick={() => {
                onClose();
                onReplaySplash();
              }}
              className="text-[10px] font-tajawal text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-2 py-1.5 rounded-lg transition-all active:scale-95 cursor-pointer"
            >
              عرض شاشة البداية ⚡
            </button>
          )}
        </div>

        {/* Admin & Auth Actions */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          {onOpenAuth && (
            <button
              onClick={() => {
                onClose();
                onOpenAuth();
              }}
              className="py-2 px-3 rounded-xl bg-zinc-900 border border-zinc-700 hover:border-amber-400 text-xs font-bold text-zinc-200 transition-all cursor-pointer text-center"
            >
              تبديل / تسجيل حساب 🔑
            </button>
          )}

          {isDevAdmin && onOpenAdmin && (
            <button
              onClick={() => {
                onClose();
                onOpenAdmin();
              }}
              className="py-2 px-3 rounded-xl bg-amber-500/20 border border-amber-400 hover:bg-amber-500/30 text-xs font-bold text-amber-300 transition-all cursor-pointer text-center"
            >
              غرفة الإدارة الخاصة بي 🛡️
            </button>
          )}
        </div>

        <GoldButton onClick={handleSave} fullWidth size="md">
          {isSaved ? <Check className="w-4 h-4" /> : null}
          {isSaved ? 'تم الحفظ!' : 'حفظ التغييرات'}
        </GoldButton>
      </div>
    </div>
  );
};
