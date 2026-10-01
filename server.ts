import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { roomManager } from './server/roomManager';
import { rankingManager } from './server/rankingManager';
import { adminDb } from './server/adminDb';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Root Health Check endpoint required for Google Cloud Run
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

// API Router
const apiRouter = express.Router();

apiRouter.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', serverTime: Date.now() });
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
      return res.status(400).json({ error: 'يرجى إدخال اسم المدرب أو Account ID' });
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

// Google Sign-In & Instant Account Linking
apiRouter.post('/auth/google', (req: Request, res: Response) => {
  try {
    const { googleId, email, name, avatar } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'البريد الإلكتروني مطلوب' });
    }
    const user = adminDb.handleGoogleLogin({
      googleId: googleId || `g_${Date.now()}`,
      email,
      name: name || email.split('@')[0],
      avatar
    });
    rankingManager.syncUserProfile(user.id, user.username, user.avatar);
    res.json({ success: true, user });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'فشل تسجيل الدخول عبر Google';
    res.status(500).json({ error: message });
  }
});

// Profile Management
apiRouter.post('/profile/update-username', (req: Request, res: Response) => {
  try {
    const { userId, newUsername } = req.body;
    if (!userId || !newUsername) {
      return res.status(400).json({ error: 'المعرف واسم المستخدم الجديد مطلوبان' });
    }
    const user = adminDb.updateUsername(userId, newUsername);
    rankingManager.syncUserProfile(user.id, user.username, user.avatar);
    res.json({ success: true, user });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'فشل تحديث الاسم';
    res.status(400).json({ error: message });
  }
});

apiRouter.post('/profile/update-avatar', (req: Request, res: Response) => {
  try {
    const { userId, avatar } = req.body;
    if (!userId || !avatar) {
      return res.status(400).json({ error: 'المعرف والصورة مطلوبان' });
    }
    const user = adminDb.updateAvatar(userId, avatar);
    rankingManager.syncUserProfile(user.id, user.username, user.avatar);
    res.json({ success: true, user });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'فشل تحديث الصورة';
    res.status(400).json({ error: message });
  }
});

apiRouter.get('/profile/:id', (req: Request, res: Response) => {
  try {
    const user = adminDb.getUser(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'المستخدم غير موجود' });
    }
    res.json({ success: true, user });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'خطأ في جلب الملف الشخصي';
    res.status(500).json({ error: message });
  }
});

// ================= STORE & REAL PURCHASES =================
apiRouter.get('/store/products', (req: Request, res: Response) => {
  try {
    const category = req.query.category as any;
    const products = adminDb.getStoreProducts(category);
    res.json({ success: true, products });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'فشل جلب منتجات المتجر';
    res.status(500).json({ error: message });
  }
});

apiRouter.post('/store/purchase', (req: Request, res: Response) => {
  try {
    const { userId, productId } = req.body;
    if (!userId || !productId) {
      return res.status(400).json({ error: 'معرف المستخدم ومعرف المنتج مطلوبان' });
    }
    const result = adminDb.purchaseProduct(userId, productId);
    rankingManager.syncUserProfile(result.user.id, result.user.username, result.user.avatar);
    res.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'فشل إتمام الشراء';
    res.status(400).json({ error: message });
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

apiRouter.post('/admin/search-player', (req: Request, res: Response) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'يرجى إدخال Account ID أو اسم المستخدم' });
    }
    const user = adminDb.getUser(query);
    if (!user) {
      return res.status(404).json({ error: 'لم يتم العثور على أي لاعب بهذا الـ ID أو الاسم' });
    }
    res.json({ success: true, user });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'خطأ في البحث';
    res.status(500).json({ error: message });
  }
});

apiRouter.post('/admin/adjust-coins', (req: Request, res: Response) => {
  try {
    const { targetUserIdOrAccountId, coinsDelta, adminId, reason } = req.body;
    if (!targetUserIdOrAccountId || typeof coinsDelta !== 'number') {
      return res.status(400).json({ error: 'البيانات غير مكتملة' });
    }
    const user = adminDb.adjustUserCoins(
      targetUserIdOrAccountId, 
      coinsDelta, 
      adminId || 'dev_mahmoud_salama', 
      reason
    );
    res.json({ success: true, user });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'فشل تعديل رصيد الكوينز';
    res.status(400).json({ error: message });
  }
});

apiRouter.post('/admin/products/create', (req: Request, res: Response) => {
  try {
    const product = adminDb.createStoreProduct(req.body);
    res.json({ success: true, product });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'فشل إنشاء المنتج';
    res.status(400).json({ error: message });
  }
});

apiRouter.post('/admin/products/update', (req: Request, res: Response) => {
  try {
    const { id, ...updates } = req.body;
    if (!id) return res.status(400).json({ error: 'معرف المنتج مطلوب' });
    const product = adminDb.updateStoreProduct(id, updates);
    res.json({ success: true, product });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'فشل تعديل المنتج';
    res.status(400).json({ error: message });
  }
});

apiRouter.post('/admin/products/delete', (req: Request, res: Response) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'معرف المنتج مطلوب' });
    const success = adminDb.deleteStoreProduct(id);
    res.json({ success });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'فشل حذف المنتج';
    res.status(400).json({ error: message });
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
  const distPath = path.resolve('dist');
  const hasDist = fs.existsSync(path.join(distPath, 'index.html'));
  const isProduction = process.env.NODE_ENV === 'production' || (hasDist && process.env.NODE_ENV !== 'development');

  if (isProduction) {
    console.log(`Starting in PRODUCTION mode. Serving static assets from ${distPath}`);
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response, next) => {
      if (req.path.startsWith('/api') || req.path === '/health') {
        return next();
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    console.log('Starting in DEVELOPMENT mode with Vite middleware');
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`GOALIX server listening on http://0.0.0.0:${PORT} (mode: ${isProduction ? 'production' : 'development'})`);
  });

  const shutdown = () => {
    console.log('Shutting down server gracefully...');
    server.close(() => {
      console.log('Server closed successfully.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

start();
