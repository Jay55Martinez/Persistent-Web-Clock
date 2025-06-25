import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        // Add other fields if you use them later (like email, role, etc.)
      };
    }
  }
}
