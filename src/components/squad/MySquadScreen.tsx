import React, { useState } from 'react';
import { FormationType, Player, PositionType, UserProfile } from '../../types/game';
import { getPositionOrder, getPositionLabelAr } from '../../services/positions';
import { PitchTactics } from '../common/PitchTactics';
import { PlayerCard } from '../common/PlayerCard';
import { GoldButton } from '../common/GoldButton';
import { sounds } from '../../services/audio';
import {
  getUserSquad,
  saveUserSquad,
  getUserFormation,
  saveUserFormation,
  getUserCollection,
  getOrCreateUserProfile,
} from '../../services/storage';
import { Shield, Sparkles, X, Check, Swords } from 'lucide-react';

interface MySquadScreenProps {
  profile: UserProfile;
  onUpdateProfile: (newProfile: UserProfile) => void;
  onPlaySquadMatch?: () => void;
}

const FORMATIONS: FormationType[] = ['4-3-3', '4-4-2', '4-2-3-1', '3-5-2', '5-3-2'];

export const MySquadScreen: React.FC<MySquadScreenProps> = ({
  profile,
  onUpdateProfile,
  onPlaySquadMatch,
}) => {
  const [currentFormation, setCurrentFormation] = useState<FormationType>(() => getUserFormation());
  const [squadPlayers, setSquadPlayers] = useState<(Player | null)[]>(() => getUserSquad());
  const [selectedSlot, setSelectedSlot] = useState<{ index: number; pos: PositionType } | null>(null);

  const expectedPositions = getPositionOrder('full_eleven');
  const ownedPlayers = getUserCollection();

  const validPlayers = squadPlayers.filter((p): p is Player => p !== null);
  const ovr =
    validPlayers.length > 0
      ? Math.round(validPlayers.reduce((sum, p) => sum + p.ovr, 0) / validPlayers.length)
      : 0;

  const handleFormationChange = (fmt: FormationType) => {
    sounds.playTap();
    setCurrentFormation(fmt);
    saveUserFormation(fmt);
    onUpdateProfile(getOrCreateUserProfile());
  };

  const handleAutoBuildBest = () => {
    sounds.playSuccess();
    const newSquad: (Player | null)[] = [];
    const usedIds = new Set<string>();

    expectedPositions.forEach((pos) => {
      const candidates = ownedPlayers
        .filter((p) => p.position === pos && !usedIds.has(p.id))
        .sort((a, b) => b.ovr - a.ovr);

      if (candidates.length > 0) {
        newSquad.push(candidates[0]);
        usedIds.add(candidates[0].id);
      } else {
        const fallback = ownedPlayers
          .filter((p) => !usedIds.has(p.id))
          .sort((a, b) => b.ovr - a.ovr);
        if (fallback.length > 0) {
          newSquad.push(fallback[0]);
          usedIds.add(fallback[0].id);
        } else {
          newSquad.push(null);
        }
      }
    });

    setSquadPlayers(newSquad);
    saveUserSquad(newSquad);
    onUpdateProfile(getOrCreateUserProfile());
  };

  const handleAssignPlayer = (player: Player) => {
    if (!selectedSlot) return;
    sounds.playSuccess();
    const nextSquad = [...squadPlayers];

    const existingIndex = nextSquad.findIndex((p) => p?.id === player.id);
    if (existingIndex !== -1) {
      nextSquad[existingIndex] = nextSquad[selectedSlot.index];
    }
    nextSquad[selectedSlot.index] = player;

    setSquadPlayers(nextSquad);
    saveUserSquad(nextSquad);
    onUpdateProfile(getOrCreateUserProfile());
    setSelectedSlot(null);
  };

  const squadIds = new Set(validPlayers.map((p) => p.id));

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 pb-28 space-y-5 animate-fade-in">
      {/* Header & OVR */}
      <div className="bg-zinc-900/90 border border-amber-500/30 rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
            <Shield className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">
              تشكيلتي الأساسية ({currentFormation}) — {profile.username}
            </h2>
            <p className="text-xs text-zinc-400">
              اضغط على أي مركز في الملعب لتبديل اللاعب من بطاقاتك المملوكة
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 justify-between sm:justify-end">
          <div className="text-center px-4 py-2 rounded-2xl bg-zinc-950 border border-amber-500/30">
            <span className="text-[10px] text-zinc-400 block font-bold">التقييم الإجمالي</span>
            <span className="font-chakra text-2xl font-black text-amber-400 tabular-nums">
              {ovr} OVR
            </span>
          </div>

          <GoldButton size="sm" onClick={handleAutoBuildBest}>
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              أفضل تشكيلة تلقائيًا
            </span>
          </GoldButton>
        </div>
      </div>

      {/* Play Match With My Squad Banner */}
      {onPlaySquadMatch && (
        <div className="bg-gradient-to-r from-amber-500/20 via-zinc-900 to-zinc-950 border border-amber-500/40 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Swords className="w-6 h-6 text-amber-400 shrink-0" />
            <div>
              <div className="font-black text-sm text-white">
                اختبر تشكيلتك في مباراة تكتيكية كاملة (90 دقيقة)
              </div>
              <div className="text-xs text-zinc-400">
                العب بتشكيلتك ضد أندية النخبة واكسب كوينز ونقاط تصنيف وصناديق سانترا 3D!
              </div>
            </div>
          </div>
          <GoldButton size="sm" onClick={onPlaySquadMatch} className="shrink-0 w-full sm:w-auto">
            العب بتشكيلتي الآن
          </GoldButton>
        </div>
      )}

      {/* Formation Selector */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-3 flex items-center justify-between gap-2 overflow-x-auto">
        <span className="text-xs font-bold text-zinc-400 shrink-0 px-2">الخطة التكتيكية:</span>
        <div className="flex items-center gap-1.5">
          {FORMATIONS.map((fmt) => (
            <button
              key={fmt}
              onClick={() => handleFormationChange(fmt)}
              className={`px-3.5 py-1.5 rounded-xl font-chakra font-black text-xs transition-all ${
                currentFormation === fmt
                  ? 'bg-amber-500 text-zinc-950 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                  : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              {fmt}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Pitch */}
      <PitchTactics
        players={squadPlayers}
        formation={currentFormation}
        interactive={true}
        onSlotClick={(index: number) => {
          sounds.playTap();
          setSelectedSlot({ index, pos: expectedPositions[index] || 'MID' });
        }}
        selectedSlot={selectedSlot?.index ?? null}
      />

      {/* Slot Replacement Modal */}
      {selectedSlot && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-2xl bg-zinc-900 border border-amber-500/40 rounded-3xl p-5 max-h-[80vh] flex flex-col space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <span className="text-xs text-amber-400 font-bold">تبديل لاعب المركز</span>
                <h3 className="text-lg font-black text-white">
                  اختر لاعبًا لمركز {getPositionLabelAr(selectedSlot.pos)} ({selectedSlot.pos})
                </h3>
              </div>
              <button
                onClick={() => setSelectedSlot(null)}
                className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-3 p-1">
              {[...ownedPlayers]
                .sort((a, b) => {
                  const aMatch = a.position === selectedSlot.pos ? 1 : 0;
                  const bMatch = b.position === selectedSlot.pos ? 1 : 0;
                  if (aMatch !== bMatch) return bMatch - aMatch;
                  return b.ovr - a.ovr;
                })
                .map((player) => {
                  const isCompatible = player.position === selectedSlot.pos;
                  const isInSquad = squadIds.has(player.id);
                  return (
                    <div
                      key={player.id}
                      onClick={() => handleAssignPlayer(player)}
                      className={`p-3 rounded-2xl border flex flex-col items-center cursor-pointer transition-all ${
                        isCompatible
                          ? 'bg-zinc-950/90 border-amber-500/40 hover:border-amber-400'
                          : 'bg-zinc-950/40 border-zinc-800 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <div className="w-full flex justify-between items-center mb-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isCompatible
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-zinc-800 text-zinc-400'
                          }`}
                        >
                          {isCompatible ? 'مطابق للمركز' : `مركز ${player.position}`}
                        </span>
                        {isInSquad && (
                          <span className="text-[10px] text-amber-400 flex items-center gap-0.5 font-bold">
                            <Check className="w-3 h-3" /> بالتشكيلة
                          </span>
                        )}
                      </div>
                      <PlayerCard player={player} size="sm" showStats={false} />
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
