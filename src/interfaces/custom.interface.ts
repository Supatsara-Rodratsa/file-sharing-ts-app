import User from '@/models/user';
import { Request } from 'express';
import { Session } from 'express-session';

export interface CustomSession extends Session {
  accessToken: string;
}

export interface CustomRequest extends Request {
  decodedToken?: User;
}

declare module 'express-session' {
  interface SessionData {
    accessToken?: string;
  }
}
