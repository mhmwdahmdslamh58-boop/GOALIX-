import { OnlineRoomState, GameId, GameMode } from '../types/game';

const API_BASE = '/api';

export async function createOnlineRoom(
  hostId: string, 
  hostName: string, 
  gameId: GameId, 
  mode: GameMode
): Promise<OnlineRoomState> {
  const res = await fetch(`${API_BASE}/rooms/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ hostId, hostName, gameId, mode })
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'فشل في إنشاء الغرفة');
  }
  return res.json();
}

export async function joinOnlineRoom(
  code: string, 
  guestId: string, 
  guestName: string
): Promise<OnlineRoomState> {
  const res = await fetch(`${API_BASE}/rooms/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: code.trim().toUpperCase(), guestId, guestName })
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'فشل في الانضمام للغرفة');
  }
  return res.json();
}

export async function fetchRoomState(code: string): Promise<OnlineRoomState> {
  const res = await fetch(`${API_BASE}/rooms/${encodeURIComponent(code.trim().toUpperCase())}`);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'الغرفة غير موجودة');
  }
  return res.json();
}

export async function setRoomReady(code: string, userId: string, ready: boolean): Promise<OnlineRoomState> {
  const res = await fetch(`${API_BASE}/rooms/${encodeURIComponent(code)}/ready`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, ready })
  });
  if (!res.ok) throw new Error('فشل تحديث حالة الاستعداد');
  return res.json();
}

export async function updateRoomGame(code: string, hostId: string, gameId: GameId, mode: GameMode): Promise<OnlineRoomState> {
  const res = await fetch(`${API_BASE}/rooms/${encodeURIComponent(code)}/select-game`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ hostId, gameId, mode })
  });
  if (!res.ok) throw new Error('فشل تغيير إعدادات اللعبة');
  return res.json();
}

export async function sendStatAnswer(code: string, userId: string, answer: number): Promise<OnlineRoomState> {
  const res = await fetch(`${API_BASE}/rooms/${encodeURIComponent(code)}/stat-answer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, answer })
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'فشل إرسال الإجابة');
  }
  return res.json();
}

export async function sendSantraBox(code: string, userId: string, boxIndex: number): Promise<OnlineRoomState> {
  const res = await fetch(`${API_BASE}/rooms/${encodeURIComponent(code)}/santra-box`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, boxIndex })
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'فشل اختيار الصندوق');
  }
  return res.json();
}

export async function advanceRoomRound(code: string): Promise<OnlineRoomState> {
  const res = await fetch(`${API_BASE}/rooms/${encodeURIComponent(code)}/next-round`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('فشل الانتقال للجولة التالية');
  return res.json();
}

export async function startRoomSimulation(code: string): Promise<OnlineRoomState> {
  const res = await fetch(`${API_BASE}/rooms/${encodeURIComponent(code)}/start-simulation`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('فشل بدء محاكاة المباراة');
  return res.json();
}

export async function finishRoomMatch(code: string, hostGoals: number, guestGoals: number): Promise<OnlineRoomState> {
  const res = await fetch(`${API_BASE}/rooms/${encodeURIComponent(code)}/finish-match`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ hostGoals, guestGoals })
  });
  if (!res.ok) throw new Error('فشل تسجيل نتيجة المباراة');
  return res.json();
}

export async function leaveOnlineRoom(code: string, userId: string): Promise<void> {
  try {
    await fetch(`${API_BASE}/rooms/${encodeURIComponent(code)}/leave`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
  } catch {
    // Ignore network error on exit
  }
}

/**
 * Connects to the room's real-time Server-Sent Events (SSE) stream.
 * Automatically falls back to polling if SSE encounters an error.
 */
export function subscribeToRoomUpdates(
  code: string, 
  onUpdate: (state: OnlineRoomState) => void,
  onError?: (err: Error) => void
): () => void {
  const cleanCode = code.trim().toUpperCase();
  let eventSource: EventSource | null = null;
  let pollingInterval: NodeJS.Timeout | null = null;
  let isClosed = false;

  const startPolling = () => {
    if (pollingInterval || isClosed) return;
    pollingInterval = setInterval(async () => {
      try {
        const state = await fetchRoomState(cleanCode);
        if (!isClosed) onUpdate(state);
      } catch (err) {
        if (!isClosed && onError && err instanceof Error) onError(err);
      }
    }, 1200);
  };

  try {
    eventSource = new EventSource(`${API_BASE}/rooms/${encodeURIComponent(cleanCode)}/stream`);
    
    eventSource.onmessage = (event) => {
      if (isClosed) return;
      try {
        const state = JSON.parse(event.data) as OnlineRoomState;
        onUpdate(state);
      } catch {
        // Ignored keepalive or unparseable
      }
    };

    eventSource.onerror = () => {
      if (eventSource) {
        eventSource.close();
        eventSource = null;
      }
      // Switch gracefully to reliable polling
      startPolling();
    };
  } catch {
    startPolling();
  }

  return () => {
    isClosed = true;
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
    }
  };
}
