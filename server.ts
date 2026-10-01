import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { roomManager } from './server/roomManager';

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
