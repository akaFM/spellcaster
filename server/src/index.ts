import http from 'http';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Readable } from 'node:stream';
import type { ReadableStream as NodeReadableStream } from 'node:stream/web';
import { Server as SocketIOServer } from 'socket.io';
import { registerSocketHandlers } from './sockets';

dotenv.config();

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
const ALLOWED_ORIGINS = CLIENT_ORIGIN.split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const app = express();
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'zNsotODqUhvbJ5wMG7Ei';
const TTS_MAX_CHAR_LENGTH = 200;

// setting up express basics
app.use(express.json());
app.use(
  cors({
    origin: ALLOWED_ORIGINS,
    credentials: true,
  })
);

// tiny health check so we know the server boots
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.post('/tts', async (req, res) => {
  const text = typeof req.body?.text === 'string' ? req.body.text.trim() : '';
  const readingSpeed =
    typeof req.body?.readingSpeed === 'number' ? Number(req.body.readingSpeed) : undefined;
  const styleValue = readingSpeed ? Math.max(0, Math.min(1, readingSpeed)) : 0.75;
  const voiceId =
    (typeof req.body?.voiceId === 'string' && req.body.voiceId.trim()) || ELEVENLABS_VOICE_ID;

  if (!text) {
    return res.status(400).json({ message: 'text is required for tts' });
  }

  if (text.length > TTS_MAX_CHAR_LENGTH) {
    return res.status(400).json({ message: 'text is too long for tts' });
  }

  if (!ELEVENLABS_API_KEY) {
    return res.status(503).json({ message: 'tts service not configured' });
  }

  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.35,
          similarity_boost: 0.8,
          style: styleValue,
          use_speaker_boost: true,
        },
      }),
    });

    if (!response.ok || !response.body) {
      const errorText = await response.text();
      console.error(`[tts] upstream error ${response.status}`, errorText);
      return res.status(502).json({ message: 'failed to synthesize audio' });
    }

    res.setHeader('Content-Type', response.headers.get('content-type') ?? 'audio/mpeg');
    res.setHeader('Cache-Control', 'no-store');

    const readable = Readable.fromWeb(response.body as unknown as NodeReadableStream);
    readable.pipe(res);
  } catch (error) {
    console.error('[tts] request failed', error);
    res.status(502).json({ message: 'tts request failed' });
  }
});

const httpServer = http.createServer(app);

// plug socket.io into the same server
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// break socket handlers into their own module
registerSocketHandlers(io);

httpServer.listen(PORT, () => {
  console.log(`spellcaster server listening on port ${PORT}`);
});

