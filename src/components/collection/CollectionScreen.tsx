import React, { useState } from 'react';
import { Player, PositionType } from '../../types/game';
import { getUserCollection } from '../../services/storage';
import { PlayerCard } from '../common/PlayerCard';
import { sounds } from '../../services/audio';
import { Search, Filter, Shield } from 'lucide-react';

interface CollectionScreenProps {
  onSelectPlayer: (player: Player) => void;
}

export const CollectionScreen: React.FC<CollectionScreenProps> = ({ onSelectPlayer }) => {
  const [collection] = useState<Player[]>(getUserCollection());
  const [activeFilter, setActiveFilter] = useState<'ALL' | PositionType>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPlayers = collection.filter(p => {
    const matchesPos = activeFilter === 'ALL' || p.position === activeFilter;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.club.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPos && matchesSearch;
  });

  return (
    <div className="pb-24 pt-2 px-4 max-w-md mx-auto space-y-4 select-none">
      {/* Search & Header */}
      <div className="bg-zinc-900/90 rounded-2xl p-4 border border-zinc-800 space-y-3 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-base font-tajawal text-zinc-100">
              مجموعتي من اللاعبين ({collection.length})
            </h3>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="ابحث عن لاعب أو نادٍ..."
            className="w-full bg-black/60 border border-zinc-800 rounded-xl pr-9 pl-4 py-2.5 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        {/* Filter Tabs */}
        <div className="grid grid-cols-5 gap-1 p-1 bg-black/50 rounded-xl border border-zinc-800 text-xs font-chakra">
          {(['ALL', 'GK', 'DEF', 'MID', 'ATT'] as const).map(f => (
            <button
              key={f}
              onClick={() => {
                sounds.playTap();
                setActiveFilter(f);
              }}
              className={`py-1.5 rounded-lg font-bold transition-all ${
                activeFilter === f
                  ? 'bg-amber-500 text-black shadow'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {f === 'ALL' ? 'الكل' : f}
            </button>
          ))}
        </div>
      </div>

      {/* Cards Grid */}
      {filteredPlayers.length === 0 ? (
        <div className="text-center py-12 bg-zinc-900/40 rounded-2xl border border-zinc-800/60 p-6 space-y-2">
          <p className="text-sm font-bold text-zinc-300 font-tajawal">لم يتم العثور على لاعبين</p>
          <p className="text-xs text-zinc-500 font-tajawal">جرب البحث بكلمة أخرى أو افتح حزم جديدة في المتجر!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 justify-items-center">
          {filteredPlayers.map(player => (
            <PlayerCard
              key={player.id}
              player={player}
              size="md"
              onClick={() => onSelectPlayer(player)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
