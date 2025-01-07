import { Router } from 'express';
import express from 'express';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { validateBody } from '../middlewares/validateBody.js';

const jsonParser = express.json();

const router = Router();

export default router;
