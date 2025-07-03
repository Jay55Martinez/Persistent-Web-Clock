import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import timerRoutes from './routes/timer.routes';
import cookieParser from 'cookie-parser';

dotenv.config();
const app = express();

app.use(cors({
  origin: 'http://localhost:5173', // Your frontend URL
  credentials: true, // Allow cookies to be sent
}));

app.use(cookieParser());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/timer', timerRoutes);
app.get('/api/test', (req, res) => {
  res.json({ message: 'Test endpoint working' });
});

export default app;