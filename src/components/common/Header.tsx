import React, { useState } from 'react';
import { Coins, Volume2, VolumeX, User, Wifi } from 'lucide-react';
import { sounds } from '../../services/audio';
import { UserProfile } from '../../types/game';

interface HeaderProps {
  userProfile: UserProfile;
  onOpenProfile: () => void;
  onOpenStore: () => void;
  onOpenRooms: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  userProfile,
  onOpenProfile,
  onOpenStore,
  onOpenRooms
}) => {
  const [soundOn, setSoundOn] = useState(sounds.isEnabled());

  const handleToggleSound = () => {
    const next = sounds.toggleSound();
    setSoundOn(next);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0a0b0e]/95 backdrop-blur-md border-b border-zinc-800/80 px-4 py-2.5 flex items-center justify-between">
      {/* Zone 1: Brand Zone */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 p-[1px] flex items-center justify-center shadow-[0_2px_8px_rgba(212,175,55,0.3)]">
            <div className="w-full h-full bg-zinc-950 rounded-[7px] flex items-center justify-center font-chakra font-black text-amber-400 text-sm tracking-tighter">
              GX
            </div>
          </div>
          <span className="font-chakra font-black text-lg tracking-wider bg-gradient-to-r from-white via-zinc-100 to-amber-300 bg-clip-text text-transparent">
            GOALIX
          </span>
        </div>
      </div>

      {/* Zone 2: Actions & Balance */}
      <div className="flex items-center gap-2">
        {/* Rooms Shortcut Button */}
        <button
          onClick={onOpenRooms}
          className="flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-zinc-900 border border-amber-500/30 text-amber-300 text-xs font-tajawal hover:bg-zinc-800 active:translate-y-0.5 transition-all"
          title="غرف الأونلاين"
        >
          <Wifi className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden xs:inline font-medium">أونلاين</span>
        </button>

        {/* Coins Badge (Clickable to Store) */}
        <button
          onClick={onOpenStore}
          className="flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-amber-950/40 border border-amber-500/40 hover:border-amber-400/80 active:translate-y-0.5 transition-all text-amber-300 font-chakra font-bold text-xs"
          title="متجر الكوينز"
        >
          <Coins className="w-3.5 h-3.5 text-amber-400" />
          <span className="tabular-nums">{userProfile.coins}</span>
        </button>

        {/* Sound Toggle */}
        <button
          onClick={handleToggleSound}
          className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-zinc-200 active:scale-95 transition-all"
          title={soundOn ? 'كتم الصوت' : 'تشغيل الصوت'}
        >
          {soundOn ? <Volume2 className="w-4 h-4 text-amber-400/80" /> : <VolumeX className="w-4 h-4 text-zinc-500" />}
        </button>

        {/* Profile Avatar */}
        <button
          onClick={onOpenProfile}
          className="w-8 h-8 rounded-lg bg-zinc-800 border border-amber-500/30 overflow-hidden flex items-center justify-center hover:border-amber-400 transition-all active:scale-95"
          title="الملف الشخصي"
        >
          {userProfile.avatar ? (
            <img src={userProfile.avatar} alt={userProfile.username} className="w-full h-full object-cover" />
          ) : (
            <User className="w-4 h-4 text-amber-300" />
          )}
        </button>
      </div>
    </header>
  );
};
