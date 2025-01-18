import createHttpError from 'http-errors';
import { WaterPortion } from '../db/models/water.js';
import { getEndOfDay, getStartOfDay } from '../utils/getDayBounds.js';
import { endOfMonth, startOfMonth } from '../utils/getMonthBounds.js';

export const getWaterPortionsForDay = async (userId, req) => {
  const getDate = req.params;
  const startOfDay = getStartOfDay(getDate.date);
  const endOfDay = getEndOfDay(getDate.date);

  const waterPortions = await WaterPortion.find({
    userId: userId,
    createdAt: { $gte: startOfDay, $lt: endOfDay },
  });

  if (!waterPortions)
    throw createHttpError(404, 'No water data recorded for this day.');

  const totalWater = waterPortions.reduce(
    (sum, portion) => sum + portion.amount,
    0,
  );

  return {
    dateDay: getDate.date,
    waterPortions,
    totalWater,
  };
};

export async function addWaterPortion(waterPortion) {
  const result = await WaterPortion.create(waterPortion);

  if (!result) throw createHttpError(500, 'Failed to create water portion');

  return result;
}

export async function updateWaterPortion(
  itemId,
  waterPortion,
  userId,
  options = {},
) {
  const result = await WaterPortion.findOneAndUpdate(
    { _id: itemId, userId: userId },
    waterPortion,
    {
      new: true,
      includesResultMetadata: true,
      ...options,
    },
  );

  if (!result)
    throw createHttpError(404, `Water portion with ID ${itemId} not found`);

  return {
    userWater: result,
  };
}

export async function deleteWaterPortion(itemId) {
  const result = await WaterPortion.findOneAndDelete({ _id: itemId });

  if (!result) {
    throw createHttpError(404, `Water portion with ID ${itemId} not found.`);
  }

  return {
    _id: result._id,
    amount: result.amount,
  };
}

export async function getWaterPortionsForMonth(date, userId) {
  const startOfSelectedMonth = startOfMonth(new Date(date));
  const endOfSelectedMonth = endOfMonth(new Date(date));

  const waterPortions = await WaterPortion.find({
    userId: userId,
    createdAt: { $gte: startOfSelectedMonth, $lt: endOfSelectedMonth },
  }).select('amount createdAt');

  if (!waterPortions) throw createHttpError(404, 'Month Portion Not Found');

  const totalWaterByDay = [];

  waterPortions.forEach((portion) => {
    const day = portion.createdAt.toISOString().slice(0, 10);

    let dayRecord = totalWaterByDay.find((record) => record.date === day);

    if (dayRecord) {
      dayRecord.totalWater += portion.amount;
    } else {
      totalWaterByDay.push({
        date: day,
        totalWater: portion.amount,
      });
    }
  });
  return totalWaterByDay;
}
