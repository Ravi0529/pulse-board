import { Request } from "express";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        username: string | null;
        email: string;
        password: string;
        createdAt: Date | null;
      };
    }
  }
}
