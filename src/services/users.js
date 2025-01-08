import createHttpError from 'http-errors';
import { UsersCollection } from '../db/models/user.js';
import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { Session } from '../db/models/session.js';
import { THIRTY_DAY, TWO_HOURS } from '../constans/constans.js';

export const registerUser = async (payload) => {
  const user = await UsersCollection.findOne({ email: payload.email });
  if (user) throw createHttpError(409, 'Email in use');

  const encryptedPassword = await bcrypt.hash(payload.password, 10);
  return await UsersCollection.create({
    ...payload,
    password: encryptedPassword,
  });
};

export const loginUser = async (payload) => {
  const user = await UsersCollection.findOne({ email: payload.email });

  if (!user)
    throw createHttpError(404, 'Authentication failed. No such user exists');

  const isPasswordMatch = await bcrypt.compare(payload.password, user.password);

  if (!isPasswordMatch)
    throw createHttpError(401, 'Authentication failed. Invalid password');

  await Session.deleteOne({ userId: user._id });

  const accessToken = randomBytes(30).toString('base64');
  const refreshToken = randomBytes(30).toString('base64');

  return await Session.create({
    userId: user._id,
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + TWO_HOURS),
    refreshTokenValidUntil: new Date(Date.now() + THIRTY_DAY),
  });
};

const createSession = () => {
  const accessToken = randomBytes(30).toString('base64');
  const refreshToken = randomBytes(30).toString('base64');

  return {
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + TWO_HOURS),
    refreshTokenValidUntil: new Date(Date.now() + THIRTY_DAY),
  };
};

export const refreshUserSession = async ({ sessionId, refreshToken }) => {
  const session = await Session.findOne({
    _id: sessionId,
    refreshToken: refreshToken,
  });

  if (!session)
    throw createHttpError(401, 'Authentication failed. Session not found');

  const isSessionTokenEpired =
    new Date() > new Date(session.refreshTokenValidUntil);

  if (isSessionTokenEpired)
    throw createHttpError(401, 'Authentication failed. Session token expired');

  const newSession = createSession();

  await Session.deleteOne({ _id: sessionId, refreshToken: refreshToken });

  return await Session.create({ userId: session.userId, ...newSession });
};

export const logoutUser = async (cookies) => {
  const { sessionId, refreshToken } = cookies;

  if (!sessionId && !refreshToken)
    throw createHttpError(401, 'Authentication failed. Session not found');

  await Session.deleteOne({ _id: sessionId, refreshToken: refreshToken });
};
