import React, { useState, useEffect, useRef } from 'react';
import {
  OnlineRoomState,
  UserProfile,
  QuickChatMessageItem,
  QuickChatCategory,
  RoomTimerDuration,
} from '../../types/game';
import {
  fetchRoomState,
  subscribeToRoomUpdates,
  setRoomReady,
  updateRoomGame,
  sendStatAnswer,
  sendSantraBox,
  advanceRoomRound,
  finishRoomMatch,
  leaveOnlineRoom,
  startRoomByHost,
  sendRoomQuickChatMessage,
  fetchStoreCatalogAndMessages,
} from '../../services/roomApi';
import { copyAccountIdToClipboard } from '../../services/storage';
import { GoldButton } from '../common/GoldButton';
import { MatchSimulationScreen } from '../games/simulation/MatchSimulationScreen';
import { SantraLivePitch } from '../games/santra/SantraLivePitch';
import { sounds } from '../../services/audio';
import {
  Copy,
  Check,
  ArrowRight,
  HelpCircle,
  Trophy,
  AlertCircle,
  WifiOff,
  MessageSquare,
  Volume2,
  VolumeX,
  Clock,
  Lock,
  Send,
  X,
  Users,
  Shield,
} from 'lucide-react';

interface OnlineMatchRoomProps {
  roomCode: string;
  userProfile: UserProfile;
  onLeave: () => void;
  onMatchWin: (coins: number) => void;
}

const CHAT_CATEGORIES: { id: QuickChatCategory | 'ALL'; labelAr: string }[] = [
  { id: 'ALL', labelAr: 'الكل' },
  { id: 'SALAM', labelAr: 'سلام' },
  { id: 'FUN', labelAr: 'هزار' },
  { id: 'TAUNT', labelAr: 'غيظ' },
  { id: 'CHALLENGE', labelAr: 'تحدي' },
  { id: 'LATE', labelAr: 'تأخير' },
  { id: 'LUCK', labelAr: 'حظ' },
  { id: 'GOOD_PLAYER', labelAr: 'لاعب قوي' },
  { id: 'BAD_PLAYER', labelAr: 'لاعب ضعيف' },
  { id: 'CELEBRATION', labelAr: 'احتفال' },
  { id: 'CONFIDENCE', labelAr: 'ثقة' },
  { id: 'RESPECT', labelAr: 'احترام' },
];

function formatDigitalSeconds(sec: number): string {
  const clean = Math.max(0, Math.floor(sec));
  const mm = Math.floor(clean / 60)
    .toString()
    .padStart(2, '0');
  const ss = (clean % 60).toString().padStart(2, '0');
  return `${mm}:${ss}`;
}

export const OnlineMatchRoom: React.FC<OnlineMatchRoomProps> = ({
  roomCode,
  userProfile,
  onLeave,
  onMatchWin,
}) => {
  const [room, setRoom] = useState<OnlineRoomState | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [answerInput, setAnswerInput] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [showSimScreen, setShowSimScreen] = useState(false);

  // Server-Side Timer State
  const [remainingSeconds, setRemainingSeconds] = useState<number>(30);
  const autoSubmittedRoundRef = useRef<number>(-1);

  // Quick Chat & Mute State
  const [showChatDrawer, setShowChatDrawer] = useState(false);
  const [selectedChatCat, setSelectedChatCat] = useState<QuickChatCategory | 'ALL'>('ALL');
  const [chatCatalog, setChatCatalog] = useState<QuickChatMessageItem[]>([]);
  const [opponentMuted, setOpponentMuted] = useState(false);
  const [chatCooldownSec, setChatCooldownSec] = useState(0);
  const [chatBannerError, setChatBannerError] = useState<string | null>(null);

  // Load Quick Chat Catalog
  useEffect(() => {
    fetchStoreCatalogAndMessages().then((data) => {
      if (data.chatMessages) {
        setChatCatalog(data.chatMessages);
      }
    });
  }, []);

  // Subscribe to real-time room updates via SSE & Polling
  useEffect(() => {
    let active = true;

    fetchRoomState(roomCode)
      .then((initialState) => {
        if (active) setRoom(initialState);
      })
      .catch((err) => {
        if (active) setErrorMsg(err.message || 'فشل تحميل بيانات الغرفة');
      });

    const unsubscribe = subscribeToRoomUpdates(
      roomCode,
      (updatedState) => {
        if (active) {
          setRoom(updatedState);
          setErrorMsg(null);
        }
      },
      () => {
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

  // Server-Side Round Timer + Chat Cooldown Ticker
  useEffect(() => {
    const tick = () => {
      const now = Date.now();

      // 1. Round Timer from room.roundDeadlineAt
      if (
        room &&
        (room.phase === 'QUESTION_ACTIVE' || room.phase === 'MYSTERY_SELECTION') &&
        room.roundDeadlineAt
      ) {
        const secLeft = Math.max(0, Math.ceil((room.roundDeadlineAt - now) / 1000));
        setRemainingSeconds(secLeft);

        // Auto-stop at 00:00 if player hasn't submitted yet
        if (
          secLeft <= 0 &&
          autoSubmittedRoundRef.current !== room.currentRoundIndex &&
          myParticipant
        ) {
          autoSubmittedRoundRef.current = room.currentRoundIndex;
          if (
            room.gameId === 'stat_arena' &&
            (myParticipant.currentAnswer === null || myParticipant.currentAnswer === undefined)
          ) {
            sendStatAnswer(roomCode, userProfile.id, Number(answerInput) || 0).catch(() => {});
          } else if (
            room.gameId === 'santra' &&
            (myParticipant.currentBoxSelection === null ||
              myParticipant.currentBoxSelection === undefined)
          ) {
            sendSantraBox(roomCode, userProfile.id, 0).catch(() => {});
          }
        }
      } else if (room) {
        setRemainingSeconds(room.timerSeconds || 30);
      }

      // 2. Chat 15-Second Cooldown
      if (myParticipant?.lastMessageAt) {
        const elapsed = now - myParticipant.lastMessageAt;
        if (elapsed < 15000) {
          setChatCooldownSec(Math.ceil((15000 - elapsed) / 1000));
        } else {
          setChatCooldownSec(0);
        }
      } else {
        setChatCooldownSec(0);
      }
    };

    tick();
    const interval = setInterval(tick, 300);
    return () => clearInterval(interval);
  }, [room, myParticipant, answerInput, roomCode, userProfile.id]);

  const handleCopyCode = async () => {
    await copyAccountIdToClipboard(roomCode);
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

  const handleChangeSettings = async (params: {
    gameId?: 'stat_arena' | 'santra';
    mode?: 'quick_five' | 'full_eleven';
    timerSeconds?: RoomTimerDuration;
    chatEnabled?: boolean;
  }) => {
    if (!isHost || !room) return;
    try {
      sounds.playTap();
      await updateRoomGame(
        roomCode,
        userProfile.id,
        params.gameId || room.gameId,
        params.mode || room.mode,
        params.timerSeconds || room.timerSeconds,
        params.chatEnabled !== undefined ? params.chatEnabled : room.chatEnabled
      );
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'فشل تحديث إعدادات الغرفة');
    }
  };

  const handleSubmitAnswer = async () => {
    if (remainingSeconds <= 0) return;
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
    if (remainingSeconds <= 0) return;
    if (
      myParticipant?.currentBoxSelection !== null &&
      myParticipant?.currentBoxSelection !== undefined
    )
      return;
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

  const handleSendQuickChat = async (msg: QuickChatMessageItem) => {
    if (!room || !room.chatEnabled) return;
    setChatBannerError(null);
    try {
      sounds.playTap();
      await sendRoomQuickChatMessage(roomCode, userProfile.id, msg.id);
      setShowChatDrawer(false);
    } catch (err: unknown) {
      sounds.playWrong();
      setChatBannerError(err instanceof Error ? err.message : 'تعذر إرسال الرسالة');
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
          <h3 className="text-base font-bold text-white">تعذر الاتصال بالغرفة</h3>
          <p className="text-xs text-zinc-400">{errorMsg}</p>
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
          <p className="text-xs text-zinc-400">جاري مزامنة بيانات الغرفة من الخادم...</p>
        </div>
      </div>
    );
  }

  const currentPos = room.positionOrder[room.currentRoundIndex];
  const isWaitingLobby = room.phase === 'WAITING' || room.phase === 'PLAYER_2_JOINED' || room.phase === 'READY';
  const isPlayingRound =
    room.phase === 'QUESTION_ACTIVE' ||
    room.phase === 'ANSWER_REVEAL' ||
    room.phase === 'MYSTERY_SELECTION' ||
    room.phase === 'MYSTERY_REVEAL';

  const ownedChatSet = new Set(userProfile.ownedChatIds || []);
  const messagesSent = myParticipant?.messagesSentCount || 0;
  const messagesRemaining = Math.max(0, 6 - messagesSent);

  const visibleChatEvents = (room.chatMessages || []).filter((ev) => {
    if (opponentMuted && ev.senderId !== userProfile.id) return false;
    return true;
  });
  const latestChatEvent = visibleChatEvents[visibleChatEvents.length - 1];

  const filteredCatalog = chatCatalog.filter((m) => {
    if (selectedChatCat !== 'ALL' && m.category !== selectedChatCat) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#08080a] text-zinc-100 pb-24 select-none">
      {/* Sticky Room Top Bar */}
      <div className="sticky top-0 z-30 bg-[#0a0b0e]/95 backdrop-blur-md border-b border-zinc-800 px-4 py-3 flex items-center justify-between gap-2">
        <button
          onClick={handleLeave}
          className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 font-bold"
        >
          <ArrowRight className="w-4 h-4" />
          <span>مغادرة الغرفة</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="font-chakra font-black text-amber-400 tracking-wider">
            #{room.code}
          </span>
          <button
            onClick={handleCopyCode}
            className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white"
            title="نسخ كود الغرفة"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Chat & Mute Controls (Only if room.chatEnabled is ON) */}
        {room.chatEnabled ? (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                sounds.playTap();
                setOpponentMuted((v) => !v);
              }}
              className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-black flex items-center gap-1 transition-all ${
                opponentMuted
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                  : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:text-white'
              }`}
            >
              {opponentMuted ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>🔊 إلغاء الكتم</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-zinc-400" />
                  <span>🔇</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                sounds.playTap();
                setShowChatDrawer((v) => !v);
              }}
              className="px-2.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 text-xs font-black flex items-center gap-1.5 transition-all"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>💬</span>
              <span className="font-chakra text-[11px]">({messagesRemaining}/6)</span>
            </button>
          </div>
        ) : (
          <div className="text-[11px] text-zinc-500 font-bold">الشات مغلق</div>
        )}
      </div>

      <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Room Flow Status Stepper */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl px-3 py-2 flex items-center justify-between text-[10px] font-black text-zinc-400 overflow-x-auto gap-2">
          <span className={room.phase === 'WAITING' ? 'text-amber-400' : 'text-emerald-400'}>
            1. WAITING
          </span>
          <span>→</span>
          <span
            className={
              room.phase === 'PLAYER_2_JOINED'
                ? 'text-amber-400'
                : room.participants.guest
                ? 'text-emerald-400'
                : ''
            }
          >
            2. PLAYER 2 JOINED
          </span>
          <span>→</span>
          <span
            className={
              room.participants.host.ready && room.participants.guest?.ready
                ? 'text-emerald-400'
                : ''
            }
          >
            3. READY
          </span>
          <span>→</span>
          <span className={isPlayingRound ? 'text-amber-400' : ''}>4. PLAYING</span>
          <span>→</span>
          <span className={room.phase === 'MATCH_FINISHED' ? 'text-emerald-400' : ''}>
            5. RESULT
          </span>
        </div>

        {/* Live Quick Chat Floating Toast */}
        {room.chatEnabled && latestChatEvent && (
          <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/20 via-zinc-900 to-zinc-950 border border-amber-400/50 flex items-center justify-between gap-3 shadow-lg animate-fade-in">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-amber-300">
                💬 {latestChatEvent.senderName}:
              </span>
              <span className="text-xs font-bold text-white">{latestChatEvent.textAr}</span>
            </div>
            <span className="text-[10px] text-zinc-500">الآن</span>
          </div>
        )}

        {/* Opponent Disconnection Warning */}
        {opponentParticipant && !opponentParticipant.connected && (
          <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-600/50 flex items-center gap-2 text-xs text-amber-200 shadow-lg animate-pulse">
            <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
            <span>اللاعب المنافس غير متصل حالياً. بانتظار عودته...</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-500/40 text-xs text-rose-200 font-bold">
            {errorMsg}
          </div>
        )}

        {/* ================= 1. WAITING & PLAYER 2 JOINED & READY LOBBY ================= */}
        {isWaitingLobby && (
          <div className="space-y-4">
            {/* Room Code Card */}
            <div className="bg-gradient-to-b from-zinc-900 to-zinc-950 rounded-3xl p-5 border-2 border-amber-500/40 text-center space-y-3 shadow-xl">
              <div className="text-xs font-bold text-zinc-400">
                {room.roomType === 'PRIVATE' ? '🔒 غرفة خاصة — كود الدعوة:' : '🌐 غرفة عامة — كود الغرفة:'}
              </div>
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-black/85 border border-amber-500/50 shadow-inner">
                <span className="font-chakra font-black text-3xl tracking-widest text-amber-400">
                  {room.code}
                </span>
                <button
                  onClick={handleCopyCode}
                  className="px-3 py-1.5 rounded-xl bg-zinc-800 text-xs font-black text-amber-300 hover:bg-zinc-700"
                >
                  {copied ? 'تم النسخ ✓' : '📋 نسخ'}
                </button>
              </div>
              <div className="text-[11px] text-zinc-400">
                مؤقت الجولة: <strong className="text-white">{room.timerSeconds} ثانية</strong> · الشات:{' '}
                <strong className="text-white">{room.chatEnabled ? 'ON (مفعل)' : 'OFF (مغلق)'}</strong>
              </div>
            </div>

            {/* PLAYER 1 VS PLAYER 2 */}
            <div className="bg-zinc-900/95 border border-amber-500/30 rounded-3xl p-5 space-y-4">
              <div className="text-center text-xs font-black text-amber-400 tracking-wider uppercase">
                PLAYER 1 VS PLAYER 2 (مواجهة ثنائية حقيقية فقط)
              </div>

              <div className="grid grid-cols-3 items-center gap-2 text-center">
                {/* Player 1 (Host) */}
                <div className="bg-zinc-950 rounded-2xl p-3.5 border border-zinc-800 space-y-1.5">
                  <span className="text-[10px] text-amber-400 font-black block">PLAYER 1</span>
                  <p className="font-black text-sm text-white truncate">
                    {room.participants.host.name}
                  </p>
                  <span
                    className={`inline-block text-[10px] px-2.5 py-0.5 rounded-lg font-black ${
                      room.participants.host.ready
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-zinc-900 text-zinc-400'
                    }`}
                  >
                    {room.participants.host.ready ? 'جاهز ✓' : 'غير جاهز'}
                  </span>
                </div>

                {/* VS Emblem */}
                <div className="flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-zinc-950 font-chakra font-black text-lg flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.4)]">
                    VS
                  </div>
                </div>

                {/* Player 2 (Guest) */}
                <div className="bg-zinc-950 rounded-2xl p-3.5 border border-zinc-800 space-y-1.5">
                  <span className="text-[10px] text-sky-400 font-black block">PLAYER 2</span>
                  <p className="font-black text-sm text-white truncate">
                    {room.participants.guest ? room.participants.guest.name : 'بانتظار اللاعب 2...'}
                  </p>
                  <span
                    className={`inline-block text-[10px] px-2.5 py-0.5 rounded-lg font-black ${
                      room.participants.guest?.ready
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-zinc-900 text-zinc-500'
                    }`}
                  >
                    {room.participants.guest
                      ? room.participants.guest.ready
                        ? 'جاهز ✓'
                        : 'غير جاهز'
                      : 'WAITING'}
                  </span>
                </div>
              </div>
            </div>

            {/* Host Room Settings */}
            {isHost && (
              <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800 space-y-3">
                <label className="text-xs font-black text-amber-400 block">
                  إعدادات الغرفة (المضيف فقط):
                </label>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleChangeSettings({ gameId: 'stat_arena' })}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-chakra font-black transition-all ${
                      room.gameId === 'stat_arena'
                        ? 'border-amber-400 bg-amber-500/15 text-amber-300'
                        : 'border-zinc-800 bg-black/40 text-zinc-400'
                    }`}
                  >
                    STAT ARENA
                  </button>
                  <button
                    onClick={() => handleChangeSettings({ gameId: 'santra' })}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-chakra font-black transition-all ${
                      room.gameId === 'santra'
                        ? 'border-amber-400 bg-amber-500/15 text-amber-300'
                        : 'border-zinc-800 bg-black/40 text-zinc-400'
                    }`}
                  >
                    SANTRA 3D
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {([15, 30, 45, 60] as RoomTimerDuration[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => handleChangeSettings({ timerSeconds: t })}
                      className={`py-2 rounded-xl border text-xs font-chakra font-black transition-all ${
                        room.timerSeconds === t
                          ? 'border-amber-400 bg-amber-500 text-zinc-950'
                          : 'border-zinc-800 bg-zinc-950 text-zinc-400'
                      }`}
                    >
                      {t}s
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* READY BUTTON (No Bot option — strictly 2 Real Players) */}
            <div className="space-y-2.5">
              {!room.participants.guest ? (
                <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-center text-xs text-zinc-400 font-bold">
                  في انتظار انضمام اللاعب الثاني (Player 2) إلى الغرفة لتفعيل زر [ جاهز ]...
                </div>
              ) : (
                <GoldButton onClick={handleToggleReady} fullWidth size="lg">
                  {myParticipant?.ready ? 'إلغاء الاستعداد' : '[ جاهز ] • أنا مستعد للمباراة'}
                </GoldButton>
              )}

              {isHost &&
                room.participants.guest &&
                room.participants.host.ready &&
                room.participants.guest.ready && (
                  <button
                    onClick={async () => {
                      try {
                        sounds.playWhistle();
                        await startRoomByHost(roomCode, userProfile.id);
                      } catch (err: unknown) {
                        setErrorMsg(err instanceof Error ? err.message : 'فشل بدء المباراة');
                      }
                    }}
                    className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-sm shadow-lg transition-all"
                  >
                    ⚡ بدء المباراة الآن (GAME START)
                  </button>
                )}
            </div>
          </div>
        )}

        {/* ================= SERVER-SIDE DIGITAL TIMER BAR DURING ACTIVE ROUNDS ================= */}
        {isPlayingRound && (
          <div className="bg-zinc-900/95 border-2 border-amber-500/40 rounded-2xl px-4 py-3 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-2">
              <Clock
                className={`w-5 h-5 ${
                  remainingSeconds <= 5 ? 'text-rose-400 animate-bounce' : 'text-amber-400'
                }`}
              />
              <div>
                <div className="text-[10px] font-bold text-zinc-400">مؤقت الجولة (Server Timer)</div>
                <div className="text-xs font-black text-white">
                  الجولة {room.currentRoundIndex + 1} من {room.totalRounds} · مركز {currentPos}
                </div>
              </div>
            </div>

            <div
              className={`font-chakra text-2xl font-black px-3.5 py-1 rounded-xl border tabular-nums ${
                remainingSeconds <= 5
                  ? 'bg-rose-950/80 border-rose-500 text-rose-300'
                  : 'bg-zinc-950 border-amber-500/40 text-amber-400'
              }`}
            >
              {formatDigitalSeconds(remainingSeconds)}
            </div>
          </div>
        )}

        {/* ================= 2. ONLINE STAT ARENA ================= */}
        {room.gameId === 'stat_arena' &&
          (room.phase === 'QUESTION_ACTIVE' || room.phase === 'ANSWER_REVEAL') &&
          room.currentQuestion && (
            <div className="space-y-4">
              {/* Scoreboard */}
              <div className="bg-zinc-900/90 rounded-2xl p-3 border border-zinc-800 flex items-center justify-between">
                <div className="text-center">
                  <span className="text-[10px] text-zinc-400 block">
                    {room.participants.host.name}
                  </span>
                  <span className="font-chakra font-black text-amber-400 text-xl tabular-nums">
                    {room.participants.host.diffSum}
                  </span>
                  <span className="text-[9px] text-zinc-500 block">فارق إجمالي</span>
                </div>

                <div className="text-center px-3 py-1 bg-black/60 rounded-xl border border-amber-500/30">
                  <div className="text-xs font-chakra font-black text-amber-300">VS</div>
                </div>

                <div className="text-center">
                  <span className="text-[10px] text-zinc-400 block">
                    {room.participants.guest?.name}
                  </span>
                  <span className="font-chakra font-black text-zinc-200 text-xl tabular-nums">
                    {room.participants.guest?.diffSum ?? 0}
                  </span>
                  <span className="text-[9px] text-zinc-500 block">فارق إجمالي</span>
                </div>
              </div>

              {/* Question Card */}
              <div className="bg-[#12141a] rounded-2xl border border-amber-500/40 p-4 shadow-xl space-y-3">
                <div className="flex items-center justify-between text-xs text-zinc-400 pb-2 border-b border-zinc-800">
                  <span className="text-amber-400 font-bold">{room.currentQuestion.category}</span>
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
                    <h4 className="font-bold text-base text-zinc-100">
                      {room.currentQuestion.player}
                    </h4>
                    <p className="text-xs text-amber-400/80">
                      {room.currentQuestion.statisticType}
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 text-right">
                  <p className="text-sm text-zinc-200 font-medium leading-relaxed">
                    {room.currentQuestion.question}
                  </p>
                </div>

                {/* Submitting Answer */}
                {room.phase === 'QUESTION_ACTIVE' && (
                  <div className="space-y-3 pt-2">
                    {myParticipant?.currentAnswer === null ||
                    myParticipant?.currentAnswer === undefined ? (
                      <div className="space-y-2">
                        <label className="text-xs text-zinc-400 block">
                          أدخل إجابتك قبل انتهاء المؤقت ({formatDigitalSeconds(remainingSeconds)}):
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            disabled={remainingSeconds <= 0}
                            value={answerInput}
                            onChange={(e) => setAnswerInput(e.target.value)}
                            placeholder="أدخل رقماً..."
                            className="flex-1 bg-black/60 border border-amber-500/40 rounded-xl px-4 py-3 text-lg font-chakra font-bold text-amber-300 focus:outline-none text-center"
                          />
                          <GoldButton
                            onClick={handleSubmitAnswer}
                            disabled={!answerInput.trim() || submitting || remainingSeconds <= 0}
                          >
                            تأكيد
                          </GoldButton>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-center space-y-1">
                        <p className="text-xs font-bold text-amber-300">
                          ✓ تم تسجيل إجابتك بنجاح على الخادم!
                        </p>
                        <p className="text-[11px] text-zinc-400">
                          بانتظار إجابة المنافس لكشف النتيجة...
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Both Answered -> Reveal */}
                {room.phase === 'ANSWER_REVEAL' && (
                  <div className="space-y-3 pt-2 border-t border-zinc-800">
                    <div className="bg-amber-500/15 border border-amber-500/40 rounded-xl p-3 text-center">
                      <span className="text-[11px] text-amber-400 block">
                        الإجابة الإحصائية الدقيقة:
                      </span>
                      <span className="font-chakra font-black text-3xl text-amber-300 tabular-nums">
                        {room.currentQuestion.correctAnswer}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-center text-xs">
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

        {/* ================= 3. ONLINE SANTRA (3 MYSTERY BOXES) ================= */}
        {room.gameId === 'santra' &&
          (room.phase === 'MYSTERY_SELECTION' || room.phase === 'MYSTERY_REVEAL') && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {[0, 1, 2].map((boxIdx) => {
                  const isSelectedByMe = myParticipant?.currentBoxSelection === boxIdx;
                  const isSelectedByOpponent = opponentParticipant?.currentBoxSelection === boxIdx;
                  const isRevealed = room.phase === 'MYSTERY_REVEAL';
                  const clubName = room.currentRoundClubs?.[boxIdx] || 'Mystery Club';

                  return (
                    <div
                      key={boxIdx}
                      onClick={() => {
                        if (!isRevealed && remainingSeconds > 0) handleSelectBox(boxIdx);
                      }}
                      className={`relative aspect-square rounded-2xl p-3 border-2 transition-all duration-200 cursor-pointer flex flex-col items-center justify-center select-none shadow-xl ${
                        isRevealed
                          ? isSelectedByMe || isSelectedByOpponent
                            ? 'border-amber-400 bg-zinc-900'
                            : 'border-zinc-800 opacity-45'
                          : isSelectedByMe
                          ? 'border-amber-400 bg-amber-500/15'
                          : 'border-amber-500/35 bg-[#181a20] hover:border-amber-400 active:scale-95'
                      }`}
                    >
                      {!isRevealed ? (
                        <div className="flex flex-col items-center justify-center space-y-2 text-center">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-b from-amber-400/20 to-amber-600/10 border border-amber-500/40 flex items-center justify-center">
                            <HelpCircle className="w-6 h-6 text-amber-400" />
                          </div>
                          <span className="font-chakra font-black text-xs text-amber-300">
                            BOX #{boxIdx + 1}
                          </span>
                          {isSelectedByMe && (
                            <span className="text-[10px] font-black text-emerald-300">
                              ✓ اختيارك
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="text-center space-y-1">
                          <Shield className="w-6 h-6 text-amber-400 mx-auto" />
                          <span className="text-xs font-black text-white block">{clubName}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <SantraLivePitch
                mode={room.mode}
                currentRoundPosition={currentPos}
                player1Name={room.participants.host.name}
                player2Name={room.participants.guest?.name || 'Player 2'}
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

        {/* ================= 4. SQUAD COMPARISON & SIMULATION & COMPLETED ================= */}
        {(room.phase === 'SQUAD_COMPARISON' ||
          room.phase === 'SIMULATION' ||
          room.phase === 'MATCH_FINISHED' ||
          room.phase === 'COMPLETED') && (
          <div className="space-y-4">
            <div className="bg-zinc-900/90 rounded-2xl p-5 border border-amber-500/40 text-center space-y-2">
              <h3 className="text-lg font-black text-white">
                اكتملت تشكيلات الفريقين! جاهز لحسم النتيجة
              </h3>
              {room.simulationResult && (
                <div className="py-2 font-chakra text-2xl font-black text-amber-400">
                  {room.participants.host.name} {room.simulationResult.hostGoals} -{' '}
                  {room.simulationResult.guestGoals} {room.participants.guest?.name}
                </div>
              )}
            </div>

            <GoldButton onClick={() => setShowSimScreen(true)} fullWidth size="lg">
              <Trophy className="w-4 h-4 fill-black" />
              انطلاق شاشة محاكاة المباراة والنتيجة النهائية
            </GoldButton>
          </div>
        )}
      </div>

      {/* ================= QUICK CHAT DRAWER MODAL (💬) ================= */}
      {room.chatEnabled && showChatDrawer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
          <div className="w-full max-w-lg bg-zinc-900 border-t-2 sm:border-2 border-amber-500/40 rounded-t-3xl sm:rounded-3xl p-5 space-y-4 max-h-[82vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <span>💬 رسائل المباراة السريعة (Quick Chat)</span>
                </h3>
                <p className="text-[11px] text-zinc-400">
                  المتبقي لك في المباراة: <strong className="text-amber-400">{messagesRemaining} / 6</strong> · المهلة بين الرسائل: 15 ثانية
                </p>
              </div>
              <button
                onClick={() => setShowChatDrawer(false)}
                className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {chatCooldownSec > 0 && (
              <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-black text-center">
                ⏳ يرجى الانتظار {chatCooldownSec} ثانية قبل إرسال الرسالة التالية
              </div>
            )}

            {chatBannerError && (
              <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs font-bold text-center">
                {chatBannerError}
              </div>
            )}

            {/* Category Filter Bar */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {CHAT_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedChatCat(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black shrink-0 transition-all ${
                    selectedChatCat === cat.id
                      ? 'bg-amber-500 text-zinc-950'
                      : 'bg-zinc-950 text-zinc-400 border border-zinc-800 hover:text-white'
                  }`}
                >
                  {cat.labelAr}
                </button>
              ))}
            </div>

            {/* Messages Grid from Player's Collection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 overflow-y-auto pr-1 flex-1">
              {filteredCatalog.map((msg) => {
                const isOwned = Boolean(msg.isStarterOwned || ownedChatSet.has(msg.id));
                const disabled = !isOwned || messagesRemaining <= 0 || chatCooldownSec > 0;
                return (
                  <button
                    key={msg.id}
                    disabled={disabled}
                    onClick={() => handleSendQuickChat(msg)}
                    className={`p-3 rounded-2xl border text-right flex items-center justify-between gap-2 transition-all ${
                      isOwned
                        ? 'bg-zinc-950 hover:bg-zinc-800 border-amber-500/35 text-white cursor-pointer'
                        : 'bg-zinc-950/40 border-zinc-800/70 text-zinc-500 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-black">{msg.textAr}</div>
                      <div className="text-[10px] text-zinc-400 mt-0.5">{msg.categoryLabelAr}</div>
                    </div>
                    {isOwned ? (
                      <Send className="w-4 h-4 text-amber-400 shrink-0" />
                    ) : (
                      <Lock className="w-4 h-4 text-zinc-500 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {showSimScreen && (
        <MatchSimulationScreen
          team1Name={room.participants.host.name}
          team2Name={room.participants.guest?.name || 'Player 2'}
          team1Squad={room.participants.host.squad}
          team2Squad={room.participants.guest?.squad || []}
          advantageGoalsTeam1={room.matchAdvantage?.leaderId === room.hostId ? 1 : 0}
          advantageGoalsTeam2={
            room.matchAdvantage && room.matchAdvantage.leaderId !== room.hostId ? 1 : 0
          }
          onFinishMatch={(winner, coins, fullOutput) => {
            if (winner === 'team1' && isHost) onMatchWin(coins);
            if (winner === 'team2' && isGuest) onMatchWin(coins);
            const hGoals = fullOutput
              ? fullOutput.goalsP1
              : winner === 'team1'
              ? 2
              : winner === 'draw'
              ? 1
              : 0;
            const gGoals = fullOutput
              ? fullOutput.goalsP2
              : winner === 'team2'
              ? 2
              : winner === 'draw'
              ? 1
              : 0;
            finishRoomMatch(roomCode, hGoals, gGoals);
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
