import { Response, NextFunction } from 'express';
import { getSession } from '../config/redis';
import { queryOne } from '../config/database';
import { User, AuthenticatedUserRequest, ApiResponse } from '../types';

export async function userAuth(
  req: AuthenticatedUserRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Missing or invalid Authorization header',
      },
    };
    res.status(401).json(response);
    return;
  }

  const token = authHeader.substring(7);

  if (!token.startsWith('sess_human_')) {
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid session token format',
      },
    };
    res.status(401).json(response);
    return;
  }

  try {
    const session = await getSession(token);

    if (!session || !session['userId']) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Session expired or invalid',
        },
      };
      res.status(401).json(response);
      return;
    }

    const user = await queryOne<User>(
      'SELECT * FROM users WHERE id = $1',
      [session['userId']]
    );

    if (!user) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User not found',
        },
      };
      res.status(401).json(response);
      return;
    }

    req.user = user;
    req.sessionToken = token;
    next();
  } catch (err) {
    next(err);
  }
}
