import { WaterPortion } from '../db/models/water.js';
import { getEndOfDay, getStartOfDay } from '../utils/getDayBounds.js';
import { endOfMonth, startOfMonth } from '../utils/getMonthBounds.js';

export const getWaterPortionsForDay = async (userId, req) => {
  const getDate = req.params; //{ date: '2025-01-14' }
  const startOfDay = getStartOfDay(getDate.date);
  const endOfDay = getEndOfDay(getDate.date);

  const waterPortions = await WaterPortion.find({
    userId: userId,
    createdAt: { $gte: startOfDay, $lt: endOfDay },
  });

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

export async function getWaterPortionsByDate(userId, date) {}

export function getWaterPortionById(itemId) {
  return WaterPortion.findOne({ _id: itemId });
}

export function addWaterPortion(waterPortion) {
  return WaterPortion.create(waterPortion);
}

export function updateWaterPortion(itemId, waterPortion) {
  return WaterPortion.findOneAndUpdate({ _id: itemId }, waterPortion, {
    new: true,
  });
}

export function deleteWaterPortion(itemId) {
  return WaterPortion.findOneAndDelete({ _id: itemId });
}

export async function getWaterPortionsForMonth(year, month, userId) {
  const startOfSelectedMonth = startOfMonth(new Date(year, month, 1));
  const endOfSelectedMonth = endOfMonth(new Date(year, month, 1));

  const waterPortions = await WaterPortion.find({
    createdAt: { $gte: startOfSelectedMonth, $lt: endOfSelectedMonth },
  }).select('amount createdAt');

  const totalWaterByDay = {};

  waterPortions.forEach((portion) => {
    const day = portion.createdAt.toISOString().slice(0, 10);
    if (!totalWaterByDay[day]) {
      totalWaterByDay[day] = [];
    }
    console.log(typeof portion.amount);

    totalWaterByDay[day] = Number(totalWaterByDay[day]) + portion.amount;
  });

  return totalWaterByDay;
}

// export async function getWaterPortionsForMonth(year, month, userId) {
//     const startOfSelectedMonth = startOfMonth(new Date(year, month, 1));
//     const endOfSelectedMonth = endOfMonth(new Date(year, month, 1));

//     const waterPortions = await WaterPortion.find({
//         createdAt: { $gte: startOfSelectedMonth, $lt: endOfSelectedMonth },
//     }).select('_id amount time createdAt');

//     const waterPortionsByDay = {};

//     waterPortions.forEach(portion => {
//         const day = portion.createdAt.toISOString().slice(0, 10);
//         if (!waterPortionsByDay[day]) {
//             waterPortionsByDay[day] = [];
//         }
//         waterPortionsByDay[day].push({
//             id: portion._id,
//             amount: portion.amount,
//             time: portion.time,
//             createdAt: portion.createdAt
//         });
//     });

//     return waterPortionsByDay;
// }
