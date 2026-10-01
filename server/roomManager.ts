import { 
  OnlineRoomState, 
  GameId, 
  GameMode, 
  PositionType, 
  RoomPhase, 
  Player, 
  StatQuestion 
} from '../src/types/game';
import { getQuestionsForGame } from '../src/data/questions';
import { getRandomPlayerByPosition, getRandomPlayerByClubAndPosition } from '../src/data/players';
import { getRandomClubsForRound } from '../src/data/clubs';
import { getPositionOrder, QUICK_FIVE_POSITIONS, FULL_ELEVEN_POSITIONS } from '../src/services/positions';

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
      this.subscribers.set(upper, subs.filter(s => s.id !== subId));
    }
  }

  private broadcast(room: OnlineRoomState) {
    const subs = this.subscribers.get(room.code);
    if (subs) {
      subs.forEach(sub => {
        try {
          sub.callback(room);
        } catch {
          // subscriber connection closed
        }
      });
    }
  }

  public createRoom(
    hostId: string, 
    hostName: string, 
    gameId: GameId = 'stat_arena', 
    mode: GameMode = 'quick_five'
  ): OnlineRoomState {
    const code = this.generateCode();
    const positions = getPositionOrder(mode);

    const room: OnlineRoomState = {
      code,
      hostId,
      gameId,
      mode,
      phase: 'WAITING',
      currentRoundIndex: 0,
      totalRounds: positions.length,
      positionOrder: positions,
      participants: {
        host: {
          id: hostId,
          name: hostName || 'المضيف',
          ready: false,
          score: 0,
          diffSum: 0,
          squad: [],
          connected: true
        }
      },
      updatedAt: Date.now()
    };

    this.rooms.set(code, room);
    return room;
  }

  public joinRoom(code: string, guestId: string, guestName: string): OnlineRoomState {
    const room = this.getRoom(code);
    if (!room) {
      throw new Error('رمز الغرفة غير صحيح أو أن الغرفة غير موجودة');
    }

    // Cancel any pending disconnect timer for this guest
    const timerKey = `${code}_${guestId}`;
    if (this.disconnectTimers.has(timerKey)) {
      clearTimeout(this.disconnectTimers.get(timerKey)!);
      this.disconnectTimers.delete(timerKey);
    }

    if (room.participants.guest && room.participants.guest.id !== guestId) {
      throw new Error('الغرفة ممتلئة بالفعل بلاعبين اثنين');
    }

    if (!room.participants.guest || room.participants.guest.id === guestId) {
      room.participants.guest = {
        id: guestId,
        name: guestName || room.participants.guest?.name || 'الضيف',
        ready: room.participants.guest?.ready || false,
        score: room.participants.guest?.score || 0,
        diffSum: room.participants.guest?.diffSum || 0,
        squad: room.participants.guest?.squad || [],
        connected: true
      };
    }

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
    }

    // If both ready and we have guest, start match!
    if (room.participants.host.ready && room.participants.guest?.ready) {
      this.startMatch(room);
    }

    room.updatedAt = Date.now();
    this.broadcast(room);
    return room;
  }

  public selectGame(code: string, hostId: string, gameId: GameId, mode: GameMode): OnlineRoomState {
    const room = this.getRoom(code);
    if (!room) throw new Error('الغرفة غير موجودة');
    if (room.hostId !== hostId) throw new Error('فقط المضيف يمكنه تغيير إعدادات الغرفة');

    room.gameId = gameId;
    room.mode = mode;
    const positions = getPositionOrder(mode);
    room.positionOrder = positions;
    room.totalRounds = positions.length;
    room.updatedAt = Date.now();

    this.broadcast(room);
    return room;
  }

  private startMatch(room: OnlineRoomState) {
    room.currentRoundIndex = 0;
    room.participants.host.squad = [];
    room.participants.host.diffSum = 0;
    if (room.participants.guest) {
      room.participants.guest.squad = [];
      room.participants.guest.diffSum = 0;
    }

    this.prepareRound(room);
  }

  private prepareRound(room: OnlineRoomState) {
    const currentPos = room.positionOrder[room.currentRoundIndex];

    // Reset round state
    room.participants.host.currentAnswer = null;
    room.participants.host.currentBoxSelection = null;
    if (room.participants.guest) {
      room.participants.guest.currentAnswer = null;
      room.participants.guest.currentBoxSelection = null;
    }
    room.lastRoundWinner = null;
    room.lastRoundLoserReward = null;

    if (room.gameId === 'stat_arena') {
      room.phase = 'QUESTION_ACTIVE';
      const questions = getQuestionsForGame([currentPos]);
      room.currentQuestion = questions[0];
    } else if (room.gameId === 'santra') {
      room.phase = 'MYSTERY_SELECTION';
      const clubs = getRandomClubsForRound(4);
      room.currentRoundClubs = clubs.map(c => c.name);
    }

    room.updatedAt = Date.now();
  }

  public submitStatAnswer(code: string, userId: string, answer: number): OnlineRoomState {
    const room = this.getRoom(code);
    if (!room) throw new Error('الغرفة غير موجودة');
    if (room.phase !== 'QUESTION_ACTIVE') throw new Error('ليس وقت الإجابة حالياً');

    // Anti-cheat validation: answer must be positive finite number
    if (typeof answer !== 'number' || answer < 0 || !Number.isFinite(answer)) {
      throw new Error('إجابة غير صالحة');
    }

    if (room.hostId === userId) {
      room.participants.host.currentAnswer = answer;
    } else if (room.participants.guest?.id === userId) {
      room.participants.guest.currentAnswer = answer;
    } else {
      throw new Error('المستخدم ليس عضواً في هذه الغرفة');
    }

    // Check if both answered
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
        const rewardPlayer = getRandomPlayerByPosition(currentPos);
        room.participants.guest!.squad.push(rewardPlayer);
        room.lastRoundLoserReward = {
          recipientId: room.participants.guest!.id,
          player: rewardPlayer
        };
      } else if (guestDiff < hostDiff) {
        room.lastRoundWinner = 'guest';
        const rewardPlayer = getRandomPlayerByPosition(currentPos);
        room.participants.host.squad.push(rewardPlayer);
        room.lastRoundLoserReward = {
          recipientId: room.hostId,
          player: rewardPlayer
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

    if (boxIndex < 0 || boxIndex > 3) {
      throw new Error('رقم الصندوق غير صالح');
    }

    const currentPos = room.positionOrder[room.currentRoundIndex];
    const clubs = room.currentRoundClubs || ['Real Madrid', 'FC Barcelona', 'Manchester City', 'Bayern Munich'];
    const chosenClub = clubs[boxIndex % clubs.length];

    if (room.hostId === userId) {
      if (room.participants.host.currentBoxSelection === null) {
        room.participants.host.currentBoxSelection = boxIndex;
        // Award player strictly matching current position
        const p1 = getRandomPlayerByClubAndPosition(chosenClub, currentPos);
        room.participants.host.squad.push(p1);
      }
    } else if (room.participants.guest?.id === userId) {
      if (room.participants.guest.currentBoxSelection === null) {
        room.participants.guest.currentBoxSelection = boxIndex;
        // Award player strictly matching current position
        const p2 = getRandomPlayerByClubAndPosition(chosenClub, currentPos);
        room.participants.guest.squad.push(p2);
      }
    } else {
      throw new Error('المستخدم ليس عضواً في هذه الغرفة');
    }

    const hostBox = room.participants.host.currentBoxSelection;
    const guestBox = room.participants.guest?.currentBoxSelection;

    // When both have chosen, reveal is complete
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
      // Challenge phase complete! Transition to Squad Comparison & Simulation
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
    room.phase = 'SIMULATION';
    room.updatedAt = Date.now();
    this.broadcast(room);
    return room;
  }

  public finishMatch(code: string, hostGoals: number, guestGoals: number): OnlineRoomState {
    const room = this.getRoom(code);
    if (!room) throw new Error('الغرفة غير موجودة');

    let winnerId: string | 'draw' = 'draw';
    if (hostGoals > guestGoals) winnerId = room.hostId;
    else if (guestGoals > hostGoals && room.participants.guest) winnerId = room.participants.guest.id;

    room.phase = 'MATCH_FINISHED';
    room.simulationResult = { hostGoals, guestGoals, winnerId };
    room.updatedAt = Date.now();
    this.broadcast(room);
    return room;
  }

  public handleDisconnect(code: string, userId: string): void {
    const room = this.getRoom(code);
    if (!room) return;

    if (room.hostId === userId) {
      room.participants.host.connected = false;
    } else if (room.participants.guest?.id === userId) {
      room.participants.guest.connected = false;
    }

    room.updatedAt = Date.now();
    this.broadcast(room);

    // Give 45 seconds reconnection grace period
    const timerKey = `${code}_${userId}`;
    const timer = setTimeout(() => {
      this.leaveRoom(code, userId);
    }, 45000);
    this.disconnectTimers.set(timerKey, timer);
  }

  public leaveRoom(code: string, userId: string): void {
    const room = this.getRoom(code);
    if (!room) return;

    if (room.hostId === userId) {
      this.rooms.delete(code);
      this.broadcast({
        ...room,
        phase: 'WAITING',
        updatedAt: Date.now()
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
