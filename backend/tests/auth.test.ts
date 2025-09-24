/// <reference types="jest" />
import { Request, Response } from 'express';
import { signup, login, resetPassword, requestPasswordReset } from '../src/controllers/auth.controller';
import User from '../src/models/user.model';
import Code from '../src/models/verificationCode.model';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

jest.mock('../src/models/user.model', () => ({
  __esModule: true,
  default: {
    findOne: jest.fn(),
    create: jest.fn(),
  },
}));
jest.mock('../src/models/verificationCode.model', () => ({
  __esModule: true,
  default: {
    findOne: jest.fn(),
    create: jest.fn(),
  },
}));
jest.mock('../src/email/transporter', () => ({
  __esModule: true,
  default: { sendMail: jest.fn().mockResolvedValue({}) }
}));
jest.mock('bcryptjs', () => ({
  __esModule: true,
  default: {
    hash: jest.fn(async () => 'hashed-password'),
    compare: jest.fn(async () => true),
  },
}));
jest.mock('jsonwebtoken', () => ({
  __esModule: true,
  default: {
    sign: jest.fn(() => 'mock-token'),
  },
}));
jest.mock('../src/utils/auth.utils', () => ({
  __esModule: true,
  checkIfValidPassword: jest.fn(() => true),
  generateVerificationCode: jest.fn(() => 123456),
}));

const mockRes = () => {
  const json = jest.fn();
  const status = jest.fn().mockReturnThis();
  const cookie = jest.fn().mockReturnThis();
  const clearCookie = jest.fn().mockReturnThis();
  return { json, status, cookie, clearCookie } as unknown as Response & {
    json: jest.Mock,
    status: jest.Mock,
    cookie: jest.Mock,
    clearCookie: jest.Mock,
  };
};

describe('Auth Controllers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('signup', () => {
    it('returns 400 for invalid email', async () => {
      const req = { body: { email: 'bad-email', password: 'ValidPassword!234' } } as unknown as Request;
      const res = mockRes();
      await signup(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid email format.' });
    });

    it('returns 409 when user exists', async () => {
      (User.findOne as unknown as jest.Mock).mockResolvedValue({ _id: 'u1' });
      const req = { body: { email: 'test@example.com', password: 'ValidPassword!234' } } as unknown as Request;
      const res = mockRes();
      await signup(req, res);
      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(res.status).toHaveBeenCalledWith(409);
    });

    it('creates user, stores code, and sends email', async () => {
      (User.findOne as unknown as jest.Mock).mockResolvedValue(null);
      (Code.findOne as unknown as jest.Mock).mockResolvedValue(null);
      (Code.create as unknown as jest.Mock).mockResolvedValue({});
      (User.create as unknown as jest.Mock).mockResolvedValue({
        email: 'test@example.com', isVerified: false, isLoggedIn: false, verificationTokenExpires: new Date()
      });

      const req = { body: { email: 'test@example.com', password: 'ValidPassword!234' } } as unknown as Request;
      const res = mockRes();
      await signup(req, res);

      expect(Code.create).toHaveBeenCalled();
      expect(User.create).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ user: expect.objectContaining({ email: 'test@example.com' }) }));
    });
  });

  describe('login', () => {
    it('returns 401 when user not found', async () => {
      (User.findOne as unknown as jest.Mock).mockResolvedValue(null);
      const req = { body: { email: 'x@example.com', password: 'p', rememberMe: false } } as unknown as Request;
      const res = mockRes();
      await login(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('returns 424 when user not verified', async () => {
      (User.findOne as unknown as jest.Mock).mockResolvedValue({ isVerified: false });
      const req = { body: { email: 'x@example.com', password: 'p', rememberMe: false } } as unknown as Request;
      const res = mockRes();
      await login(req, res);
      expect(res.status).toHaveBeenCalledWith(424);
    });

    it('returns 200 and sets cookies for valid login', async () => {
      (User.findOne as unknown as jest.Mock).mockResolvedValue({
        email: 'x@example.com',
        isVerified: true,
        isLocked: false,
        loginAttempts: 0,
        password: 'hashed',
        save: jest.fn().mockResolvedValue(undefined),
      });
      (bcrypt.compare as unknown as jest.Mock).mockResolvedValue(true);
      const req = { body: { email: 'x@example.com', password: 'p', rememberMe: true } } as unknown as Request;
      const res = mockRes();
      await login(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.cookie).toHaveBeenCalledTimes(2);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ user: expect.objectContaining({ email: 'x@example.com' }) }));
    });
  });

  describe('resetPassword', () => {
    it('returns 400 when code not found', async () => {
      (Code.findOne as unknown as jest.Mock).mockResolvedValue(null);
      const req = { body: { email: 'x@example.com', code: 111111, password: 'NewValidP@ssw0rd', rememberMe: false } } as unknown as Request;
      const res = mockRes();
      await resetPassword(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('returns 400 when new password equals old', async () => {
      (Code.findOne as unknown as jest.Mock).mockResolvedValue({});
      (User.findOne as unknown as jest.Mock).mockResolvedValue({ password: 'oldhash' });
      (bcrypt.compare as unknown as jest.Mock).mockResolvedValue(true);
      const req = { body: { email: 'x@example.com', code: 111111, password: 'SamePassword!234', rememberMe: false } } as unknown as Request;
      const res = mockRes();
      await resetPassword(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('returns 200 and sets cookies on success', async () => {
      const deleteOne = jest.fn();
      (Code.findOne as unknown as jest.Mock).mockResolvedValue({ deleteOne });
      (User.findOne as unknown as jest.Mock).mockResolvedValue({
        _id: 'uid',
        email: 'x@example.com',
        isVerified: true,
        isLoggedIn: false,
        password: 'oldhash',
        save: jest.fn().mockResolvedValue(undefined),
        loginAttempts: 0,
        isLocked: false,
      });
      (bcrypt.compare as unknown as jest.Mock).mockResolvedValue(false); // new password is different
      const req = { body: { email: 'x@example.com', code: 111111, password: 'NewValidP@ssw0rd!', rememberMe: true } } as unknown as Request;
      const res = mockRes();
      await resetPassword(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.cookie).toHaveBeenCalledTimes(2);
      expect(deleteOne).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ user: expect.objectContaining({ email: 'x@example.com', isLoggedIn: true }) }));
    });
  });
});
