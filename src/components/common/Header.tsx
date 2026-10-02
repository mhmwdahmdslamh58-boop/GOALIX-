import React from 'react';
import { UserProfile } from '../../types/game';
import { sounds } from '../../services/audio';
import { getRankTierInfo, getFormattedAccountId } from '../../services/storage';
import { Coins, Trophy, Settings, Shield } from 'lucide-react';

interface HeaderProps {
  profile: UserProfile;
  onNavigate?: (tab: 'home' | 'games' | 'rooms' | 'squad' | 'store' | 'collection' | 'ranking') => void;
  onOpenProfile?: () => void;
  onOpenSettings?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  onNavigate,
  onOpenProfile,
  onOpenSettings,
}) => {
  const rankInfo = getRankTierInfo(profile.rankPoints ?? 0);
  const unopenedCount = (profile.santraChests?.length || 0) + (profile.ownedPacks?.length || 0);
  const displayName = profile.username || 'كابتن جواليكس';
  const accountId = getFormattedAccountId(profile);

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-zinc-950/90 border-b border-amber-500/20 px-3 sm:px-4 py-2.5 shadow-[0_6px_25px_rgba(0,0,0,0.6)]">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
        {/* Brand Logo & User Profile Trigger */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              sounds.playTap();
              onNavigate?.('home');
            }}
            className="flex items-center gap-2 group text-right"
          >
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-amber-300 via-yellow-500 to-amber-700 p-[1.5px] shadow-[0_0_20px_rgba(245,158,11,0.35)] group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center">
                <Trophy className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div className="hidden xs:block">
              <h1 className="font-chakra text-lg font-black tracking-tight bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent leading-none">
                GOALIX
              </h1>
              <p className="text-[9px] text-zinc-400 font-bold tracking-widest uppercase mt-0.5">
                FOOTBALL ARENA
              </p>
            </div>
          </button>

          {/* User Profile & Rank Badge Pill */}
          <button
            onClick={() => {
              sounds.playTap();
              onOpenProfile?.();
            }}
            className="flex items-center gap-2 bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 hover:border-amber-500/40 rounded-xl px-2.5 py-1.5 transition-all"
            title="الملف الشخصي والإحصائيات"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500/25 to-zinc-900 border border-amber-500/40 flex items-center justify-center text-amber-300 font-black text-xs">
              {displayName.charAt(0)}
            </div>
            <div className="text-right">
              <div className="text-[11px] font-black text-white leading-tight max-w-[90px] sm:max-w-[130px] truncate">
                {displayName}
              </div>
              <div className="flex items-center gap-1 text-[9px] font-black text-amber-400">
                <span>{rankInfo.badgeIcon}</span>
                <span className="font-chakra text-amber-300">{accountId}</span>
                <span className="text-zinc-500">•</span>
                <span className="font-chakra text-emerald-400">{profile.rankPoints ?? 0} RP</span>
              </div>
            </div>
          </button>
        </div>

        {/* Right Controls: Squad Button, Coins, Settings */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => {
              sounds.playTap();
              onNavigate?.('squad');
            }}
            className="hidden sm:flex items-center gap-1.5 bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 hover:border-amber-500/40 px-2.5 py-1.5 rounded-xl text-xs font-black text-zinc-200 transition-all"
            title="تشكيلتي التكتيكية"
          >
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span>تشكيلتي</span>
          </button>

          {/* Coins & Vault Counter */}
          <button
            onClick={() => {
              sounds.playTap();
              onNavigate?.('store');
            }}
            className="relative flex items-center gap-1.5 bg-gradient-to-b from-zinc-900 to-zinc-950 hover:from-zinc-800 hover:to-zinc-900 border border-amber-500/35 px-3 py-1.5 rounded-xl shadow-[0_3px_0_rgba(180,83,9,0.4)] active:translate-y-0.5 transition-all"
            title="الباكات والمكافآت والرصيد"
          >
            <Coins className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-chakra text-xs sm:text-sm font-black text-amber-300">
              {Math.max(0, profile.coins).toLocaleString()}
            </span>
            {unopenedCount > 0 && (
              <span className="-top-1.5 -left-1.5 absolute min-w-[18px] h-[18px] px-1 rounded-full bg-emerald-500 text-zinc-950 font-black text-[10px] flex items-center justify-center shadow">
                {unopenedCount}
              </span>
            )}
          </button>

          {/* Settings Trigger */}
          <button
            onClick={() => {
              sounds.playTap();
              onOpenSettings?.();
            }}
            className="w-9 h-9 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 hover:border-amber-500/40 flex items-center justify-center text-zinc-300 hover:text-amber-400 transition-all shadow-[0_3px_0_rgba(0,0,0,0.5)] active:translate-y-0.5"
            title="الإعدادات وقاعدة البيانات"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
