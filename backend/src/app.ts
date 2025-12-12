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

// Log CORS configuration on startup
console.log('CORS Configuration:');
console.log('Allowed origins:', allowedOrigins);
console.log('Environment:', process.env.NODE_ENV || 'development');
console.log('Trust proxy:', 1);

app.use(cors({
  origin: (origin, callback) => {
    // Log every CORS request for debugging
    console.log(`CORS request from origin: ${origin || 'none (non-browser)'}`);
    
    if (!origin) {
      console.log('Allowed (no origin - likely server-to-server)');
      return callback(null, true);
    }
    
    const clean = origin.replace(/\/$/, '');
    if (allowedOrigins.includes(clean)) {
      console.log('Allowed (matches configured origin)');
      return callback(null, true);
    }
    
    console.error(`REJECTED - Origin "${clean}" not in allowed list:`, allowedOrigins);
    return callback(new Error(`CORS: Origin "${clean}" not allowed. Configured origins: ${allowedOrigins.join(', ')}`), false);
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

// Global error handler for better debugging
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err.message);
  console.error('Path:', req.path);
  console.error('Method:', req.method);
  console.error('Origin:', req.headers.origin || 'none');
  
  if (err.message && err.message.includes('CORS')) {
    res.status(403).json({ 
      error: 'CORS error',
      message: err.message,
      origin: req.headers.origin,
      allowedOrigins: allowedOrigins
    });
    return;
  }
  
  res.status(500).json({ error: 'Internal server error' });
});

export default app;