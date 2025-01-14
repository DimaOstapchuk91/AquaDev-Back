import { Router } from 'express';
import express from 'express';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { validateBody } from '../middlewares/validateBody.js';
import {
  addWaterPortionController,
  deleteWaterPortionController,
  getCurrentDayWaterController,
  getMonthWaterController,
  updateWaterPortionController,
} from '../controllers/water.js';
import {
  addWaterPortionSchema,
  updateWaterPortionSchema,
} from '../validation/water.js';

const jsonParser = express.json();

const router = Router();

router.get('/:date', authenticate, ctrlWrapper(getCurrentDayWaterController));

router.get('/:year-:month', authenticate, ctrlWrapper(getMonthWaterController));

router.post(
  '/',
  jsonParser,
  validateBody(addWaterPortionSchema),
  ctrlWrapper(addWaterPortionController),
);
router.patch(
  '/:id',
  jsonParser,
  validateBody(updateWaterPortionSchema),
  ctrlWrapper(updateWaterPortionController),
);
router.delete('/:id', ctrlWrapper(deleteWaterPortionController));

export default router;
