import React, { useState, useEffect } from 'react';
import { 
  OnlineRoomState, 
  UserProfile, 
  Player 
} from '../../types/game';
import { 
  fetchRoomState, 
  subscribeToRoomUpdates, 
  setRoomReady, 
  updateRoomGame, 
  sendStatAnswer, 
  sendSantraBox, 
  advanceRoomRound, 
  startRoomSimulation, 
  finishRoomMatch, 
  leaveOnlineRoom 
} from '../../services/roomApi';
import { GoldButton } from '../common/GoldButton';
import { MatchSimulationScreen } from '../games/simulation/MatchSimulationScreen';
import { SantraLivePitch } from '../games/santra/SantraLivePitch';
import { sounds } from '../../services/audio';
import { 
  Wifi, 
  Copy, 
  Check, 
  Users, 
  ArrowRight, 
  HelpCircle, 
  Trophy, 
  Sparkles,
  AlertCircle,
  WifiOff
} from 'lucide-react';

interface OnlineMatchRoomProps {
  roomCode: string;
  userProfile: UserProfile;
  onLeave: () => void;
  onMatchWin: (coins: number) => void;
}

export const OnlineMatchRoom: React.FC<OnlineMatchRoomProps> = ({
  roomCode,
  userProfile,
  onLeave,
  onMatchWin
}) => {
  const [room, setRoom] = useState<OnlineRoomState | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [answerInput, setAnswerInput] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [showSimScreen, setShowSimScreen] = useState(false);

  // Subscribe to real-time room updates via SSE & Polling
  useEffect(() => {
    let active = true;

    // Fetch initial
    fetchRoomState(roomCode)
      .then(initialState => {
        if (active) setRoom(initialState);
      })
      .catch(err => {
        if (active) setErrorMsg(err.message || 'فشل تحميل بيانات الغرفة');
      });

    // Realtime connection
    const unsubscribe = subscribeToRoomUpdates(
      roomCode,
      updatedState => {
        if (active) {
          setRoom(updatedState);
          setErrorMsg(null);
        }
      },
      err => {
        if (active && !room) setErrorMsg('انقطع الاتصال بالغرفة، جاري المحاولة...');
      }
    );

    return () => {
      active = false;
      unsubscribe();
    };
  }, [roomCode]);

  const isHost = room?.hostId === userProfile.id;
  const isGuest = room?.participants.guest?.id === userProfile.id;
  const myParticipant = isHost ? room?.participants.host : room?.participants.guest;
  const opponentParticipant = isHost ? room?.participants.guest : room?.participants.host;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleReady = async () => {
    if (!room || !myParticipant) return;
    try {
      sounds.playTap();
      await setRoomReady(roomCode, userProfile.id, !myParticipant.ready);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'فشل تحديث الجاهزية');
    }
  };

  const handleChangeGame = async (gameId: 'stat_arena' | 'santra') => {
    if (!isHost || !room) return;
    try {
      sounds.playTap();
      await updateRoomGame(roomCode, userProfile.id, gameId, room.mode);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'فشل تغيير اللعبة');
    }
  };

  const handleChangeMode = async (mode: 'quick_five' | 'full_eleven') => {
    if (!isHost || !room) return;
    try {
      sounds.playTap();
      await updateRoomGame(roomCode, userProfile.id, room.gameId, mode);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'فشل تغيير النمط');
    }
  };

  const handleSubmitAnswer = async () => {
    if (!answerInput.trim() || isNaN(Number(answerInput))) return;
    setSubmitting(true);
    try {
      sounds.playTap();
      await sendStatAnswer(roomCode, userProfile.id, Number(answerInput));
      setAnswerInput('');
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'فشل إرسال الإجابة');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectBox = async (boxIdx: number) => {
    if (myParticipant?.currentBoxSelection !== null && myParticipant?.currentBoxSelection !== undefined) return;
    setSubmitting(true);
    try {
      sounds.playTap();
      await sendSantraBox(roomCode, userProfile.id, boxIdx);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'فشل اختيار الصندوق');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdvanceRound = async () => {
    try {
      sounds.playTap();
      await advanceRoomRound(roomCode);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'فشل الانتقال للجولة التالية');
    }
  };

  const handleLeave = async () => {
    await leaveOnlineRoom(roomCode, userProfile.id);
    onLeave();
  };

  if (errorMsg && !room) {
    return (
      <div className="min-h-screen bg-[#08080a] flex items-center justify-center p-4">
        <div className="max-w-xs w-full bg-zinc-900 border border-red-500/40 rounded-2xl p-6 text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
          <h3 className="text-base font-bold text-white font-tajawal">تعذر الاتصال بالغرفة</h3>
          <p className="text-xs text-zinc-400 font-tajawal">{errorMsg}</p>
          <GoldButton onClick={onLeave} fullWidth size="md">
            العودة للردهة
          </GoldButton>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-[#08080a] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-zinc-400 font-tajawal">جاري مزامنة بيانات الغرفة من الخادم...</p>
        </div>
      </div>
    );
  }

  const currentPos = room.positionOrder[room.currentRoundIndex];

  return (
    <div className="min-h-screen bg-[#08080a] text-zinc-100 pb-20 select-none">
      {/* Room Header */}
      <div className="sticky top-0 z-30 bg-[#0a0b0e]/95 backdrop-blur-md border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
        <button
          onClick={handleLeave}
          className="flex items-center gap-1.5 text-xs text-red-400 font-tajawal hover:text-red-300"
        >
          <ArrowRight className="w-4 h-4" />
          <span>مغادرة الغرفة</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="font-chakra font-black text-amber-400 tracking-wider">
            {room.code}
          </span>
          <button
            onClick={handleCopyCode}
            className="p-1 rounded bg-zinc-800 text-zinc-400 hover:text-zinc-200"
            title="نسخ رمز الغرفة"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        <div className="flex items-center gap-1 text-[11px] text-green-400 font-chakra">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span>أونلاين</span>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-4 space-y-4">
        {/* Opponent Disconnection Warning Banner */}
        {opponentParticipant && !opponentParticipant.connected && (
          <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-600/50 flex items-center gap-2 text-xs text-amber-200 font-tajawal shadow-lg animate-pulse">
            <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
            <span>اللاعب المنافس غير متصل حالياً. جاري انتظار إعادة اتصاله خلال المهلة المحددة...</span>
          </div>
        )}

        {/* ================= 1. WAITING ROOM ================= */}
        {room.phase === 'WAITING' && (
          <div className="space-y-4">
            {/* Room Code Card */}
            <div className="bg-gradient-to-b from-zinc-900 to-zinc-950 rounded-2xl p-5 border border-amber-500/40 text-center space-y-3 shadow-xl">
              <span className="text-xs font-tajawal text-zinc-400 block">
                شارك هذا الرمز مع منافسك للانضمام:
              </span>
              <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-xl bg-black/80 border border-amber-500/50 shadow-inner">
                <span className="font-chakra font-black text-3xl tracking-widest text-amber-400">
                  {room.code}
                </span>
                <button
                  onClick={handleCopyCode}
                  className="px-2.5 py-1 rounded-lg bg-zinc-800 text-xs font-tajawal text-zinc-200 hover:bg-zinc-700"
                >
                  {copied ? 'تم النسخ!' : 'نسخ'}
                </button>
              </div>
            </div>

            {/* Participants Status */}
            <div className="grid grid-cols-2 gap-3">
              {/* Host */}
              <div className="bg-zinc-900 rounded-xl p-3 border border-zinc-800 text-center space-y-1">
                <span className="text-[10px] text-amber-400 font-tajawal">المضيف</span>
                <p className="font-bold text-sm text-zinc-100 truncate">{room.participants.host.name}</p>
                <span
                  className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-tajawal font-bold ${
                    room.participants.host.ready
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {room.participants.host.ready ? 'جاهز للمباراة' : 'في الانتظار...'}
                </span>
              </div>

              {/* Guest */}
              <div className="bg-zinc-900 rounded-xl p-3 border border-zinc-800 text-center space-y-1">
                <span className="text-[10px] text-zinc-400 font-tajawal">الضيف</span>
                <p className="font-bold text-sm text-zinc-100 truncate">
                  {room.participants.guest ? room.participants.guest.name : 'في انتظار لاعب...'}
                </p>
                <span
                  className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-tajawal font-bold ${
                    room.participants.guest?.ready
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {room.participants.guest
                    ? room.participants.guest.ready
                      ? 'جاهز للمباراة'
                      : 'في الانتظار...'
                    : 'شاغر'}
                </span>
              </div>
            </div>

            {/* Host Game Configuration */}
            {isHost && (
              <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800 space-y-3">
                <label className="text-xs font-bold text-amber-400 block font-tajawal">
                  إعدادات اللعبة (صلاحية المضيف):
                </label>

                {/* Game select */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleChangeGame('stat_arena')}
                    className={`py-2 px-3 rounded-lg border text-xs font-chakra font-bold transition-all ${
                      room.gameId === 'stat_arena'
                        ? 'border-amber-400 bg-amber-500/10 text-amber-300'
                        : 'border-zinc-800 bg-black/40 text-zinc-400'
                    }`}
                  >
                    STAT ARENA
                  </button>
                  <button
                    onClick={() => handleChangeGame('santra')}
                    className={`py-2 px-3 rounded-lg border text-xs font-chakra font-bold transition-all ${
                      room.gameId === 'santra'
                        ? 'border-amber-400 bg-amber-500/10 text-amber-300'
                        : 'border-zinc-800 bg-black/40 text-zinc-400'
                    }`}
                  >
                    SANTRA
                  </button>
                </div>

                {/* Mode select */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleChangeMode('quick_five')}
                    className={`py-2 px-3 rounded-lg border text-xs font-chakra font-bold transition-all ${
                      room.mode === 'quick_five'
                        ? 'border-amber-400 bg-amber-500/10 text-amber-300'
                        : 'border-zinc-800 bg-black/40 text-zinc-400'
                    }`}
                  >
                    Quick Five (5)
                  </button>
                  <button
                    onClick={() => handleChangeMode('full_eleven')}
                    className={`py-2 px-3 rounded-lg border text-xs font-chakra font-bold transition-all ${
                      room.mode === 'full_eleven'
                        ? 'border-amber-400 bg-amber-500/10 text-amber-300'
                        : 'border-zinc-800 bg-black/40 text-zinc-400'
                    }`}
                  >
                    Full Eleven (11)
                  </button>
                </div>
              </div>
            )}

            {/* Ready Button */}
            <GoldButton
              onClick={handleToggleReady}
              disabled={!room.participants.guest}
              fullWidth
              size="lg"
            >
              {myParticipant?.ready ? 'إلغاء الجاهزية' : 'أنا جاهز (Ready)'}
            </GoldButton>
          </div>
        )}

        {/* ================= 2. ONLINE STAT ARENA ================= */}
        {room.gameId === 'stat_arena' && (room.phase === 'QUESTION_ACTIVE' || room.phase === 'ANSWER_REVEAL') && room.currentQuestion && (
          <div className="space-y-4">
            {/* Header Scoreboard */}
            <div className="bg-zinc-900/90 rounded-2xl p-3 border border-zinc-800 flex items-center justify-between">
              <div className="text-center">
                <span className="text-[10px] text-zinc-400 block font-tajawal">{room.participants.host.name}</span>
                <span className="font-chakra font-black text-amber-400 text-xl tabular-nums">
                  {room.participants.host.diffSum}
                </span>
                <span className="text-[9px] text-zinc-500 block">فارق إجمالي</span>
              </div>

              <div className="text-center px-3 py-1 bg-black/60 rounded-xl border border-amber-500/30">
                <div className="text-[10px] text-amber-400 font-chakra font-bold">
                  الجولة {room.currentRoundIndex + 1} / {room.totalRounds}
                </div>
                <div className="text-sm font-chakra font-black text-white mt-0.5">
                  مركز: <span className="text-amber-300">{currentPos}</span>
                </div>
              </div>

              <div className="text-center">
                <span className="text-[10px] text-zinc-400 block font-tajawal">{room.participants.guest?.name}</span>
                <span className="font-chakra font-black text-zinc-200 text-xl tabular-nums">
                  {room.participants.guest?.diffSum ?? 0}
                </span>
                <span className="text-[9px] text-zinc-500 block">فارق إجمالي</span>
              </div>
            </div>

            {/* Question Card */}
            <div className="bg-[#12141a] rounded-2xl border border-amber-500/40 p-4 shadow-xl space-y-3">
              <div className="flex items-center justify-between text-xs text-zinc-400 font-chakra pb-2 border-b border-zinc-800">
                <span className="text-amber-400 font-bold font-tajawal">{room.currentQuestion.category}</span>
                <span>الموسم: {room.currentQuestion.season}</span>
              </div>

              <div className="flex items-center gap-3 bg-black/40 p-3 rounded-xl border border-zinc-800">
                <div className="w-14 h-14 rounded-full overflow-hidden border border-amber-400/50 bg-zinc-800 shrink-0">
                  {room.currentQuestion.playerImage ? (
                    <img
                      src={room.currentQuestion.playerImage}
                      alt={room.currentQuestion.player}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-top"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-amber-400">
                      {room.currentQuestion.position}
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-bold text-base font-tajawal text-zinc-100">
                    {room.currentQuestion.player}
                  </h4>
                  <p className="text-xs text-amber-400/80 font-tajawal">
                    {room.currentQuestion.statisticType}
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 text-right">
                <p className="text-sm font-tajawal text-zinc-200 font-medium leading-relaxed">
                  {room.currentQuestion.question}
                </p>
              </div>

              {/* Submitting Answer */}
              {room.phase === 'QUESTION_ACTIVE' && (
                <div className="space-y-3 pt-2">
                  {myParticipant?.currentAnswer === null || myParticipant?.currentAnswer === undefined ? (
                    <div className="space-y-2">
                      <label className="text-xs text-zinc-400 block font-tajawal">أدخل إجابتك السرية:</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={answerInput}
                          onChange={e => setAnswerInput(e.target.value)}
                          placeholder="أدخل رقماً..."
                          className="flex-1 bg-black/60 border border-amber-500/40 rounded-xl px-4 py-3 text-lg font-chakra font-bold text-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-400 text-center"
                        />
                        <GoldButton
                          onClick={handleSubmitAnswer}
                          disabled={!answerInput.trim() || submitting}
                        >
                          تأكيد
                        </GoldButton>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-center space-y-1">
                      <p className="text-xs font-bold font-tajawal text-amber-300">
                        ✓ تم تسجيل إجابتك بنجاح على الخادم!
                      </p>
                      <p className="text-[11px] text-zinc-400 font-tajawal">
                        في انتظار إجابة المنافس لكشف النتيجة في نفس اللحظة...
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Both Answered -> Reveal */}
              {room.phase === 'ANSWER_REVEAL' && (
                <div className="space-y-3 pt-2 border-t border-zinc-800">
                  <div className="bg-amber-500/15 border border-amber-500/40 rounded-xl p-3 text-center">
                    <span className="text-[11px] text-amber-400 font-tajawal block">الإجابة الإحصائية الدقيقة:</span>
                    <span className="font-chakra font-black text-3xl text-amber-300 tabular-nums">
                      {room.currentQuestion.correctAnswer}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-center text-xs font-tajawal">
                    <div className="bg-zinc-900 p-2.5 rounded-xl border border-zinc-800">
                      <p className="text-zinc-400">{room.participants.host.name}:</p>
                      <p className="font-chakra font-bold text-lg text-white mt-0.5">
                        {room.participants.host.currentAnswer}
                      </p>
                    </div>
                    <div className="bg-zinc-900 p-2.5 rounded-xl border border-zinc-800">
                      <p className="text-zinc-400">{room.participants.guest?.name}:</p>
                      <p className="font-chakra font-bold text-lg text-white mt-0.5">
                        {room.participants.guest?.currentAnswer}
                      </p>
                    </div>
                  </div>

                  {room.lastRoundLoserReward && (
                    <div className="p-3 rounded-xl bg-zinc-900/90 border border-amber-500/30 text-center text-xs font-tajawal text-zinc-300">
                      🎁 جائزة الخاسر (مركز {currentPos}): حصل المنافس على اللاعب{' '}
                      <span className="font-bold text-white">
                        {room.lastRoundLoserReward.player.name} ({room.lastRoundLoserReward.player.ovr} OVR)
                      </span>!
                    </div>
                  )}

                  {isHost && (
                    <GoldButton onClick={handleAdvanceRound} fullWidth size="lg">
                      الانتقال للجولة التالية
                    </GoldButton>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= 3. ONLINE SANTRA ================= */}
        {room.gameId === 'santra' && (room.phase === 'MYSTERY_SELECTION' || room.phase === 'MYSTERY_REVEAL') && (
          <div className="space-y-4">
            <div className="bg-zinc-900/90 rounded-2xl p-3 border border-zinc-800 flex items-center justify-between text-center">
              <div>
                <span className="text-[10px] text-zinc-400 font-tajawal block">{room.participants.host.name}</span>
                <span className="font-chakra font-bold text-amber-400 text-xs">
                  {room.participants.host.squad.length} لاعبين
                </span>
              </div>

              <div className="px-3 py-1 bg-black/60 rounded-xl border border-amber-500/30">
                <div className="text-[10px] text-amber-400 font-chakra font-bold">
                  الجولة {room.currentRoundIndex + 1} / {room.totalRounds}
                </div>
                <div className="text-sm font-chakra font-black text-white mt-0.5">
                  مركز: <span className="text-amber-300">{currentPos}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-zinc-400 font-tajawal block">{room.participants.guest?.name}</span>
                <span className="font-chakra font-bold text-zinc-300 text-xs">
                  {room.participants.guest?.squad.length} لاعبين
                </span>
              </div>
            </div>

            {/* Boxes */}
            <div className="grid grid-cols-2 gap-3">
              {[0, 1, 2, 3].map(boxIdx => {
                const isSelectedByMe = myParticipant?.currentBoxSelection === boxIdx;
                const isSelectedByOpponent = opponentParticipant?.currentBoxSelection === boxIdx;
                const isRevealed = room.phase === 'MYSTERY_REVEAL';
                const clubName = room.currentRoundClubs?.[boxIdx] || 'Mystery';

                return (
                  <div
                    key={boxIdx}
                    onClick={() => {
                      if (!isRevealed) handleSelectBox(boxIdx);
                    }}
                    className={`relative aspect-[4/3] rounded-2xl p-3 border transition-all duration-200 cursor-pointer flex flex-col items-center justify-center select-none shadow-xl ${
                      isRevealed
                        ? isSelectedByMe || isSelectedByOpponent
                          ? 'border-amber-400 bg-zinc-900'
                          : 'border-zinc-800 opacity-40'
                        : isSelectedByMe
                        ? 'border-amber-400 bg-amber-500/10'
                        : 'border-amber-500/30 bg-[#181a20] hover:border-amber-400 active:scale-95'
                    }`}
                  >
                    {!isRevealed ? (
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-b from-amber-400/20 to-amber-600/10 border border-amber-500/40 flex items-center justify-center">
                          <HelpCircle className="w-6 h-6 text-amber-400" />
                        </div>
                        <span className="font-chakra font-bold text-xs text-amber-300">
                          BOX #{boxIdx + 1}
                        </span>
                        {isSelectedByMe && (
                          <span className="text-[9px] bg-amber-500 text-black font-bold px-1.5 py-0.5 rounded font-tajawal">
                            اختيارك
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="text-center space-y-1">
                        <span className="text-xs font-bold font-tajawal text-white">{clubName}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Live 2D pitch formation in Online SANTRA */}
            <SantraLivePitch
              mode={room.mode}
              currentRoundPosition={currentPos}
              player1Name={room.participants.host.name}
              player2Name={room.participants.guest?.name || 'الضيف'}
              p1Squad={room.participants.host.squad}
              p2Squad={room.participants.guest?.squad || []}
              activeTurn={isHost ? 'p1' : 'p2'}
            />

            {room.phase === 'MYSTERY_REVEAL' && isHost && (
              <GoldButton onClick={handleAdvanceRound} fullWidth size="lg">
                الانتقال للمركز التالي
              </GoldButton>
            )}
          </div>
        )}

        {/* ================= 4. SQUAD COMPARISON & SIMULATION ================= */}
        {(room.phase === 'SQUAD_COMPARISON' || room.phase === 'SIMULATION' || room.phase === 'MATCH_FINISHED') && (
          <div className="space-y-4">
            <div className="bg-zinc-900/90 rounded-2xl p-4 border border-amber-500/40 text-center space-y-2">
              <h3 className="text-lg font-bold font-tajawal text-white">
                اكتملت تشكيلات الفريقين! جاهز للمحاكاة
              </h3>
              {room.matchAdvantage && (
                <div className="p-2 rounded-lg bg-amber-500/15 border border-amber-500/30 text-xs font-tajawal text-amber-300">
                  ⭐ أفضلية 1 - 0 ممنوحة للمتصدر في التوقعات الإحصائية!
                </div>
              )}
            </div>

            <GoldButton onClick={() => setShowSimScreen(true)} fullWidth size="lg">
              <Trophy className="w-4 h-4 fill-black" />
              انطلاق شاشة محاكاة المباراة (2D)
            </GoldButton>
          </div>
        )}
      </div>

      {showSimScreen && (
        <MatchSimulationScreen
          team1Name={room.participants.host.name}
          team2Name={room.participants.guest?.name || 'الضيف'}
          team1Squad={room.participants.host.squad}
          team2Squad={room.participants.guest?.squad || []}
          advantageGoalsTeam1={room.matchAdvantage?.leaderId === room.hostId ? 1 : 0}
          advantageGoalsTeam2={room.matchAdvantage && room.matchAdvantage.leaderId !== room.hostId ? 1 : 0}
          onFinishMatch={(winner, coins) => {
            if (winner === 'team1' && isHost) onMatchWin(coins);
            if (winner === 'team2' && isGuest) onMatchWin(coins);
            finishRoomMatch(roomCode, winner === 'team1' ? 2 : 1, winner === 'team2' ? 2 : 1);
          }}
          onClose={() => {
            setShowSimScreen(false);
            onLeave();
          }}
        />
      )}
    </div>
  );
};
