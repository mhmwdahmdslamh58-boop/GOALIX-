import React, { useState, useEffect } from 'react';
import {
  FormationType,
  GameId,
  GameMode,
  OnlineRoomState,
  RoomTimerDuration,
  RoomVisibilityType,
  UserProfile,
} from '../../types/game';
import { createOnlineRoom, joinOnlineRoom, fetchWaitingRooms } from '../../services/roomApi';
import { getUserFormation, saveUserFormation } from '../../services/storage';
import { GoldButton } from '../common/GoldButton';
import { sounds } from '../../services/audio';
import {
  Users,
  PlusCircle,
  LogIn,
  Sparkles,
  ShieldAlert,
  Globe,
  RefreshCw,
  Play,
  HelpCircle,
  Trophy,
  Lock,
  Clock,
  MessageSquare,
  MessageSquareOff,
} from 'lucide-react';

interface RoomsLobbyProps {
  profile: UserProfile;
  initialGameId?: GameId;
  onEnterRoom: (room: OnlineRoomState) => void;
}

const TIMER_OPTIONS: { value: RoomTimerDuration; labelAr: string }[] = [
  { value: 15, labelAr: '15 ثانية (15 Seconds)' },
  { value: 30, labelAr: '30 ثانية (30 Seconds)' },
  { value: 45, labelAr: '45 ثانية (45 Seconds)' },
  { value: 60, labelAr: '60 ثانية (60 Seconds)' },
];

export const RoomsLobby: React.FC<RoomsLobbyProps> = ({
  profile,
  initialGameId,
  onEnterRoom,
}) => {
  const [tab, setTab] = useState<'create' | 'join'>('create');
  const [formation, setFormation] = useState<FormationType>(() => getUserFormation());
  const [gameType, setGameType] = useState<GameId>(
    initialGameId === 'stat_arena' || initialGameId === 'santra' ? initialGameId : 'santra'
  );
  const [mode, setMode] = useState<GameMode>('quick_five');
  const [roomType, setRoomType] = useState<RoomVisibilityType>('PUBLIC');
  const [timerSeconds, setTimerSeconds] = useState<RoomTimerDuration>(30);
  const [chatEnabled, setChatEnabled] = useState<boolean>(true);

  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [waitingRooms, setWaitingRooms] = useState<OnlineRoomState[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);

  const loadWaitingRooms = async () => {
    setLoadingRooms(true);
    const list = await fetchWaitingRooms();
    setWaitingRooms(list);
    setLoadingRooms(false);
  };

  useEffect(() => {
    loadWaitingRooms();
    const timer = setInterval(loadWaitingRooms, 4500);
    return () => clearInterval(timer);
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    sounds.playTap();
    saveUserFormation(formation);
    try {
      const room = await createOnlineRoom(
        profile.id,
        profile.username,
        gameType,
        mode,
        roomType,
        timerSeconds,
        chatEnabled
      );
      sounds.playSuccess();
      onEnterRoom(room);
    } catch (err: unknown) {
      sounds.playError();
      setError(err instanceof Error ? err.message : 'فشل إنشاء الغرفة');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinByCode = async (codeToJoin: string) => {
    if (!codeToJoin.trim()) return;
    setError(null);
    setLoading(true);
    sounds.playTap();
    saveUserFormation(formation);
    try {
      const room = await joinOnlineRoom(
        codeToJoin.trim().toUpperCase(),
        profile.id,
        profile.username
      );
      sounds.playSuccess();
      onEnterRoom(room);
    } catch (err: unknown) {
      sounds.playError();
      setError(err instanceof Error ? err.message : 'تعذر الانضمام للغرفة');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleJoinByCode(joinCode);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 pb-28 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 text-amber-400 text-xs font-black tracking-wider uppercase">
          <Globe className="w-4 h-4" />
          <span>MULTIPLAYER ROOMS • PLAYER 1 VS PLAYER 2</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white">غرف المواجهات المباشرة</h2>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto">
          مواجهات حقيقية بين لاعبين فقط (Player 1 VS Player 2) بدون أي بوتات أو كمبيوتر، وتُحتسب نتائجها مباشرة في دوري جولكس الرسمي.
        </p>
      </div>

      {/* Mode Switch Tabs */}
      <div className="grid grid-cols-2 gap-2 bg-zinc-900 p-1.5 rounded-2xl border border-zinc-800">
        <button
          onClick={() => {
            sounds.playTap();
            setTab('create');
            setError(null);
          }}
          className={`py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all ${
            tab === 'create'
              ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-zinc-950 shadow-lg'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create Room • إنشاء غرفة</span>
        </button>
        <button
          onClick={() => {
            sounds.playTap();
            setTab('join');
            setError(null);
            loadWaitingRooms();
          }}
          className={`py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all ${
            tab === 'join'
              ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-zinc-950 shadow-lg'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <LogIn className="w-4 h-4" />
          <span>الغرف العامة / انضمام بالكود ({waitingRooms.length})</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-500/50 text-rose-200 flex items-center gap-3 text-xs font-bold">
          <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-gradient-to-b from-zinc-900 via-zinc-950 to-black border-2 border-amber-500/35 rounded-3xl p-6 space-y-6 shadow-[0_22px_60px_rgba(0,0,0,0.9)]">
        {tab === 'create' ? (
          <form onSubmit={handleCreate} className="space-y-6">
            {/* Step 1: Select Game & Mode */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-amber-400 uppercase">
                  1. اختيار اللعبة وطول المواجهة (Select Game)
                </label>
                <span className="text-[11px] text-zinc-400">
                  القائد: <strong className="text-white">{profile.username}</strong>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    sounds.playTap();
                    setGameType('santra');
                  }}
                  className={`p-4 rounded-2xl border-2 text-right transition-all ${
                    gameType === 'santra'
                      ? 'bg-amber-500/15 border-amber-400 text-white shadow-[0_0_25px_rgba(245,158,11,0.2)]'
                      : 'bg-zinc-950/70 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <div className="font-black text-sm flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-amber-400" />
                    <span>SANTRA 3D</span>
                  </div>
                  <div className="text-[11px] opacity-80 mt-1">
                    صناديق سانترا التكتيكية وبناء التشكيلة + المحاكاة
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sounds.playTap();
                    setGameType('stat_arena');
                  }}
                  className={`p-4 rounded-2xl border-2 text-right transition-all ${
                    gameType === 'stat_arena'
                      ? 'bg-amber-500/15 border-amber-400 text-white shadow-[0_0_25px_rgba(245,158,11,0.2)]'
                      : 'bg-zinc-950/70 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <div className="font-black text-sm flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <span>STAT ARENA</span>
                  </div>
                  <div className="text-[11px] opacity-80 mt-1">
                    تحدي الأرقام القياسية وخطف نجوم المراكز + المحاكاة
                  </div>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    sounds.playTap();
                    setMode('quick_five');
                  }}
                  className={`p-3 rounded-xl border text-right transition-all ${
                    mode === 'quick_five'
                      ? 'bg-amber-500/15 border-amber-500 text-white'
                      : 'bg-zinc-950/60 border-zinc-800 text-zinc-400'
                  }`}
                >
                  <div className="font-black text-xs">خماسية سريعة (5 جولات)</div>
                  <div className="text-[10px] opacity-75 mt-0.5">5 مراكز + محاكاة النهاية</div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sounds.playTap();
                    setMode('full_eleven');
                  }}
                  className={`p-3 rounded-xl border text-right transition-all ${
                    mode === 'full_eleven'
                      ? 'bg-amber-500/15 border-amber-500 text-white'
                      : 'bg-zinc-950/60 border-zinc-800 text-zinc-400'
                  }`}
                >
                  <div className="font-black text-xs">تشكيلة كاملة (11 جولة)</div>
                  <div className="text-[10px] opacity-75 mt-0.5">11 مركزًا كاملاً + محاكاة</div>
                </button>
              </div>
            </div>

            {/* Step 2: Select Room Type (PUBLIC vs PRIVATE) */}
            <div className="space-y-2.5">
              <label className="block text-xs font-black text-amber-400 uppercase">
                2. نوع الغرفة (Select Room Type)
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    sounds.playTap();
                    setRoomType('PUBLIC');
                  }}
                  className={`p-3.5 rounded-2xl border-2 text-right transition-all ${
                    roomType === 'PUBLIC'
                      ? 'bg-emerald-500/15 border-emerald-400 text-white'
                      : 'bg-zinc-950/70 border-zinc-800 text-zinc-400'
                  }`}
                >
                  <div className="font-black text-xs flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-emerald-400" />
                    <span>غرفة عامة (Public Room)</span>
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-1">
                    تظهر في قائمة الغرف العامة ويمكن لأي لاعب الانضمام
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sounds.playTap();
                    setRoomType('PRIVATE');
                  }}
                  className={`p-3.5 rounded-2xl border-2 text-right transition-all ${
                    roomType === 'PRIVATE'
                      ? 'bg-amber-500/15 border-amber-400 text-white'
                      : 'bg-zinc-950/70 border-zinc-800 text-zinc-400'
                  }`}
                >
                  <div className="font-black text-xs flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-amber-400" />
                    <span>غرفة خاصة (Private Room)</span>
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-1">
                    لها Room Code سري ولا تظهر في القائمة العامة
                  </div>
                </button>
              </div>
            </div>

            {/* Step 3: Select Match Timer (15, 30, 45, 60 Seconds) */}
            <div className="space-y-2.5">
              <label className="block text-xs font-black text-amber-400 uppercase">
                3. مؤقت الجولة (Select Match Timer — Server-Side)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {TIMER_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      sounds.playTap();
                      setTimerSeconds(opt.value);
                    }}
                    className={`py-3 px-2.5 rounded-xl border text-center transition-all ${
                      timerSeconds === opt.value
                        ? 'bg-amber-500 text-zinc-950 border-amber-300 font-black shadow'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700 font-bold'
                    }`}
                  >
                    <Clock className="w-4 h-4 mx-auto mb-1" />
                    <div className="font-chakra text-sm font-black">{opt.value}s</div>
                    <div className="text-[10px] opacity-80">{opt.value} ثانية</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 4: Chat Setting (ON / OFF) & Formation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-black text-amber-400 uppercase">
                  4. الشات السريع داخل المباراة (Chat ON/OFF)
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playTap();
                      setChatEnabled(true);
                    }}
                    className={`py-3 px-3 rounded-xl border text-xs font-black flex items-center justify-center gap-2 transition-all ${
                      chatEnabled
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-500'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Chat ON (مفعل)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playTap();
                      setChatEnabled(false);
                    }}
                    className={`py-3 px-3 rounded-xl border text-xs font-black flex items-center justify-center gap-2 transition-all ${
                      !chatEnabled
                        ? 'bg-rose-500/20 border-rose-400 text-rose-300'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-500'
                    }`}
                  >
                    <MessageSquareOff className="w-4 h-4" />
                    <span>Chat OFF (مغلق)</span>
                  </button>
                </div>
                <p className="text-[10px] text-zinc-500">
                  عند التفعيل: 6 رسائل لكل لاعب في المباراة مع مهلة 15 ثانية بين كل رسالة.
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-black text-amber-400 uppercase">
                  خطتك التكتيكية للمحاكاة
                </label>
                <select
                  value={formation}
                  onChange={(e) => setFormation(e.target.value as FormationType)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-3 text-white text-xs font-black focus:outline-none focus:border-amber-500"
                >
                  <option value="4-3-3">4-3-3 هجومي</option>
                  <option value="4-4-2">4-4-2 متوازن</option>
                  <option value="4-2-3-1">4-2-3-1 استحواذ</option>
                  <option value="3-5-2">3-5-2 سيطرة وسط</option>
                  <option value="5-3-2">5-3-2 دفاع ومرتدات</option>
                </select>
              </div>
            </div>

            {/* Step 5: Create Room Button */}
            <GoldButton type="submit" fullWidth size="lg" disabled={loading}>
              <span className="flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5" />
                {loading ? 'جاري إنشاء الغرفة...' : 'إنشاء الغرفة (Create Room)'}
              </span>
            </GoldButton>
          </form>
        ) : (
          <div className="space-y-6">
            {/* Join by Room Code (Public or Private) */}
            <form onSubmit={handleJoinSubmit} className="space-y-3">
              <label className="block text-xs font-black text-amber-400 uppercase">
                الانضمام عبر كود الغرفة (Private / Public Room Code)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="أدخل كود الغرفة..."
                  maxLength={8}
                  className="flex-1 text-center font-chakra text-2xl font-black tracking-widest uppercase bg-zinc-950 border-2 border-amber-500/40 focus:border-amber-400 rounded-2xl py-3 px-4 text-amber-400 focus:outline-none"
                />
                <GoldButton type="submit" disabled={loading || joinCode.length < 4}>
                  {loading ? 'جاري...' : 'انضمام'}
                </GoldButton>
              </div>
            </form>

            {/* Public Rooms Directory */}
            <div className="space-y-3 pt-3 border-t border-zinc-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-400 flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  قائمة الغرف العامة المتاحة (Public Rooms: {waitingRooms.length})
                </span>
                <button
                  type="button"
                  onClick={loadWaitingRooms}
                  className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 bg-zinc-950 px-2.5 py-1.5 rounded-lg border border-zinc-800"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingRooms ? 'animate-spin' : ''}`} />
                  تحديث
                </button>
              </div>

              {waitingRooms.length === 0 ? (
                <div className="p-6 rounded-2xl bg-zinc-950/70 border border-zinc-800 text-center space-y-1">
                  <div className="text-xs font-bold text-zinc-400">
                    لا توجد غرف عامة في انتظار اللاعب الثاني حاليًا
                  </div>
                  <div className="text-[11px] text-zinc-500">
                    أنشئ غرفة جديدة أو أدخل كود غرفة خاصة من صديقك
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {waitingRooms.map((rm) => (
                    <div
                      key={rm.code}
                      className="p-4 rounded-2xl bg-zinc-950 border border-amber-500/30 flex items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-chakra font-black text-amber-400 text-sm">
                            #{rm.code}
                          </span>
                          <span className="text-xs font-black text-white">
                            {rm.participants.host.name} VS ...
                          </span>
                        </div>
                        <div className="text-[11px] text-zinc-400 flex items-center gap-2">
                          <span>{rm.gameId === 'santra' ? 'SANTRA 3D' : 'STAT ARENA'}</span>
                          <span>·</span>
                          <span>{rm.mode === 'quick_five' ? '5 جولات' : '11 جولة'}</span>
                          <span>·</span>
                          <span>مؤقت {rm.timerSeconds || 30}s</span>
                          <span>·</span>
                          <span>{rm.chatEnabled ? '💬 الشات مفعل' : '🔇 بدون شات'}</span>
                        </div>
                      </div>
                      <GoldButton size="sm" onClick={() => handleJoinByCode(rm.code)}>
                        <span className="flex items-center gap-1">
                          <Play className="w-3.5 h-3.5 fill-current" />
                          انضمام (Player 2)
                        </span>
                      </GoldButton>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
