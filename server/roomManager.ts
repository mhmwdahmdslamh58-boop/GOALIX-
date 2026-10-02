import {
  OnlineRoomState,
  GameId,
  GameMode,
  RoomVisibilityType,
  RoomTimerDuration,
  RoomChatMessageEvent,
} from '../src/types/game';
import { getQuestionsForGame } from '../src/data/questions';
import {
  getRandomPlayerByPosition,
  getRandomPlayerByClubAndPosition,
} from '../src/data/players';
import { getRandomClubsForRound } from '../src/data/clubs';
import { getPositionOrder } from '../src/services/positions';
import { leagueAndStoreManager, deriveGxAccountId } from './leagueAndStoreManager';

interface RoomSubscriber {
  id: string;
  callback: (state: OnlineRoomState) => void;
}

class RoomManager {
  private rooms: Map<string, OnlineRoomState> = new Map();
  private subscribers: Map<string, RoomSubscriber[]> = new Map();
  private disconnectTimers: Map<string, NodeJS.Timeout> = new Map();

  private generateCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return this.rooms.has(code) ? this.generateCode() : code;
  }

  public getRoom(code: string): OnlineRoomState | undefined {
    return this.rooms.get(code.toUpperCase());
  }

  public getAllActiveRooms(): OnlineRoomState[] {
    return Array.from(this.rooms.values()).sort((a, b) => b.updatedAt - a.updatedAt);
  }

  /**
   * Returns only PUBLIC rooms currently waiting for Player 2.
   * Private rooms do not appear in the public list and require a Room Code.
   */
  public getWaitingRooms(): OnlineRoomState[] {
    const now = Date.now();
    const list: OnlineRoomState[] = [];
    this.rooms.forEach((room, code) => {
      if (now - room.updatedAt > 2 * 60 * 60 * 1000) {
        this.rooms.delete(code);
        return;
      }
      if (room.phase === 'WAITING' && room.roomType === 'PUBLIC' && !room.participants.guest) {
        list.push(room);
      }
    });
    return list.sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 20);
  }

  public subscribe(code: string, subId: string, callback: (state: OnlineRoomState) => void) {
    const upper = code.toUpperCase();
    if (!this.subscribers.has(upper)) {
      this.subscribers.set(upper, []);
    }
    this.subscribers.get(upper)!.push({ id: subId, callback });
  }

  public unsubscribe(code: string, subId: string) {
    const upper = code.toUpperCase();
    const subs = this.subscribers.get(upper);
    if (subs) {
      this.subscribers.set(
        upper,
        subs.filter((s) => s.id !== subId)
      );
    }
  }

  private broadcast(room: OnlineRoomState) {
    const subs = this.subscribers.get(room.code);
    if (subs) {
      subs.forEach((sub) => {
        try {
          sub.callback(room);
        } catch {
          // subscriber closed
        }
      });
    }
  }

  public createRoom(
    hostId: string,
    hostName: string,
    gameId: GameId = 'stat_arena',
    mode: GameMode = 'quick_five',
    roomType: RoomVisibilityType = 'PUBLIC',
    timerSeconds: RoomTimerDuration = 30,
    chatEnabled = true
  ): OnlineRoomState {
    const code = this.generateCode();
    const positions = getPositionOrder(mode);
    const validTimers: RoomTimerDuration[] = [15, 30, 45, 60];
    const cleanTimer: RoomTimerDuration = validTimers.includes(timerSeconds) ? timerSeconds : 30;

    const room: OnlineRoomState = {
      code,
      hostId,
      gameId,
      mode,
      roomType: roomType === 'PRIVATE' ? 'PRIVATE' : 'PUBLIC',
      timerSeconds: cleanTimer,
      chatEnabled: Boolean(chatEnabled),
      phase: 'WAITING',
      currentRoundIndex: 0,
      totalRounds: positions.length,
      positionOrder: positions,
      participants: {
        host: {
          id: hostId,
          accountId: deriveGxAccountId(hostId),
          name: hostName || 'اللاعب 1',
          ready: false,
          score: 0,
          diffSum: 0,
          squad: [],
          messagesSentCount: 0,
          lastMessageAt: 0,
          connected: true,
        },
      },
      chatMessages: [],
      updatedAt: Date.now(),
    };

    this.rooms.set(code, room);
    leagueAndStoreManager.touchRoomPlayer(hostId, hostName || 'اللاعب 1');
    return room;
  }

  public joinRoom(code: string, guestId: string, guestName: string): OnlineRoomState {
    const room = this.getRoom(code);
    if (!room) {
      throw new Error('رمز الغرفة غير صحيح أو أن الغرفة غير موجودة');
    }

    if (room.hostId === guestId) {
      return room;
    }

    const timerKey = `${code}_${guestId}`;
    if (this.disconnectTimers.has(timerKey)) {
      clearTimeout(this.disconnectTimers.get(timerKey)!);
      this.disconnectTimers.delete(timerKey);
    }

    if (room.participants.guest && room.participants.guest.id !== guestId) {
      throw new Error('الغرفة مكتملة بالفعل (Player 1 VS Player 2 فقط)');
    }

    if (!room.participants.guest || room.participants.guest.id === guestId) {
      room.participants.guest = {
        id: guestId,
        accountId: deriveGxAccountId(guestId),
        name: guestName || room.participants.guest?.name || 'اللاعب 2',
        ready: room.participants.guest?.ready || false,
        score: room.participants.guest?.score || 0,
        diffSum: room.participants.guest?.diffSum || 0,
        squad: room.participants.guest?.squad || [],
        messagesSentCount: room.participants.guest?.messagesSentCount || 0,
        lastMessageAt: room.participants.guest?.lastMessageAt || 0,
        connected: true,
      };
    }

    if (room.phase === 'WAITING') {
      room.phase = 'PLAYER_2_JOINED';
    }

    leagueAndStoreManager.touchRoomPlayer(guestId, guestName || 'اللاعب 2');
    room.updatedAt = Date.now();
    this.broadcast(room);
    return room;
  }

  public setReady(code: string, userId: string, isReady: boolean): OnlineRoomState {
    const room = this.getRoom(code);
    if (!room) throw new Error('الغرفة غير موجودة');

    if (room.hostId === userId) {
      room.participants.host.ready = isReady;
    } else if (room.participants.guest?.id === userId) {
      room.participants.guest.ready = isReady;
    } else {
      throw new Error('أنت لست عضوًا في هذه الغرفة');
    }

    if (room.participants.host.ready && room.participants.guest?.ready) {
      this.startMatch(room);
    } else if (room.participants.guest) {
      room.phase = 'PLAYER_2_JOINED';
    }

    room.updatedAt = Date.now();
    this.broadcast(room);
    return room;
  }

  public startRoomMatch(code: string, hostId: string): OnlineRoomState {
    const room = this.getRoom(code);
    if (!room) throw new Error('الغرفة غير موجودة');
    if (room.hostId !== hostId) throw new Error('فقط مضيف الغرفة يمكنه بدء المباراة');
    if (!room.participants.guest) {
      throw new Error('يجب دخول اللاعب الثاني (Player 2) أولاً لبدء المباراة');
    }
    if (!room.participants.host.ready || !room.participants.guest.ready) {
      throw new Error('يجب أن يضغط اللاعبان على [ جاهز ] أولاً');
    }
    this.startMatch(room);
    room.updatedAt = Date.now();
    this.broadcast(room);
    return room;
  }

  public selectGame(
    code: string,
    hostId: string,
    gameId: GameId,
    mode: GameMode,
    timerSeconds?: RoomTimerDuration,
    chatEnabled?: boolean
  ): OnlineRoomState {
    const room = this.getRoom(code);
    if (!room) throw new Error('الغرفة غير موجودة');
    if (room.hostId !== hostId) throw new Error('فقط مضيف الغرفة يمكنه تعديل الإعدادات');

    room.gameId = gameId;
    room.mode = mode;
    if (timerSeconds && [15, 30, 45, 60].includes(timerSeconds)) {
      room.timerSeconds = timerSeconds;
    }
    if (typeof chatEnabled === 'boolean') {
      room.chatEnabled = chatEnabled;
    }
    const positions = getPositionOrder(mode);
    room.positionOrder = positions;
    room.totalRounds = positions.length;
    room.updatedAt = Date.now();

    this.broadcast(room);
    return room;
  }

  /**
   * Server-Side Quick Chat Validation:
   * - Chat must be ON for this room
   * - Max 6 messages per player per match
   * - 15 seconds cooldown between messages
   * - Player must own the message
   */
  public sendQuickChatMessage(code: string, userId: string, messageId: string): OnlineRoomState {
    const room = this.getRoom(code);
    if (!room) throw new Error('الغرفة غير موجودة');
    if (!room.chatEnabled) {
      throw new Error('الشات مغلق في إعدادات هذه المباراة');
    }

    const participant =
      room.hostId === userId
        ? room.participants.host
        : room.participants.guest?.id === userId
        ? room.participants.guest
        : null;

    if (!participant) {
      throw new Error('غير مصرح لك بإرسال رسائل في هذه الغرفة');
    }

    if (participant.messagesSentCount >= 6) {
      throw new Error('خلصت رسائلك في المباراة (الحد الأقصى 6 رسائل)');
    }

    const now = Date.now();
    const elapsedMs = now - (participant.lastMessageAt || 0);
    if (participant.lastMessageAt > 0 && elapsedMs < 15000) {
      const waitSec = Math.ceil((15000 - elapsedMs) / 1000);
      throw new Error(`يرجى الانتظار ${waitSec} ثانية قبل إرسال الرسالة التالية`);
    }

    const ownedMsg = leagueAndStoreManager.doesPlayerOwnChatMessage(userId, messageId);
    if (!ownedMsg) {
      throw new Error('هذه الرسالة غير مملوكة في مجموعتك');
    }

    participant.messagesSentCount += 1;
    participant.lastMessageAt = now;

    const event: RoomChatMessageEvent = {
      id: `chat_${now}_${Math.random().toString(36).substring(2, 6)}`,
      senderId: userId,
      senderName: participant.name,
      messageId: ownedMsg.id,
      textAr: ownedMsg.textAr,
      category: ownedMsg.category,
      timestamp: now,
    };

    room.chatMessages = [...(room.chatMessages || []), event].slice(-30);
    room.updatedAt = now;
    this.broadcast(room);
    return room;
  }

  private startMatch(room: OnlineRoomState) {
    room.currentRoundIndex = 0;
    room.participants.host.squad = [];
    room.participants.host.diffSum = 0;
    room.participants.host.messagesSentCount = 0;
    room.participants.host.lastMessageAt = 0;
    if (room.participants.guest) {
      room.participants.guest.squad = [];
      room.participants.guest.diffSum = 0;
      room.participants.guest.messagesSentCount = 0;
      room.participants.guest.lastMessageAt = 0;
    }

    this.prepareRound(room);
  }

  private prepareRound(room: OnlineRoomState) {
    const currentPos = room.positionOrder[room.currentRoundIndex];

    room.participants.host.currentAnswer = null;
    room.participants.host.currentBoxSelection = null;
    if (room.participants.guest) {
      room.participants.guest.currentAnswer = null;
      room.participants.guest.currentBoxSelection = null;
    }
    room.lastRoundWinner = null;
    room.lastRoundLoserReward = null;
    room.roundDeadlineAt = Date.now() + (room.timerSeconds || 30) * 1000;

    if (room.gameId === 'stat_arena') {
      room.phase = 'QUESTION_ACTIVE';
      const questions = getQuestionsForGame([currentPos]);
      room.currentQuestion = questions[0];
    } else if (room.gameId === 'santra') {
      room.phase = 'MYSTERY_SELECTION';
      // 3 identical mystery boxes from outside
      const clubs = getRandomClubsForRound(3);
      room.currentRoundClubs = clubs.map((c) => c.name);
    }

    room.updatedAt = Date.now();
  }

  public submitStatAnswer(code: string, userId: string, answer: number): OnlineRoomState {
    const room = this.getRoom(code);
    if (!room) throw new Error('الغرفة غير موجودة');
    if (room.phase !== 'QUESTION_ACTIVE') throw new Error('انتهى وقت الإجابة لهذه الجولة');

    if (typeof answer !== 'number' || answer < 0 || !Number.isFinite(answer)) {
      throw new Error('إجابة غير صالحة');
    }

    if (room.hostId === userId) {
      room.participants.host.currentAnswer = answer;
    } else if (room.participants.guest?.id === userId) {
      room.participants.guest.currentAnswer = answer;
    } else {
      throw new Error('المستخدم ليس عضوًا في هذه الغرفة');
    }

    const hostAns = room.participants.host.currentAnswer;
    const guestAns = room.participants.guest?.currentAnswer;

    if (hostAns !== null && hostAns !== undefined && guestAns !== null && guestAns !== undefined) {
      const correct = room.currentQuestion?.correctAnswer || 0;
      const hostDiff = Math.abs(hostAns - correct);
      const guestDiff = Math.abs(guestAns - correct);

      room.participants.host.diffSum += hostDiff;
      if (room.participants.guest) {
        room.participants.guest.diffSum += guestDiff;
      }

      const currentPos = room.positionOrder[room.currentRoundIndex];

      if (hostDiff < guestDiff) {
        room.lastRoundWinner = 'host';
        const pHost = getRandomPlayerByPosition(currentPos);
        const pGuest = getRandomPlayerByPosition(currentPos, [pHost.id]);
        room.participants.host.squad.push(pHost);
        room.participants.guest!.squad.push(pGuest);
        room.lastRoundLoserReward = {
          recipientId: room.participants.guest!.id,
          player: pGuest,
        };
      } else if (guestDiff < hostDiff) {
        room.lastRoundWinner = 'guest';
        const pGuest = getRandomPlayerByPosition(currentPos);
        const pHost = getRandomPlayerByPosition(currentPos, [pGuest.id]);
        room.participants.guest!.squad.push(pGuest);
        room.participants.host.squad.push(pHost);
        room.lastRoundLoserReward = {
          recipientId: room.hostId,
          player: pHost,
        };
      } else {
        room.lastRoundWinner = 'tie';
        const r1 = getRandomPlayerByPosition(currentPos);
        const r2 = getRandomPlayerByPosition(currentPos, [r1.id]);
        room.participants.host.squad.push(r1);
        room.participants.guest!.squad.push(r2);
      }

      room.phase = 'ANSWER_REVEAL';
    }

    room.updatedAt = Date.now();
    this.broadcast(room);
    return room;
  }

  public submitSantraBox(code: string, userId: string, boxIndex: number): OnlineRoomState {
    const room = this.getRoom(code);
    if (!room) throw new Error('الغرفة غير موجودة');
    if (room.phase !== 'MYSTERY_SELECTION') throw new Error('ليس وقت اختيار الصناديق');

    if (boxIndex < 0 || boxIndex > 2) {
      throw new Error('يرجى اختيار أحد الصناديق الثلاثة (1 - 3)');
    }

    const currentPos = room.positionOrder[room.currentRoundIndex];
    const clubs = room.currentRoundClubs || ['Real Madrid', 'FC Barcelona', 'Manchester City'];
    const chosenClub = clubs[boxIndex % clubs.length];

    if (room.hostId === userId) {
      if (room.participants.host.currentBoxSelection === null) {
        room.participants.host.currentBoxSelection = boxIndex;
        const p1 = getRandomPlayerByClubAndPosition(chosenClub, currentPos);
        room.participants.host.squad.push(p1);
      }
    } else if (room.participants.guest?.id === userId) {
      if (room.participants.guest.currentBoxSelection === null) {
        room.participants.guest.currentBoxSelection = boxIndex;
        const p2 = getRandomPlayerByClubAndPosition(chosenClub, currentPos);
        room.participants.guest.squad.push(p2);
      }
    } else {
      throw new Error('المستخدم ليس عضوًا في هذه الغرفة');
    }

    const hostBox = room.participants.host.currentBoxSelection;
    const guestBox = room.participants.guest?.currentBoxSelection;

    if (hostBox !== null && hostBox !== undefined && guestBox !== null && guestBox !== undefined) {
      room.phase = 'MYSTERY_REVEAL';
    }

    room.updatedAt = Date.now();
    this.broadcast(room);
    return room;
  }

  public nextRound(code: string): OnlineRoomState {
    const room = this.getRoom(code);
    if (!room) throw new Error('الغرفة غير موجودة');

    const nextIndex = room.currentRoundIndex + 1;
    if (nextIndex < room.totalRounds) {
      room.currentRoundIndex = nextIndex;
      this.prepareRound(room);
    } else {
      room.phase = 'SQUAD_COMPARISON';

      if (room.gameId === 'stat_arena') {
        const p1Diff = room.participants.host.diffSum;
        const p2Diff = room.participants.guest?.diffSum ?? 0;
        if (p1Diff < p2Diff) {
          room.matchAdvantage = { leaderId: room.hostId, score: '1-0' };
        } else if (p2Diff < p1Diff && room.participants.guest) {
          room.matchAdvantage = { leaderId: room.participants.guest.id, score: '1-0' };
        }
      }
    }

    room.updatedAt = Date.now();
    this.broadcast(room);
    return room;
  }

  public startSimulation(code: string): OnlineRoomState {
    const room = this.getRoom(code);
    if (!room) throw new Error('الغرفة غير موجودة');
    const expectedCount = room.totalRounds;
    if (
      room.participants.host.squad.length < expectedCount ||
      (room.participants.guest?.squad.length || 0) < expectedCount
    ) {
      throw new Error('لا يمكن بدء المحاكاة قبل اكتمال التشكيلتين');
    }
    room.phase = 'SIMULATION';
    room.updatedAt = Date.now();
    this.broadcast(room);
    return room;
  }

  public finishMatch(code: string, hostGoals: number, guestGoals: number): OnlineRoomState {
    const room = this.getRoom(code);
    if (!room) throw new Error('الغرفة غير موجودة');

    if (
      (room.phase === 'MATCH_FINISHED' || room.phase === 'COMPLETED') &&
      room.simulationResult
    ) {
      return room;
    }

    let winnerId: string | 'draw' = 'draw';
    if (hostGoals > guestGoals) winnerId = room.hostId;
    else if (guestGoals > hostGoals && room.participants.guest) {
      winnerId = room.participants.guest.id;
    }

    const hostSquad = room.participants.host.squad || [];
    const guestSquad = room.participants.guest?.squad || [];
    const hostSquadOvr =
      hostSquad.length > 0
        ? Math.round(hostSquad.reduce((s, p) => s + (p.ovr || 85), 0) / hostSquad.length)
        : 85;
    const guestSquadOvr =
      guestSquad.length > 0
        ? Math.round(guestSquad.reduce((s, p) => s + (p.ovr || 85), 0) / guestSquad.length)
        : 85;

    const recorded = leagueAndStoreManager.recordRoomMatch({
      roomCode: room.code,
      gameId: room.gameId,
      mode: room.mode,
      hostId: room.hostId,
      hostName: room.participants.host.name,
      hostSquadOvr,
      guestId: room.participants.guest?.id || 'guest',
      guestName: room.participants.guest?.name || 'اللاعب 2',
      guestSquadOvr,
      hostGoals,
      guestGoals,
    });

    room.phase = 'MATCH_FINISHED';
    room.simulationResult = {
      matchId: recorded.matchRecord.id,
      rewardTransactionId: recorded.matchRecord.rewardTransactionId || `rtx_${room.code}`,
      hostGoals,
      guestGoals,
      winnerId,
      hostCoinsAwarded: recorded.hostCoinsAwarded,
      guestCoinsAwarded: recorded.guestCoinsAwarded,
      hostRpDelta: recorded.hostRpDelta,
      guestRpDelta: recorded.guestRpDelta,
    };
    room.updatedAt = Date.now();

    this.broadcast(room);
    return room;
  }

  public leaveRoom(code: string, userId: string): void {
    const room = this.getRoom(code);
    if (!room) return;

    if (room.hostId === userId) {
      this.rooms.delete(code);
      this.broadcast({
        ...room,
        phase: 'WAITING',
        updatedAt: Date.now(),
      });
    } else if (room.participants.guest?.id === userId) {
      delete room.participants.guest;
      room.phase = 'WAITING';
      room.participants.host.ready = false;
      this.broadcast(room);
    }
  }
}

export const roomManager = new RoomManager();
