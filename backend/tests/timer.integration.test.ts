// Integration test for the timer functionality
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../src/app';
import Timer from '../src/models/timer.model';

describe('Timer Integration Tests', () => {
  it('creates a new timer on POST /api/timer/start', async () => {
    // Create a valid JWT token for testing
    const mockUserId = '64abc1234567890abcdef123';
    // Use 'userId' to match what the auth controller creates
    const token = jwt.sign({ userId: mockUserId }, process.env.JWT_SECRET || 'test-secret', {
      expiresIn: '1h'
    });

    const res = await request(app)
      .post('/api/timer/start')
      .set('Authorization', `Bearer ${token}`)
      .send();

    expect(res.status).toBe(200);
    expect(res.body.userId).toBe(mockUserId);

    const timer = await Timer.findOne({ userId: mockUserId });
    expect(timer).not.toBeNull();
    expect(timer?.isRunning).toBe(true);
  });
});
