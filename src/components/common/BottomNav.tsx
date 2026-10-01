import React from 'react';
import { Home, Gamepad2, Trophy, Wifi, Users, ShoppingBag } from 'lucide-react';
import { sounds } from '../../services/audio';

export type MainTab = 'home' | 'games' | 'ranking' | 'rooms' | 'squad' | 'store';

interface BottomNavProps {
  currentTab: MainTab;
  onChangeTab: (tab: MainTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onChangeTab }) => {
  const tabs = [
    { id: 'home' as MainTab, label: 'الرئيسية', enLabel: 'HOME', icon: Home },
    { id: 'games' as MainTab, label: 'الألعاب', enLabel: 'GAMES', icon: Gamepad2 },
    { id: 'ranking' as MainTab, label: 'الترتيب', enLabel: 'RANKING', icon: Trophy },
    { id: 'rooms' as MainTab, label: 'الغرف', enLabel: 'ROOMS', icon: Wifi },
    { id: 'squad' as MainTab, label: 'تشكيلتي', enLabel: 'SQUAD', icon: Users },
    { id: 'store' as MainTab, label: 'المتجر', enLabel: 'STORE', icon: ShoppingBag }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0a0b0e]/95 backdrop-blur-md border-t border-zinc-800/80 px-1 pb-safe">
      <div className="max-w-md mx-auto grid grid-cols-6 items-center h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                sounds.playButtonClick();
                onChangeTab(tab.id);
              }}
              onMouseEnter={() => sounds.playButtonHover()}
              className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-all cursor-pointer relative px-0.5 ${
                isActive ? 'text-amber-400' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {isActive && (
                <div className="absolute top-0 w-6 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
              )}
              <Icon className={`w-4 h-4 transition-transform duration-150 ${isActive ? 'scale-110 stroke-[2.3]' : 'stroke-[1.8]'}`} />
              <span className={`text-[9px] font-tajawal mt-1 font-medium truncate max-w-full ${isActive ? 'text-amber-300 font-bold' : ''}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
