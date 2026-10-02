import React, { useState } from 'react';
import { CardTier, Player, PositionType, UserProfile } from '../../types/game';
import { getAllPlayers } from '../../data/players';
import { getUserCollection } from '../../services/storage';
import { PlayerCard } from '../common/PlayerCard';
import { PlayerDetailModal } from './PlayerDetailModal';
import { sounds } from '../../services/audio';
import { Search, Filter, Lock, UserPlus } from 'lucide-react';

interface CollectionScreenProps {
  profile: UserProfile;
  onOpenSettingsAddPlayer?: () => void;
}

export const CollectionScreen: React.FC<CollectionScreenProps> = ({
  onOpenSettingsAddPlayer,
}) => {
  const [search, setSearch] = useState('');
  const [posFilter, setPosFilter] = useState<PositionType | 'ALL'>('ALL');
  const [tierFilter, setTierFilter] = useState<CardTier | 'ALL'>('ALL');
  const [showOwnedOnly, setShowOwnedOnly] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  const allPlayers = getAllPlayers();
  const ownedPlayers = getUserCollection();
  const ownedSet = new Set(ownedPlayers.map((p) => p.id));

  const filteredPlayers = allPlayers.filter((p) => {
    if (showOwnedOnly && !ownedSet.has(p.id)) return false;
    if (posFilter !== 'ALL' && p.position !== posFilter) return false;
    if (tierFilter !== 'ALL' && p.cardType !== tierFilter) return false;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.club.toLowerCase().includes(q) ||
        p.nationality.toLowerCase().includes(q) ||
        p.league.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const positions: (PositionType | 'ALL')[] = ['ALL', 'GK', 'DEF', 'MID', 'ATT'];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-28 space-y-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black text-white">خزينة البطاقات (COLLECTION)</h2>
          <p className="text-xs text-zinc-400">
            تمتلك {ownedPlayers.length} من أصل {allPlayers.length} بطاقة رسمية في قاعدة البيانات
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sounds.playTap();
              setShowOwnedOnly((v) => !v);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
              showOwnedOnly
                ? 'bg-amber-500 text-zinc-950 border-amber-400'
                : 'bg-zinc-900 text-zinc-300 border-zinc-800'
            }`}
          >
            {showOwnedOnly ? 'عرض كل البطاقات' : 'عرض المملوكة فقط'}
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث بالاسم، النادي، أو الجنسية..."
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pr-10 pl-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Position Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <Filter className="w-3.5 h-3.5 text-amber-400 shrink-0 ml-1" />
          {positions.map((pos) => (
            <button
              key={pos}
              onClick={() => {
                sounds.playTap();
                setPosFilter(pos);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold shrink-0 transition-all ${
                posFilter === pos
                  ? 'bg-amber-500 text-zinc-950'
                  : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              {pos === 'ALL' ? 'الكل' : pos}
            </button>
          ))}
        </div>

        {/* Tier Filter */}
        <div className="flex items-center gap-2">
          {(['ALL', 'ICON', 'ELITE', 'WEEKLY'] as const).map((tier) => (
            <button
              key={tier}
              onClick={() => {
                sounds.playTap();
                setTierFilter(tier);
              }}
              className={`px-3 py-1 rounded-lg text-[11px] font-black uppercase transition-all ${
                tierFilter === tier
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                  : 'bg-zinc-950 text-zinc-500 border border-zinc-800'
              }`}
            >
              {tier === 'ALL' ? 'جميع الفئات' : tier}
            </button>
          ))}
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 justify-items-center">
        {filteredPlayers.map((player) => {
          const isOwned = ownedSet.has(player.id);
          return (
            <div key={player.id} className="relative group">
              <div className={isOwned ? '' : 'opacity-45 grayscale contrast-75'}>
                <PlayerCard
                  player={player}
                  size="md"
                  onClick={() => {
                    sounds.playTap();
                    setSelectedPlayer(player);
                  }}
                />
              </div>
              {!isOwned && (
                <div
                  onClick={() => {
                    sounds.playTap();
                    setSelectedPlayer(player);
                  }}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 rounded-2xl cursor-pointer hover:bg-black/20 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-zinc-950/90 border border-amber-500/40 flex items-center justify-center">
                    <Lock className="w-4 h-4 text-amber-400" />
                  </div>
                  <span className="text-[10px] font-bold text-zinc-200 mt-1 bg-black/70 px-2 py-0.5 rounded">
                    اضغط للتفاصيل
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedPlayer && (
        <PlayerDetailModal
          player={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
        />
      )}
    </div>
  );
};
