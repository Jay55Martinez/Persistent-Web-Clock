import express from 'express';
import {
  startTimer,
  pauseTimer,
  resetTimer,
  getTimerStatus,
} from '../controllers/timer.controller';
import { authenticateUser } from '../middleware/auth';

const router = express.Router();

// All routes are protected
router.use(authenticateUser as any);

router.post('/start', startTimer as any);
router.post('/pause', pauseTimer as any);
router.post('/reset', resetTimer as any);
router.get('/status', getTimerStatus as any);

export default router;