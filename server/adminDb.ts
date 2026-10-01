// Server Database & Admin Management Service
import fs from 'fs';
import path from 'path';

export interface DbUser {
  id: string;
  username: string;
  passwordHash: string;
  role: 'admin' | 'player';
  coins: number;
  bids: number;
  points: number;
  avatar: string;
  matchesPlayed: number;
  matchesWon: number;
  createdAt: number;
  lastLogin: number;
}

export interface MatchLog {
  id: string;
  roomCode: string;
  hostName: string;
  guestName: string;
  score: string;
  winner: string;
  timestamp: number;
}

class AdminDatabase {
  private users: Map<string, DbUser> = new Map();
  private matchLogs: MatchLog[] = [];
  private dbFilePath: string = path.resolve('server_db_store.json');

  constructor() {
    this.loadFromDisk();
    this.ensureAdminUser();
  }

  private loadFromDisk() {
    try {
      if (fs.existsSync(this.dbFilePath)) {
        const raw = fs.readFileSync(this.dbFilePath, 'utf-8');
        const data = JSON.parse(raw);
        if (data.users && Array.isArray(data.users)) {
          data.users.forEach((u: DbUser) => this.users.set(u.id, u));
        }
        if (data.matchLogs && Array.isArray(data.matchLogs)) {
          this.matchLogs = data.matchLogs;
        }
      }
    } catch {
      // Fallback to memory
    }
  }

  public saveToDisk() {
    try {
      const data = {
        users: Array.from(this.users.values()),
        matchLogs: this.matchLogs.slice(-200),
        lastBackup: Date.now()
      };
      fs.writeFileSync(this.dbFilePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch {
      // Disk write error ignored in sandbox
    }
  }

  private ensureAdminUser() {
    // Developer & Super Admin Account: Mahmoud Ahmed Salama
    const adminId = 'dev_mahmoud_salama';
    if (!this.users.has(adminId)) {
      this.users.set(adminId, {
        id: adminId,
        username: 'محمود أحمد سلامة',
        passwordHash: 'salama2026', // simple developer secret
        role: 'admin',
        coins: 99999,
        bids: 999,
        points: 99,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        matchesPlayed: 35,
        matchesWon: 33,
        createdAt: 1700000000000,
        lastLogin: Date.now()
      });
      this.saveToDisk();
    }
  }

  public registerUser(username: string, passwordHash: string, avatar?: string): DbUser {
    const existing = Array.from(this.users.values()).find(
      u => u.username.trim().toLowerCase() === username.trim().toLowerCase()
    );
    if (existing) {
      throw new Error('اسم المستخدم مسجل بالفعل، يرجى اختيار اسم آخر أو تسجيل الدخول');
    }

    const newUser: DbUser = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      username: username.trim(),
      passwordHash: passwordHash || '123456',
      role: 'player',
      coins: 100,
      bids: 20,
      points: 0,
      avatar: avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      matchesPlayed: 0,
      matchesWon: 0,
      createdAt: Date.now(),
      lastLogin: Date.now()
    };

    this.users.set(newUser.id, newUser);
    this.saveToDisk();
    return newUser;
  }

  public authenticate(username: string, passwordHash: string): DbUser | null {
    const cleanName = username.trim().toLowerCase();
    
    // Check developer login bypass
    if (
      cleanName === 'محمود أحمد سلامة' || 
      cleanName === 'محمود سلامه' || 
      cleanName === 'admin' || 
      cleanName === 'salama'
    ) {
      if (passwordHash === 'salama2026' || passwordHash === 'admin' || passwordHash === '123456') {
        const admin = this.users.get('dev_mahmoud_salama');
        if (admin) {
          admin.lastLogin = Date.now();
          return admin;
        }
      }
    }

    const user = Array.from(this.users.values()).find(
      u => u.username.trim().toLowerCase() === cleanName && u.passwordHash === passwordHash
    );

    if (user) {
      user.lastLogin = Date.now();
      this.saveToDisk();
      return user;
    }
    return null;
  }

  public getUser(id: string): DbUser | undefined {
    return this.users.get(id);
  }

  public getAllUsers(): DbUser[] {
    return Array.from(this.users.values()).sort((a, b) => b.createdAt - a.createdAt);
  }

  public updateUserCoinsAndPoints(userId: string, coinsDelta: number, pointsDelta: number, bidsDelta: number = 0): DbUser {
    const user = this.users.get(userId);
    if (!user) throw new Error('المستخدم غير موجود');

    user.coins = Math.max(0, user.coins + coinsDelta);
    user.points = Math.max(0, user.points + pointsDelta);
    user.bids = Math.max(0, user.bids + bidsDelta);
    this.saveToDisk();
    return user;
  }

  public addMatchLog(roomCode: string, hostName: string, guestName: string, score: string, winner: string) {
    this.matchLogs.unshift({
      id: `match_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      roomCode,
      hostName,
      guestName,
      score,
      winner,
      timestamp: Date.now()
    });
    this.saveToDisk();
  }

  public getMatchLogs(): MatchLog[] {
    return this.matchLogs.slice(0, 50);
  }

  public getDatabaseSnapshot() {
    return {
      totalUsers: this.users.size,
      users: Array.from(this.users.values()).map(u => ({
        id: u.id,
        username: u.username,
        role: u.role,
        coins: u.coins,
        bids: u.bids,
        points: u.points,
        matchesPlayed: u.matchesPlayed,
        matchesWon: u.matchesWon,
        createdAt: u.createdAt,
        lastLogin: u.lastLogin
      })),
      matchLogs: this.matchLogs.slice(0, 30),
      serverUptime: process.uptime(),
      timestamp: Date.now()
    };
  }
}

export const adminDb = new AdminDatabase();
