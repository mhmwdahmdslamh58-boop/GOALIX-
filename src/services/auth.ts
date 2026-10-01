// Client Authentication & Session Management
import { UserProfile } from '../types/game';
import { saveUserProfile } from './storage';

export interface AuthUser {
  id: string;
  username: string;
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

const AUTH_STORAGE_KEY = 'goalix_auth_session_v1';

export function getStoredAuthSession(): AuthUser | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveAuthSession(user: AuthUser | null) {
  try {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  } catch {
    // Storage fallback
  }
}

export async function loginCoach(username: string, password: string): Promise<AuthUser> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'فشل تسجيل الدخول');
  }
  const user = data.user as AuthUser;
  saveAuthSession(user);
  return user;
}

export async function registerCoach(username: string, password: string, avatar?: string): Promise<AuthUser> {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, avatar })
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'فشل إنشاء الحساب');
  }
  const user = data.user as AuthUser;
  saveAuthSession(user);
  return user;
}

/** Quick 1-Click Login for the Developer / Admin: Mahmoud Ahmed Salama */
export async function quickLoginDeveloper(): Promise<AuthUser> {
  return loginCoach('محمود أحمد سلامة', 'salama2026');
}

export function logoutCoach() {
  saveAuthSession(null);
}

export function isDeveloperAdmin(user?: UserProfile | AuthUser | null): boolean {
  if (!user) return false;
  if ('role' in user && user.role === 'admin') return true;
  const name = user.username.trim();
  return (
    name === 'محمود أحمد سلامة' || 
    name === 'محمود سلامه' || 
    name === 'Mahmoud Ahmed Salama' ||
    user.id === 'dev_mahmoud_salama'
  );
}
