import createHttpError from 'http-errors';
import { UsersCollection } from '../db/models/user.js';
import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { Session } from '../db/models/session.js';
import { THIRTY_DAY, TWO_HOURS } from '../constans/constans.js';
import {
  getFullNameFromGoogleTokenPayload,
  googleOAuthClient,
  validateCode,
} from '../utils/googleOAuth2.js';
import { GoogleAuth, OAuth2Client } from 'google-auth-library';

export const registerUser = async (payload) => {
  const user = await UsersCollection.findOne({ email: payload.email });
  if (user) throw createHttpError(409, 'Email in use');

  const encryptedPassword = await bcrypt.hash(payload.password, 10);
  return await UsersCollection.create({
    ...payload,
    password: encryptedPassword,
  });
};

// ==============================================

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

// ==============================================

export const loginUser = async (payload) => {
  const user = await UsersCollection.findOne({ email: payload.email });

  if (!user)
    throw createHttpError(404, 'Authentication failed. No such user exists');

  const isPasswordMatch = await bcrypt.compare(payload.password, user.password);

  if (!isPasswordMatch)
    throw createHttpError(401, 'Authentication failed. Invalid password');

  const newSession = createSession();

  return await Session.create({ userId: user._id, ...newSession });
};

// ==============================================

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

  session.accessToken = randomBytes(30).toString('base64');
  session.refreshToken = randomBytes(30).toString('base64');
  session.accessTokenValidUntil = new Date(Date.now() + TWO_HOURS);
  session.refreshTokenValidUntil = new Date(Date.now() + THIRTY_DAY);

  await session.save();

  return session;
};

// ==============================================

export const logoutUser = async (cookies) => {
  const { sessionId, refreshToken } = cookies;

  if (!sessionId && !refreshToken)
    throw createHttpError(401, 'Authentication failed. Session not found');

  await Session.deleteOne({ _id: sessionId, refreshToken: refreshToken });
};

// ==============================================

export const getUser = async (user) => {
  const userData = await UsersCollection.findOne({
    _id: user._id,
  });

  if (!userData) throw createHttpError(404, 'User not found');

  return userData;
};

// ==============================================

export const updateUser = async (user, userData, options = {}) => {
  const rawResult = await UsersCollection.findOneAndUpdate(
    { _id: user._id },
    userData,
    {
      new: true,
      includeResultMetadata: true,
      ...options,
    },
  );

  if (!rawResult || !rawResult.value)
    throw createHttpError(404, 'User not found');

  return {
    userData: rawResult.value,
    isNew: Boolean(rawResult?.lastErrorObject.upserted),
  };
};


export const loginOrSignupWithGoogle = async (req, res, next) => {
  try {
    const { code } = req.body;
    const { tokens } = await googleOAuthClient.getToken(code);
    googleOAuthClient.setCredentials(tokens);

    const oauth2 = GoogleAuth.oauth2({
      auth: OAuth2Client,
      version: 'v2',
    });

    const userInfo = await oauth2.userinfo.get();
    res.json({ user: userInfo.data });

    if (!code) {
      return res.status(400).json({
        status: 400,
        message: 'Authorization code is required!',
      });
    }

    const ticket = await validateCode(code);
    const payload = ticket.getPayload();

    if (!payload.email_verified) {
      return res.status(401).json({
        status: 401,
        message: 'Email not verified by Google!',
      });
    }

    let user = await UsersCollection.findOne({ email: payload.email });

    if (!user) {
      user = await UsersCollection.create({
        email: payload.email,
        name: getFullNameFromGoogleTokenPayload(payload),
        password: null,
      });
    }

    const session = await createSession(user._id);

    res.cookie('refreshToken', session.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      expires: new Date(session.refreshTokenValidUntil),
    });

    res.cookie('sessionId', session._id, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      expires: new Date(session.refreshTokenValidUntil),
    });

    res.status(200).json({
      status: 200,
      message: 'Successfully authenticated via Google!',
      data: {
        accessToken: session.accessToken,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
        },
      },
    });
  } catch (err) {
    next(err);
  }

// ==============================================

export const getAllUsers = async () => {
  const usersQuery = UsersCollection.find();

  const usersCount = await UsersCollection.find()
    .merge(usersQuery)
    .countDocuments();

  return {
    usersAmount: usersCount,
  };

};
