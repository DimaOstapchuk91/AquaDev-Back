import { WaterPortion } from "../db/models/water.js";
import { getEndOfDay, getStartOfDay } from "../utils/getDayBounds.js";


export async function getWaterPortionsForDay() {
    const startOfDay = getStartOfDay();
    const endOfDay = getEndOfDay();

    const waterPortions = await WaterPortion.find({
        createdAt: { $gte: startOfDay, $lt: endOfDay },
    }).select('amount time createdAt');

    const totalWater = waterPortions.reduce((sum, portion) => sum + portion.amount, 0);

    return {
        waterPortions,
        totalWater
    };
}

export async function addWaterPortion(waterPortion) {
    return WaterPortion.create(waterPortion);
}
