import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { roomManager } from './server/roomManager';
import { leagueAndStoreManager } from './server/leagueAndStoreManager';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// Allow up to 10MB JSON payload for profile avatar data URLs
app.use(express.json({ limit: '10mb' }));

// API Router
const apiRouter = express.Router();

apiRouter.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', serverTime: Date.now() });
});

// ==================== AUTH & PROFILE ONBOARDING ROUTES ====================

// 1. Real Google Login / Account Authentication
apiRouter.post('/auth/google', (req: Request, res: Response) => {
  try {
    const { email, googleDisplayName, existingClientId } = req.body || {};
    const result = leagueAndStoreManager.googleLoginAccount({
      email,
      googleDisplayName,
      existingClientId,
    });
    res.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'فشل تسجيل الدخول باستخدام Google';
    res.status(400).json({ error: message });
  }
});

// 2. Complete First-Time Profile Setup (Unique Username + Avatar + Immutable GX-XXXXXX ID)
apiRouter.post('/auth/complete-profile', (req: Request, res: Response) => {
  try {
    const { userId, email, username, avatarDataUrl } = req.body || {};
    if (!userId) {
      return res.status(400).json({ error: 'معرف الحساب مطلوب' });
    }
    const account = leagueAndStoreManager.completeUserProfileSetup({
      userId,
      email,
      username,
      avatarDataUrl,
    });
    res.json({ account });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'تعذر حفظ الملف الشخصي';
    res.status(400).json({ error: message });
  }
});

// ==================== PLAYERS, LEAGUE & REWARDS ROUTES ====================

// Sync Player Account & Pull Pending Owner Top-Ups / Deliveries
apiRouter.post('/players/sync', (req: Request, res: Response) => {
  try {
    const body = req.body || {};
    if (!body.id) {
      return res.status(400).json({ error: 'Player id is required' });
    }
    const result = leagueAndStoreManager.syncPlayerAccount(body);
    res.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(400).json({ error: message });
  }
});

// Search Players by Account ID (GX-XXXXXX) or Username
apiRouter.get('/players/search', (req: Request, res: Response) => {
  const q = typeof req.query.q === 'string' ? req.query.q : '';
  const results = leagueAndStoreManager.searchPlayers(q);
  res.json(results);
});

// Get Official GOALIX League Standings (Daily & Weekly — Rooms Only)
apiRouter.get('/league/standings', (_req: Request, res: Response) => {
  res.json(leagueAndStoreManager.getLeagueStandings());
});

// Record Single-Player AI Match Reward (Server-enforced Max 5 Coins, 0 Rank Points)
apiRouter.post('/rewards/ai-match', (req: Request, res: Response) => {
  try {
    const { userId, matchId, gameId, outcome } = req.body || {};
    const result = leagueAndStoreManager.recordAiMatchReward({
      userId,
      matchId,
      gameId,
      outcome,
    });
    res.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'تعذر تسجيل مكافأة المباراة';
    res.status(400).json({ error: message });
  }
});

// Execute My Squad vs AI Trial Match (Server-enforced 3-day cooldown)
apiRouter.post('/rewards/squad-trial', (req: Request, res: Response) => {
  try {
    const { userId, matchId, outcome } = req.body || {};
    const result = leagueAndStoreManager.executeSquadTrialMatch({
      userId,
      matchId,
      outcome,
    });
    res.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'تجربة التشكيلة غير متاحة حاليًا';
    res.status(400).json({ error: message });
  }
});

// ==================== STORE, CATALOG & PURCHASE REQUEST ROUTES ====================

// Get Top-Up Store Packages, Transactions, Registered Players, Products & Chat Catalog
apiRouter.get('/store/state', (_req: Request, res: Response) => {
  res.json(leagueAndStoreManager.getStoreState());
});

// Get Store Products & Quick Chat Messages Catalog
apiRouter.get('/store/catalog', (_req: Request, res: Response) => {
  res.json(leagueAndStoreManager.getCatalogAndMessages());
});

// Create Store Purchase Request (Status: PENDING)
apiRouter.post('/store/purchase-request', (req: Request, res: Response) => {
  try {
    const { userId, productId, idempotencyKey } = req.body || {};
    const requestRecord = leagueAndStoreManager.createStorePurchaseRequest({
      userId,
      productId,
      idempotencyKey,
    });
    res.json({ request: requestRecord });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'فشل إرسال طلب الشراء';
    res.status(400).json({ error: message });
  }
});

// Get User's Purchase Requests
apiRouter.get('/store/purchase-requests/:userId', (req: Request, res: Response) => {
  const list = leagueAndStoreManager.getUserPurchaseRequests(req.params.userId);
  res.json({ requests: list });
});

// ==================== OWNER ADMIN CONTROL PANEL ROUTES ====================

// Get Full Owner Admin Dashboard State (403 if not Owner)
apiRouter.post('/admin/dashboard', (req: Request, res: Response) => {
  try {
    const { ownerUserId, ownerEmail } = req.body || {};
    const state = leagueAndStoreManager.getAdminDashboardState(ownerUserId, ownerEmail);
    res.json(state);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '403 Access Denied';
    res.status(403).json({ error: message });
  }
});

// Owner: Approve or Reject Store Purchase Request
apiRouter.post('/admin/purchase-review', (req: Request, res: Response) => {
  try {
    const { ownerUserId, ownerEmail, requestId, decision } = req.body || {};
    const updated = leagueAndStoreManager.reviewPurchaseRequestByOwner({
      ownerUserId,
      ownerEmail,
      requestId,
      decision,
    });
    res.json({ request: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'فشل معالجة طلب الشراء';
    const status = message.includes('403') ? 403 : 400;
    res.status(status).json({ error: message });
  }
});

// Owner: Save / Update Store Product
apiRouter.post('/admin/products/save', (req: Request, res: Response) => {
  try {
    const { ownerUserId, ownerEmail, product } = req.body || {};
    const products = leagueAndStoreManager.saveStoreProductByOwner({
      ownerUserId,
      ownerEmail,
      product,
    });
    res.json({ products });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'فشل حفظ المنتج';
    const status = message.includes('403') ? 403 : 400;
    res.status(status).json({ error: message });
  }
});

// Owner: Delete Store Product
apiRouter.post('/admin/products/delete', (req: Request, res: Response) => {
  try {
    const { ownerUserId, ownerEmail, productId } = req.body || {};
    const products = leagueAndStoreManager.deleteStoreProductByOwner({
      ownerUserId,
      ownerEmail,
      productId,
    });
    res.json({ products });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'فشل حذف المنتج';
    const status = message.includes('403') ? 403 : 400;
    res.status(status).json({ error: message });
  }
});

// Owner: Save / Update Quick Chat Message
apiRouter.post('/admin/chat-items/save', (req: Request, res: Response) => {
  try {
    const { ownerUserId, ownerEmail, item } = req.body || {};
    const chatMessages = leagueAndStoreManager.saveQuickChatItemByOwner({
      ownerUserId,
      ownerEmail,
      item,
    });
    res.json({ chatMessages });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'فشل حفظ الرسالة';
    const status = message.includes('403') ? 403 : 400;
    res.status(status).json({ error: message });
  }
});

// Owner: Delete Quick Chat Message
apiRouter.post('/admin/chat-items/delete', (req: Request, res: Response) => {
  try {
    const { ownerUserId, ownerEmail, messageId } = req.body || {};
    const chatMessages = leagueAndStoreManager.deleteQuickChatItemByOwner({
      ownerUserId,
      ownerEmail,
      messageId,
    });
    res.json({ chatMessages });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'فشل حذف الرسالة';
    const status = message.includes('403') ? 403 : 400;
    res.status(status).json({ error: message });
  }
});

// Execute Owner Top-Up by Player ID
apiRouter.post('/store/topup', (req: Request, res: Response) => {
  try {
    const result = leagueAndStoreManager.executeOwnerTopUp(req.body || {});
    res.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'فشل تنفيذ عملية الشحن';
    res.status(400).json({ error: message });
  }
});

// Owner: Save / Update Top-Up Package
apiRouter.post('/store/packages/save', (req: Request, res: Response) => {
  try {
    const packages = leagueAndStoreManager.saveTopUpPackage(req.body || {});
    res.json({ packages });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'فشل حفظ الباقة';
    res.status(400).json({ error: message });
  }
});

// Owner: Delete Top-Up Package
apiRouter.post('/store/packages/delete', (req: Request, res: Response) => {
  try {
    const { packageId } = req.body || {};
    const packages = leagueAndStoreManager.deleteTopUpPackage(packageId);
    res.json({ packages });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'فشل حذف الباقة';
    res.status(400).json({ error: message });
  }
});

// ==================== REAL MULTIPLAYER ROOMS ROUTES (2 PLAYERS ONLY, NO BOTS) ====================

// Get Public Waiting Rooms List
apiRouter.get('/rooms', (_req: Request, res: Response) => {
  res.json(roomManager.getWaitingRooms());
});

// Create Room (with RoomType, TimerSeconds, ChatEnabled)
apiRouter.post('/rooms/create', (req: Request, res: Response) => {
  try {
    const { hostId, hostName, gameId, mode, roomType, timerSeconds, chatEnabled } = req.body || {};
    if (!hostId) {
      return res.status(400).json({ error: 'hostId is required' });
    }
    const room = roomManager.createRoom(
      hostId,
      hostName,
      gameId,
      mode,
      roomType || 'PUBLIC',
      timerSeconds || 30,
      chatEnabled !== undefined ? Boolean(chatEnabled) : true
    );
    res.json(room);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

// Join Room (Player 1 VS Player 2 only)
apiRouter.post('/rooms/join', (req: Request, res: Response) => {
  try {
    const { code, guestId, guestName } = req.body || {};
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
    const { userId, ready } = req.body || {};
    const room = roomManager.setReady(req.params.code, userId, ready);
    res.json(room);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(400).json({ error: message });
  }
});

// Explicit Host Start Match
apiRouter.post('/rooms/:code/start', (req: Request, res: Response) => {
  try {
    const { hostId } = req.body || {};
    const room = roomManager.startRoomMatch(req.params.code, hostId);
    res.json(room);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(400).json({ error: message });
  }
});

// Select Game, Mode, Timer & Chat Setting
apiRouter.post('/rooms/:code/select-game', (req: Request, res: Response) => {
  try {
    const { hostId, gameId, mode, timerSeconds, chatEnabled } = req.body || {};
    const room = roomManager.selectGame(
      req.params.code,
      hostId,
      gameId,
      mode,
      timerSeconds,
      chatEnabled
    );
    res.json(room);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(400).json({ error: message });
  }
});

// Send Quick Chat Message (Server-Side enforced: Max 6 messages, 15s cooldown, ownership check)
apiRouter.post('/rooms/:code/chat', (req: Request, res: Response) => {
  try {
    const { userId, messageId } = req.body || {};
    const room = roomManager.sendQuickChatMessage(req.params.code, userId, messageId);
    res.json(room);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'فشل إرسال الرسالة';
    res.status(400).json({ error: message });
  }
});

// Submit STAT ARENA Answer
apiRouter.post('/rooms/:code/stat-answer', (req: Request, res: Response) => {
  try {
    const { userId, answer } = req.body || {};
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
    const { userId, boxIndex } = req.body || {};
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
    const { hostGoals, guestGoals } = req.body || {};
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
    const { userId } = req.body || {};
    roomManager.leaveRoom(req.params.code, userId);
    res.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(400).json({ error: message });
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
