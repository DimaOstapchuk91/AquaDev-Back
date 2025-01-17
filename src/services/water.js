import createHttpError from "http-errors";
import { WaterPortion } from "../db/models/water.js";
import { getEndOfDay, getStartOfDay } from "../utils/getDayBounds.js";
import { endOfMonth, startOfMonth } from "../utils/getMonthBounds.js";


// export async function getWaterPortionsForDay(userId, date=null) {
//     const dateToUse = date ? new Date(date) : new Date();

//     const startOfDay = getStartOfDay(dateToUse);
//     const endOfDay = getEndOfDay(dateToUse);

//     const waterPortions = await WaterPortion.find({
//         userId,
//         createdAt: { $gte: startOfDay, $lt: endOfDay },
//     }).select('amount time createdAt');

//     const totalWater = waterPortions.reduce((sum, portion) => sum + portion.amount, 0);

//     return {
//         waterPortions,
//         totalWater
//     };
// }

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

export async function addWaterPortion(waterPortion) {
    return await WaterPortion.create(waterPortion);
}

export async function updateWaterPortion(itemId, waterPortion, userId, options = {}) {
    const result = await WaterPortion.findOneAndUpdate(
        { _id: itemId, userId: userId},
        waterPortion,
        {
            new: true,
            includesResultMetadata: true,
            ...options,
        },
    );

    if (!result) throw createHttpError(404, 'User not found!');

    return {
        userWater: result,
    };
}

export async function deleteWaterPortion(itemId) {
    const result = await WaterPortion.findOneAndDelete({ _id: itemId });

    if (!result) {
        throw createHttpError(404, 'Entry not found!');
    }

    return result;
}

export async function getWaterPortionsForMonth(year, month, userId) {
    const startOfSelectedMonth = startOfMonth(new Date(year, month, 1));
    const endOfSelectedMonth = endOfMonth(new Date(year, month, 1));

    const waterPortions = await WaterPortion.find({
        createdAt: { $gte: startOfSelectedMonth, $lt: endOfSelectedMonth },
    }).select('amount createdAt');

    const totalWaterByDay = [];

    waterPortions.forEach(portion => {
        const day = portion.createdAt.toISOString().slice(0, 10);

        let dayRecord = totalWaterByDay.find(record => record.date === day);

        if (dayRecord) {
            dayRecord.totalWater += portion.amount;
        } else {
            totalWaterByDay.push({
                date: day,
                totalWater: portion.amount
            });
        }

    });

    return totalWaterByDay;
}



// export async function getWaterPortionsForMonth(year, month, userId) {
//     const startOfSelectedMonth = startOfMonth(new Date(year, month, 1));
//     const endOfSelectedMonth = endOfMonth(new Date(year, month, 1));

//     const waterPortions = await WaterPortion.find({
//         createdAt: { $gte: startOfSelectedMonth, $lt: endOfSelectedMonth },
//     }).select('amount createdAt');

//     const totalWaterByDay = {};

//     waterPortions.forEach(portion => {
//         const day = portion.createdAt.toISOString().slice(0, 10);
//         if (!totalWaterByDay[day]) {
//             totalWaterByDay[day] = [];
//         }
// console.log(typeof portion.amount);

// totalWaterByDay[day] = Number(totalWaterByDay[day]) + portion.amount;
//     });

//     return totalWaterByDay;
// }


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
