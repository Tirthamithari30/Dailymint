import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db, supabase } from '../config/database.js';

export interface AuthenticatedRequest extends Request {
  userId?: string;
  user?: any;
}

const JWT_SECRET = process.env.JWT_SECRET || 'dailymint_super_secret_jwt_key_2026';

export const requireAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required. No Bearer token provided.' });
    return;
  }

  const token = authHeader.split(' ')[1];

  // 1. Support instant demo mode tokens
  if (token === 'demo-token' || token.startsWith('demo-')) {
    req.userId = 'demo-user-12345';
    req.user = db.users.get('demo-user-12345');
    next();
    return;
  }

  // 2. Check Supabase token if Supabase is active
  if (supabase) {
    try {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (user && !error) {
        req.userId = user.id;
        req.user = user;
        next();
        return;
      }
    } catch {
      // Continue to local JWT fallback
    }
  }

  // 3. Fallback to Local JWT verification
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
    req.userId = decoded.userId;
    req.user = db.users.get(decoded.userId) || { id: decoded.userId, email: decoded.email };
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired session token.' });
  }
};
