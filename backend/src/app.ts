import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import timerRoutes from './routes/timer.routes';
import cookieParser from 'cookie-parser';

dotenv.config();
const app = express();

// Allow multiple comma-separated origins via FRONTEND_ORIGIN
const allowedOrigins = (process.env.FRONTEND_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((s) => s.trim().replace(/\/$/, ''))
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // non-browser clients like curl/postman
    const clean = origin.replace(/\/$/, '');
    if (allowedOrigins.includes(clean)) return callback(null, true);
    return callback(new Error('CORS: Origin not allowed'), false);
  },
  credentials: true,
}));

// Needed so secure cookies work behind Render/Proxies
app.set('trust proxy', 1);

app.use(cookieParser());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/timer', timerRoutes);
app.get('/api/test', (req, res) => {
  res.json({ message: 'Test endpoint working' });
});

export default app;