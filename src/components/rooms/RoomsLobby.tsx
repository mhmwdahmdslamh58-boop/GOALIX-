import React, { useState } from 'react';
import { UserProfile, GameId, GameMode } from '../../types/game';
import { createOnlineRoom, joinOnlineRoom } from '../../services/roomApi';
import { GoldButton } from '../common/GoldButton';
import { sounds } from '../../services/audio';
import { Wifi, Plus, LogIn, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

interface RoomsLobbyProps {
  userProfile: UserProfile;
  onEnterRoom: (code: string) => void;
  onBack: () => void;
}

export const RoomsLobby: React.FC<RoomsLobbyProps> = ({
  userProfile,
  onEnterRoom,
  onBack
}) => {
  const [tab, setTab] = useState<'create' | 'join'>('create');
  const [joinCode, setJoinCode] = useState('');
  const [selectedGame, setSelectedGame] = useState<GameId>('stat_arena');
  const [selectedMode, setSelectedMode] = useState<GameMode>('quick_five');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleCreateRoom = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      sounds.playTap();
      const room = await createOnlineRoom(
        userProfile.id,
        userProfile.username,
        selectedGame,
        selectedMode
      );
      onEnterRoom(room.code);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'فشل في إنشاء الغرفة');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!joinCode.trim()) return;
    setIsLoading(true);
    setErrorMsg(null);
    try {
      sounds.playTap();
      const room = await joinOnlineRoom(
        joinCode.trim(),
        userProfile.id,
        userProfile.username
      );
      onEnterRoom(room.code);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'رمز الغرفة غير صحيح أو أن الغرفة ممتلئة');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08080a] text-zinc-100 pb-20 select-none">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-[#0a0b0e]/95 backdrop-blur-md border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-amber-400 font-tajawal hover:text-amber-300"
        >
          <ArrowRight className="w-4 h-4" />
          <span>الرئيسية</span>
        </button>

        <div className="text-center">
          <h2 className="font-chakra font-black text-sm tracking-wider text-amber-400">
            ONLINE ROOMS
          </h2>
          <span className="text-[10px] text-zinc-400">غرف اللعب عبر الإنترنت</span>
        </div>

        <div className="w-16" />
      </div>

      <div className="max-w-md mx-auto px-4 py-4 space-y-4">
        {/* Anti-cheat banner */}
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5">
          <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold font-tajawal text-amber-300">
              نظام اللعب المعتمد على الخادم (Server-Authoritative)
            </p>
            <p className="text-[11px] text-zinc-400 font-tajawal mt-0.5 leading-relaxed">
              تتم مزامنة الخيارات والإجابات وتوزيع الجوائز عبر خادم GOALIX لضمان النزاهة التامة والتنافسية العادلة بين اللاعبين.
            </p>
          </div>
        </div>

        {/* Tab switch: Create vs Join */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-zinc-900 rounded-xl border border-zinc-800">
          <button
            onClick={() => {
              sounds.playTap();
              setTab('create');
            }}
            className={`py-2 text-xs font-tajawal font-bold rounded-lg transition-all ${
              tab === 'create'
                ? 'bg-amber-500 text-black shadow-md'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            إنشاء غرفة جديدة
          </button>
          <button
            onClick={() => {
              sounds.playTap();
              setTab('join');
            }}
            className={`py-2 text-xs font-tajawal font-bold rounded-lg transition-all ${
              tab === 'join'
                ? 'bg-amber-500 text-black shadow-md'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            انضمام برمز الغرفة
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-950/40 border border-red-700/50 flex items-center gap-2 text-xs text-red-200 font-tajawal">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Create Room Form */}
        {tab === 'create' ? (
          <div className="bg-zinc-900/90 rounded-2xl p-4 border border-zinc-800 space-y-4">
            <div>
              <label className="text-xs font-bold text-amber-400 block mb-2 font-tajawal">
                اختر اللعبة للغرفة:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSelectedGame('stat_arena')}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    selectedGame === 'stat_arena'
                      ? 'border-amber-400 bg-amber-500/10 text-amber-300'
                      : 'border-zinc-800 bg-black/40 text-zinc-400'
                  }`}
                >
                  <p className="font-chakra font-bold text-sm">STAT ARENA</p>
                  <p className="text-[10px] text-zinc-400 mt-0.5">تحدي التوقعات الإحصائية</p>
                </button>

                <button
                  onClick={() => setSelectedGame('santra')}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    selectedGame === 'santra'
                      ? 'border-amber-400 bg-amber-500/10 text-amber-300'
                      : 'border-zinc-800 bg-black/40 text-zinc-400'
                  }`}
                >
                  <p className="font-chakra font-bold text-sm">SANTRA</p>
                  <p className="text-[10px] text-zinc-400 mt-0.5">درافت الصناديق الغامضة</p>
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-amber-400 block mb-2 font-tajawal">
                نظام الجولات:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSelectedMode('quick_five')}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-chakra font-bold transition-all ${
                    selectedMode === 'quick_five'
                      ? 'border-amber-400 bg-amber-500/10 text-amber-300'
                      : 'border-zinc-800 bg-black/40 text-zinc-400'
                  }`}
                >
                  Quick Five (5 جولات)
                </button>

                <button
                  onClick={() => setSelectedMode('full_eleven')}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-chakra font-bold transition-all ${
                    selectedMode === 'full_eleven'
                      ? 'border-amber-400 bg-amber-500/10 text-amber-300'
                      : 'border-zinc-800 bg-black/40 text-zinc-400'
                  }`}
                >
                  Full Eleven (11 جولة)
                </button>
              </div>
            </div>

            <GoldButton onClick={handleCreateRoom} disabled={isLoading} fullWidth size="lg">
              <Plus className="w-4 h-4" />
              {isLoading ? 'جاري إنشاء الغرفة...' : 'إنشاء الغرفة وبدء الانتظار'}
            </GoldButton>
          </div>
        ) : (
          /* Join Room Form */
          <div className="bg-zinc-900/90 rounded-2xl p-4 border border-zinc-800 space-y-4">
            <div>
              <label className="text-xs font-bold text-amber-400 block mb-2 font-tajawal">
                أدخل رمز الغرفة المكون من 6 خانات:
              </label>
              <input
                type="text"
                maxLength={6}
                value={joinCode}
                onChange={e => setJoinCode(e.target.value.toUpperCase())}
                placeholder="مثال: A7B9K2"
                className="w-full bg-black/70 border border-amber-500/40 rounded-xl px-4 py-3 text-2xl font-chakra font-black tracking-widest text-amber-400 text-center uppercase focus:outline-none focus:ring-1 focus:ring-amber-400"
              />
            </div>

            <GoldButton
              onClick={handleJoinRoom}
              disabled={joinCode.trim().length < 4 || isLoading}
              fullWidth
              size="lg"
            >
              <LogIn className="w-4 h-4" />
              {isLoading ? 'جاري الانضمام...' : 'الانضمام إلى الغرفة'}
            </GoldButton>
          </div>
        )}
      </div>
    </div>
  );
};
