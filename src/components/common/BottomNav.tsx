import React from 'react';
import { Home, Gamepad2, Globe, Shield, ShoppingBag, Layers, Award } from 'lucide-react';
import { sounds } from '../../services/audio';

export type NavTab = 'home' | 'games' | 'rooms' | 'squad' | 'store' | 'collection' | 'ranking';

interface BottomNavProps {
  activeTab: NavTab;
  onChange: (tab: NavTab) => void;
  badgeCounts?: {
    store?: number;
  };
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onChange, badgeCounts }) => {
  const items: { id: NavTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'home', label: 'الرئيسية', icon: <Home className="w-5 h-5" /> },
    { id: 'games', label: 'الألعاب', icon: <Gamepad2 className="w-5 h-5" /> },
    { id: 'rooms', label: 'الغرف', icon: <Globe className="w-5 h-5" /> },
    { id: 'store', label: 'المتجر والشحن', icon: <ShoppingBag className="w-5 h-5" />, badge: badgeCounts?.store },
    { id: 'squad', label: 'تشكيلتي', icon: <Shield className="w-5 h-5" /> },
    { id: 'collection', label: 'البطاقات', icon: <Layers className="w-5 h-5" /> },
    { id: 'ranking', label: 'دوري جولكس', icon: <Award className="w-5 h-5" /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 backdrop-blur-xl border-t border-amber-500/20 px-1.5 py-1.5 shadow-[0_-10px_30px_rgba(0,0,0,0.85)]">
      <div className="max-w-xl mx-auto grid grid-cols-7 gap-1">
        {items.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                sounds.playTap();
                onChange(item.id);
              }}
              className={`relative flex flex-col items-center justify-center py-2 px-0.5 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-amber-400 bg-gradient-to-b from-amber-500/20 to-amber-500/5 border border-amber-500/35 shadow-[0_3px_0_rgba(180,83,9,0.4)] -translate-y-0.5'
                  : 'text-zinc-500 hover:text-zinc-300 border border-transparent'
              }`}
            >
              {item.icon}
              <span className="text-[9px] font-black mt-1 tracking-tight truncate max-w-full">
                {item.label}
              </span>
              {item.badge && item.badge > 0 ? (
                <span className="absolute top-1 left-1.5 min-w-[15px] h-[15px] px-1 rounded-full bg-emerald-500 text-zinc-950 font-black text-[9px] flex items-center justify-center shadow">
                  {item.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
