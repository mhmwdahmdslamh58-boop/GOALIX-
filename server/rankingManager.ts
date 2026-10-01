// Server-Authoritative Online Room League Ranking Manager
// Rules: Win = 3 points, Draw = 1 point, Loss = 0 points (Online Rooms Only)
// STRICTLY REAL ACCOUNTS ONLY - ZERO FAKE / BOT ACCOUNTS

export interface ServerRankedPlayer {
  id: string;
  rank: number;
  username: string;
  avatar: string;
  points: number; // 3 for win, 1 for draw, 0 for loss
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  winRate: number;
  streak: string;
  badge?: string;
  countryFlag?: string;
  lastUpdated: number;
}

class RankingManager {
  private players: Map<string, ServerRankedPlayer> = new Map();
  private lastUpdateTimestamp: number = Date.now();

  constructor() {
    // Strictly real accounts only - no fake/bot seeds!
  }

  /**
   * Registers or updates a real user profile on the server ranking list
   */
  public syncUserProfile(userId: string, username: string, avatar?: string): ServerRankedPlayer {
    let player = this.players.get(userId);
    if (!player) {
      player = {
        id: userId,
        rank: 0,
        username: username || 'مدرب جواليكس',
        avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
        points: 0,
        played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDiff: 0,
        winRate: 0,
        streak: '-',
        countryFlag: '⚽',
        lastUpdated: Date.now()
      };
      this.players.set(userId, player);
    } else {
      if (username) player.username = username;
      if (avatar) player.avatar = avatar;
    }
    this.lastUpdateTimestamp = Date.now();
    return player;
  }

  /**
   * Authoritative match result recording exclusively for Real Online Rooms
   * Win: 3 points
   * Draw: 1 point
   * Loss: 0 points
   */
  public recordRoomMatch(
    hostId: string,
    hostName: string,
    hostAvatar: string | undefined,
    hostGoals: number,
    guestId: string,
    guestName: string,
    guestAvatar: string | undefined,
    guestGoals: number
  ) {
    const host = this.syncUserProfile(hostId, hostName, hostAvatar);
    const guest = this.syncUserProfile(guestId, guestName, guestAvatar);

    host.played += 1;
    guest.played += 1;

    host.goalsFor += hostGoals;
    host.goalsAgainst += guestGoals;
    host.goalDiff = host.goalsFor - host.goalsAgainst;

    guest.goalsFor += guestGoals;
    guest.goalsAgainst += hostGoals;
    guest.goalDiff = guest.goalsFor - guest.goalsAgainst;

    if (hostGoals > guestGoals) {
      // Host wins: +3 pts
      host.wins += 1;
      host.points += 3;
      host.streak = 'W';

      // Guest loses: 0 pts
      guest.losses += 1;
      guest.streak = 'L';
    } else if (guestGoals > hostGoals) {
      // Guest wins: +3 pts
      guest.wins += 1;
      guest.points += 3;
      guest.streak = 'W';

      // Host loses: 0 pts
      host.losses += 1;
      host.streak = 'L';
    } else {
      // Draw: 1 point each
      host.draws += 1;
      host.points += 1;
      host.streak = 'D';

      guest.draws += 1;
      guest.points += 1;
      guest.streak = 'D';
    }

    host.winRate = Math.round((host.wins / host.played) * 100);
    guest.winRate = Math.round((guest.wins / guest.played) * 100);

    host.lastUpdated = Date.now();
    guest.lastUpdated = Date.now();
    this.lastUpdateTimestamp = Date.now();
  }

  /**
   * Returns current sorted leaderboard with rank recalculation (real accounts only)
   */
  public getLeaderboard(currentUserId?: string): {
    players: ServerRankedPlayer[];
    currentUser?: ServerRankedPlayer;
    totalPlayers: number;
    lastUpdated: number;
  } {
    const list = Array.from(this.players.values()).sort((a, b) => {
      // 1. Points DESC (Win 3, Draw 1, Loss 0)
      if (b.points !== a.points) return b.points - a.points;
      // 2. Goal Difference DESC
      if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
      // 3. Goals For DESC
      if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
      // 4. Wins DESC
      return b.wins - a.wins;
    });

    list.forEach((p, idx) => {
      p.rank = idx + 1;
    });

    const currentUser = currentUserId ? list.find(p => p.id === currentUserId) : undefined;

    return {
      players: list,
      currentUser,
      totalPlayers: list.length,
      lastUpdated: this.lastUpdateTimestamp
    };
  }
}

export const rankingManager = new RankingManager();
