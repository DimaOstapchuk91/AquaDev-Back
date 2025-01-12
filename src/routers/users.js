import { Router } from 'express';
import express from 'express';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { validateBody } from '../middlewares/validateBody.js';
import {
  authSchema,
  loginWithGoogleOAuthSchema,
  updateUserSchema,
} from '../validation/users.js';
import {
  gerUserController,
  getGoogleOAuthUrlController,
  loginUserController,
  loginWithGoogleController,
  logoutUserController,
  refreshUserSessionController,
  registerUserController,
  updateUserController,
} from '../controllers/users.js';
import { authenticate } from '../middlewares/authenticate.js';
import { upload } from '../middlewares/upload.js';

const jsonParser = express.json();

const router = Router();

router.post(
  '/register',
  jsonParser,
  validateBody(authSchema),
  ctrlWrapper(registerUserController),
);
router.post(
  '/login',
  jsonParser,
  validateBody(authSchema),
  ctrlWrapper(loginUserController),
);
router.post('/refresh', ctrlWrapper(refreshUserSessionController));
router.post('/logout', ctrlWrapper(logoutUserController));
router.get('/data', authenticate, ctrlWrapper(gerUserController));
router.patch(
  '/update',
  authenticate,
  jsonParser,
  upload.single('avatar'),
  validateBody(updateUserSchema),
  ctrlWrapper(updateUserController),
);

router.get('/auth/google/url', ctrlWrapper(getGoogleOAuthUrlController));

router.post(
  '/auth/google/callback',
  jsonParser,
  validateBody(loginWithGoogleOAuthSchema),
  ctrlWrapper(loginWithGoogleController),
);

export default router;
