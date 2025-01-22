import { THIRTY_DAY } from '../constans/constans.js';
import {
  getUser,
  loginOrSignupWithGoogle,
  loginUser,
  logoutUser,
  refreshUserSession,
  registerUser,
  updateUser,
} from '../services/users.js';
import { generateAutUrl } from '../utils/googleOAuth2.js';
import { uploadToCloudinary } from '../utils/uploadToCloudinary .js';
import { getAllUsers } from '../services/users.js';

export const registerUserController = async (req, res) => {
  const user = await registerUser(req.body);

  res.status(201).json({
    status: 201,
    message: 'Seccessfully registered a user',
    data: { email: user.email },
  });
};

export const loginUserController = async (req, res) => {
  const session = await loginUser(req.body);

  res.cookie('refreshToken', session.refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'None',
    expires: new Date(Date.now() + THIRTY_DAY),
  });

  res.cookie('sessionId', session._id, {
    httpOnly: true,
    secure: true,
    sameSite: 'None',
    expires: new Date(Date.now() + THIRTY_DAY),
  });

  res.status(200).json({
    status: 200,
    message: 'Successfully logged in an user!',
    data: { accessToken: session.accessToken },
  });
};

export const setupSession = (res, session) => {
  res.cookie('refreshToken', session.refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'None',
    expires: new Date(Date.now() + THIRTY_DAY),
  });

  res.cookie('sessionId', session._id, {
    httpOnly: true,
    secure: true,
    sameSite: 'None',
    expires: new Date(Date.now() + THIRTY_DAY),
  });
};

export const refreshUserSessionController = async (req, res) => {
  const session = await refreshUserSession({
    sessionId: req.cookies.sessionId,
    refreshToken: req.cookies.refreshToken,
  });

  setupSession(res, session);

  res.status(200).json({
    status: 200,

    message: 'Successfully refreshed a session',
    data: { accessToken: session.accessToken },
  });
};

export const logoutUserController = async (req, res) => {
  await logoutUser(req.cookies);

  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: true,
    sameSite: 'None',
    path: '/',
  });

  res.clearCookie('sessionId', {
    httpOnly: true,
    secure: true,
    sameSite: 'None',
    path: '/',
  });

  res.status(204).end();
};

export const gerUserController = async (req, res) => {
  const userData = await getUser(req.user);

  res.status(200).json({
    status: 200,
    message: 'User found successfully!',
    data: userData,
  });
};

export const updateUserController = async (req, res) => {
  const { user } = req;
  const avatar = req.file;

  let avatarUrl;

  if (avatar) {
    const result = await uploadToCloudinary(req.file.path);

    avatarUrl = result;
  }

  const result = await updateUser(user, {
    ...req.body,
    avatar: avatarUrl,
  });

  res.status(200).json({
    status: 200,
    message: 'Successfully patched a contact!',
    data: result.userData,
  });
};

export const getGoogleOAuthUrlController = async (req, res) => {
  const url = generateAutUrl();
  res.status(200).json({
    status: 200,
    message: 'Successfully get Google OAuth url!',
    data: { url },
  });
};

export const loginWithGoogleController = async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({
      status: 400,
      message: 'Authorization code is required.',
    });
  }

  const session = await loginOrSignupWithGoogle(code);

  res.cookie('refreshToken', session.refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'None',
    expires: new Date(Date.now() + THIRTY_DAY),
  });

  res.cookie('sessionId', session._id, {
    httpOnly: true,
    secure: true,
    sameSite: 'None',
    expires: new Date(Date.now() + THIRTY_DAY),
  });

  console.log(session._id);

  const frontendUrl = `https://aqua-dev-amber.vercel.app/google-callback`;
  const redirectUrl = `${frontendUrl}?accessToken=${session.accessToken}`;

  res.redirect(redirectUrl);
};

export const getAllUsersController = async (req, res) => {
  const usersCount = await getAllUsers();

  res.json({
    status: 200,
    message: 'Successfully found the amount of users!',
    usersAmount: usersCount,
  });
};
