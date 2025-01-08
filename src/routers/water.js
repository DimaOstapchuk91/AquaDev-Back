import { Router } from 'express';
import express from 'express';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { validateBody } from '../middlewares/validateBody.js';
import { addWaterPortionController, getCurrentDayWaterController } from '../controllers/water.js';
import { addWaterPortionSchema } from '../validation/water.js';

const jsonParser = express.json();

const router = Router();

router.get('/', ctrlWrapper(getCurrentDayWaterController));
router.post(
    '/',
    jsonParser,
    validateBody(addWaterPortionSchema),
    ctrlWrapper(addWaterPortionController)
);

export default router;
