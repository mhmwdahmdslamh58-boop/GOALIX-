import React, { useState } from 'react';
import { Player, FormationType, PositionType } from '../../types/game';
import { 
  getUserSquad, 
  getUserFormation, 
  saveUserSquad, 
  saveUserFormation, 
  getUserCollection 
} from '../../services/storage';
import { calculateTeamRatings } from '../games/simulation/MatchEngine';
import { PitchTactics } from '../common/PitchTactics';
import { GoldButton } from '../common/GoldButton';
import { sounds } from '../../services/audio';
import { Shield, Users, Save, CheckCircle2, RefreshCw, Info } from 'lucide-react';

interface MySquadScreenProps {
  onSelectPlayer: (player: Player) => void;
}

export const MySquadScreen: React.FC<MySquadScreenProps> = ({ onSelectPlayer }) => {
  const [formation, setFormation] = useState<FormationType>(getUserFormation());
  const [squad, setSquad] = useState<(Player | null)[]>(getUserSquad());
  const [collection, setCollection] = useState<Player[]>(getUserCollection());
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const activePlayers = squad.filter((p): p is Player => p !== null);
  const ratings = calculateTeamRatings(activePlayers);

  // Bench: Collection players that are NOT currently in the starter 11
  const starterIds = new Set(activePlayers.map(p => p.id));
  const benchPlayers = collection.filter(p => !starterIds.has(p.id));

  const handleSelectSlot = (index: number) => {
    sounds.playTap();
    if (selectedSlotIndex === index) {
      setSelectedSlotIndex(null);
    } else {
      setSelectedSlotIndex(index);
    }
  };

  const handleSwapWithBench = (benchPlayer: Player) => {
    sounds.playTap();
    if (selectedSlotIndex === null) {
      // Find empty slot or matching position slot
      const emptyIdx = squad.findIndex(s => s === null);
      const targetIdx = emptyIdx !== -1 ? emptyIdx : squad.findIndex(s => s?.position === benchPlayer.position);
      if (targetIdx !== -1) {
        const nextSquad = [...squad];
        nextSquad[targetIdx] = benchPlayer;
        setSquad(nextSquad);
      }
      return;
    }

    const nextSquad = [...squad];
    nextSquad[selectedSlotIndex] = benchPlayer;
    setSquad(nextSquad);
    setSelectedSlotIndex(null);
  };

  const handleSaveSquad = () => {
    sounds.playTap();
    saveUserSquad(squad);
    saveUserFormation(formation);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleChangeFormation = (newFormation: FormationType) => {
    sounds.playTap();
    setFormation(newFormation);
    setSelectedSlotIndex(null);
  };

  return (
    <div className="pb-24 pt-2 px-4 max-w-md mx-auto space-y-4 select-none">
      {/* Top Banner: Team Rating & Formation Picker */}
      <div className="bg-zinc-900/90 rounded-2xl p-4 border border-zinc-800 space-y-3 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold font-tajawal text-zinc-100 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-amber-400" />
              تشكيلة الفريق الأساسية
            </h3>
            <span className="text-[11px] text-zinc-400 font-tajawal">
              قم بالضغط على أي لاعب في الملعب لتبديله من دكة البدلاء
            </span>
          </div>

          <div className="text-center px-3 py-1 bg-amber-500/10 rounded-xl border border-amber-500/30">
            <span className="text-[10px] text-amber-400 block font-chakra font-bold">TEAM OVR</span>
            <span className="font-chakra font-black text-2xl text-amber-300 tabular-nums">
              {ratings.ovrAvg}
            </span>
          </div>
        </div>

        {/* 4 Line Ratings: ATT, MID, DEF, GK */}
        <div className="grid grid-cols-4 gap-1.5 text-center font-chakra text-xs bg-black/40 p-2 rounded-xl border border-zinc-800/80">
          <div>
            <span className="text-[10px] text-zinc-400">ATT</span>
            <p className="font-bold text-amber-400 text-sm">{ratings.attRating}</p>
          </div>
          <div>
            <span className="text-[10px] text-zinc-400">MID</span>
            <p className="font-bold text-amber-400 text-sm">{ratings.midRating}</p>
          </div>
          <div>
            <span className="text-[10px] text-zinc-400">DEF</span>
            <p className="font-bold text-amber-400 text-sm">{ratings.defRating}</p>
          </div>
          <div>
            <span className="text-[10px] text-zinc-400">GK</span>
            <p className="font-bold text-amber-400 text-sm">{ratings.gkRating}</p>
          </div>
        </div>

        {/* Formation Selector */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-zinc-400 font-tajawal">الخطة التكتيكية:</span>
          <div className="flex items-center gap-1 bg-black/50 p-1 rounded-xl border border-zinc-800">
            {(['4-3-3', '4-4-2', '4-2-3-1', '3-5-2', '5-3-2'] as FormationType[]).map(fmt => (
              <button
                key={fmt}
                onClick={() => handleChangeFormation(fmt)}
                className={`px-2 py-1 rounded-lg text-xs font-chakra font-bold transition-all ${
                  formation === fmt
                    ? 'bg-amber-500 text-black shadow'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {fmt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2D Pitch Tactical Field */}
      <PitchTactics
        formation={formation}
        players={squad}
        onSlotClick={handleSelectSlot}
        selectedSlot={selectedSlotIndex}
      />

      {/* Save Button */}
      <GoldButton onClick={handleSaveSquad} fullWidth size="lg">
        {savedSuccess ? (
          <>
            <CheckCircle2 className="w-4 h-4 text-black" />
            تم حفظ التشكيلة بنجاح!
          </>
        ) : (
          <>
            <Save className="w-4 h-4" />
            حفظ التشكيلة التكتيكية
          </>
        )}
      </GoldButton>

      {/* Bench / Reserves Carousel */}
      <div className="bg-zinc-900/90 rounded-2xl p-4 border border-zinc-800 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-amber-400 font-tajawal flex items-center gap-1.5">
            <Users className="w-4 h-4" />
            دكة البدلاء ({benchPlayers.length} لاعبين)
          </h4>
          <span className="text-[10px] text-zinc-400 font-tajawal">
            {selectedSlotIndex !== null ? 'انقر على لاعب لإنزاله في المركز المحدد' : 'انقر للمعاينة'}
          </span>
        </div>

        {benchPlayers.length === 0 ? (
          <p className="text-xs text-zinc-500 text-center py-4 font-tajawal">
            لا يوجد لاعبين إضافيين على الدكة. يمكنك الحصول على المزيد من حزم المتجر!
          </p>
        ) : (
          <div className="flex gap-2.5 overflow-x-auto pb-2">
            {benchPlayers.map(p => (
              <div
                key={p.id}
                onClick={() => {
                  if (selectedSlotIndex !== null) handleSwapWithBench(p);
                  else onSelectPlayer(p);
                }}
                className="shrink-0 w-24 p-2 rounded-xl bg-black/60 border border-zinc-800 hover:border-amber-400/60 active:scale-95 transition-all text-center cursor-pointer flex flex-col items-center"
              >
                <div className="w-10 h-10 rounded-full overflow-hidden border border-amber-500/30 bg-zinc-800 mb-1">
                  {p.image ? (
                    <img
                      src={p.image}
                      alt={p.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-top"
                    />
                  ) : (
                    <Shield className="w-full h-full p-2 text-amber-400" />
                  )}
                </div>
                <span className="text-[10px] font-chakra font-bold text-amber-400">
                  {p.detailedPosition || p.position} · {p.ovr}
                </span>
                <p className="text-xs font-bold text-zinc-200 truncate w-full mt-0.5">{p.name}</p>
                <span className="text-[9px] text-zinc-400 truncate w-full">{p.club}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
