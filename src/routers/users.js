import { Router } from 'express';
import express from 'express';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { validateBody } from '../middlewares/validateBody.js';
import { authSchema } from '../validation/users.js';
import {
  loginUserController,
  registerUserController,
} from '../controllers/users.js';

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

export default router;
