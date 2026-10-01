import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { roomManager } from './server/roomManager';
import { rankingManager } from './server/rankingManager';
import { adminDb } from './server/adminDb';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json());

// API Router
const apiRouter = express.Router();

apiRouter.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', serverTime: Date.now() });
});

// Create Room
apiRouter.post('/rooms/create', (req: Request, res: Response) => {
  try {
    const { hostId, hostName, gameId, mode } = req.body;
    if (!hostId) {
      return res.status(400).json({ error: 'hostId is required' });
    }
    const room = roomManager.createRoom(hostId, hostName, gameId, mode);
    res.json(room);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

// Join Room
apiRouter.post('/rooms/join', (req: Request, res: Response) => {
  try {
    const { code, guestId, guestName } = req.body;
    if (!code || !guestId) {
      return res.status(400).json({ error: 'code and guestId are required' });
    }
    const room = roomManager.joinRoom(code, guestId, guestName);
    res.json(room);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(400).json({ error: message });
  }
});

// Get Room State
apiRouter.get('/rooms/:code', (req: Request, res: Response) => {
  const room = roomManager.getRoom(req.params.code);
  if (!room) {
    return res.status(404).json({ error: 'الغرفة غير موجودة' });
  }
  res.json(room);
});

// Server-Sent Events (SSE) Stream for real-time room synchronization
apiRouter.get('/rooms/:code/stream', (req: Request, res: Response) => {
  const code = req.params.code.toUpperCase();
  const room = roomManager.getRoom(code);
  if (!room) {
    return res.status(404).json({ error: 'الغرفة غير موجودة' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  // Send initial room state
  res.write(`data: ${JSON.stringify(room)}\n\n`);

  const subId = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  roomManager.subscribe(code, subId, (updatedState) => {
    res.write(`data: ${JSON.stringify(updatedState)}\n\n`);
  });

  // Keep alive ping every 15 seconds
  const keepAlive = setInterval(() => {
    res.write(': keepalive\n\n');
  }, 15000);

  req.on('close', () => {
    clearInterval(keepAlive);
    roomManager.unsubscribe(code, subId);
  });
});

// Set Ready
apiRouter.post('/rooms/:code/ready', (req: Request, res: Response) => {
  try {
    const { userId, ready } = req.body;
    const room = roomManager.setReady(req.params.code, userId, ready);
    res.json(room);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(400).json({ error: message });
  }
});

// Select Game & Mode
apiRouter.post('/rooms/:code/select-game', (req: Request, res: Response) => {
  try {
    const { hostId, gameId, mode } = req.body;
    const room = roomManager.selectGame(req.params.code, hostId, gameId, mode);
    res.json(room);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(400).json({ error: message });
  }
});

// Submit STAT ARENA Answer
apiRouter.post('/rooms/:code/stat-answer', (req: Request, res: Response) => {
  try {
    const { userId, answer } = req.body;
    const room = roomManager.submitStatAnswer(req.params.code, userId, answer);
    res.json(room);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(400).json({ error: message });
  }
});

// Submit SANTRA Box Choice
apiRouter.post('/rooms/:code/santra-box', (req: Request, res: Response) => {
  try {
    const { userId, boxIndex } = req.body;
    const room = roomManager.submitSantraBox(req.params.code, userId, boxIndex);
    res.json(room);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(400).json({ error: message });
  }
});

// Advance to Next Round
apiRouter.post('/rooms/:code/next-round', (req: Request, res: Response) => {
  try {
    const room = roomManager.nextRound(req.params.code);
    res.json(room);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(400).json({ error: message });
  }
});

// Start Simulation
apiRouter.post('/rooms/:code/start-simulation', (req: Request, res: Response) => {
  try {
    const room = roomManager.startSimulation(req.params.code);
    res.json(room);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(400).json({ error: message });
  }
});

// Finish Match
apiRouter.post('/rooms/:code/finish-match', (req: Request, res: Response) => {
  try {
    const { hostGoals, guestGoals } = req.body;
    const room = roomManager.finishMatch(req.params.code, hostGoals, guestGoals);
    res.json(room);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(400).json({ error: message });
  }
});

// Leave Room
apiRouter.post('/rooms/:code/leave', (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    roomManager.leaveRoom(req.params.code, userId);
    res.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(400).json({ error: message });
  }
});

// Official League Rankings (Room Matches Only: Win 3pts, Draw 1pt, Loss 0pts)
apiRouter.get('/ranking', (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string | undefined;
    const leaderboard = rankingManager.getLeaderboard(userId);
    res.json(leaderboard);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

// Sync User Profile for Online Leaderboard
apiRouter.post('/ranking/sync', (req: Request, res: Response) => {
  try {
    const { userId, username, avatar } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    const player = rankingManager.syncUserProfile(userId, username, avatar);
    res.json(player);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

// ================= AUTHENTICATION & LOGIN =================
apiRouter.post('/auth/register', (req: Request, res: Response) => {
  try {
    const { username, password, avatar } = req.body;
    if (!username || !username.trim()) {
      return res.status(400).json({ error: 'يرجى إدخال اسم المدرب' });
    }
    const user = adminDb.registerUser(username, password, avatar);
    rankingManager.syncUserProfile(user.id, user.username, user.avatar);
    res.json({ success: true, user });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'فشل التسجيل';
    res.status(400).json({ error: message });
  }
});

apiRouter.post('/auth/login', (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    if (!username || !username.trim()) {
      return res.status(400).json({ error: 'يرجى إدخال اسم المدرب' });
    }
    const user = adminDb.authenticate(username, password);
    if (!user) {
      return res.status(401).json({ error: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
    }
    rankingManager.syncUserProfile(user.id, user.username, user.avatar);
    res.json({ success: true, user });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'فشل تسجيل الدخول';
    res.status(500).json({ error: message });
  }
});

// ================= ADMIN & PRIVATE DATABASE ROOM =================
apiRouter.get('/admin/database', (req: Request, res: Response) => {
  try {
    const snapshot = adminDb.getDatabaseSnapshot();
    const activeRooms = roomManager.getAllRooms();
    const rankings = rankingManager.getLeaderboard();
    res.json({
      success: true,
      snapshot,
      activeRooms,
      rankings,
      serverTime: Date.now()
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'فشل جلب بيانات الإدارة';
    res.status(500).json({ error: message });
  }
});

apiRouter.post('/admin/adjust-user', (req: Request, res: Response) => {
  try {
    const { userId, coinsDelta, pointsDelta, bidsDelta } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'معرف المستخدم مطلوب' });
    }
    const updated = adminDb.updateUserCoinsAndPoints(
      userId,
      coinsDelta || 0,
      pointsDelta || 0,
      bidsDelta || 0
    );
    res.json({ success: true, user: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'فشل تعديل المستخدم';
    res.status(500).json({ error: message });
  }
});

app.use('/players', express.static(path.resolve('public', 'players')));
app.use(express.static(path.resolve('public')));

app.use('/api', apiRouter);

async function start() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static('dist'));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve('dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`GOALIX server listening on http://0.0.0.0:${PORT}`);
  });
}

start();
