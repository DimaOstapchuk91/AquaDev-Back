import createHttpError from 'http-errors';
import { Session } from '../db/models/session.js';
import { UsersCollection } from '../db/models/user.js';
import { refreshUserSession } from '../services/users.js';
import { setupSession } from '../controllers/users.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.get('Authorization');

    if (!authHeader) {
      next(createHttpError(401, 'The authorization header is missing'));
      return;
    }

    // const bearer = authHeader.split(' ')[0];
    // const token = authHeader.split(' ')[1];

    const [bearer, token] = authHeader.split(' ');

    if (bearer !== 'Bearer' || !token) {
      next(createHttpError(401, 'Auth header should be of type Bearer'));
      return;
    }

    const session = await Session.findOne({ accessToken: token });

    if (!session) {
      next(createHttpError(401, 'Session not found'));
      return;
    }

    const isAccessTokenExpired =
      new Date() > new Date(session.accessTokenValidUntil);

    if (isAccessTokenExpired) {
      next(createHttpError(401, 'Access token expired'));
      return;
    }

    const user = await UsersCollection.findById(session.userId);

    if (!user) {
      next(createHttpError(401, 'User not found'));
      return;
    }

    req.user = user;

    next();
  } catch (error) {
    next(error);
  }
};
