import createHttpError from "http-errors";
import { addWaterPortion, getWaterPortionsForDay } from "../services/water.js";

export async function getCurrentDayWaterController(req, res) {
    try {
        // const userId = req.user._id;

        const { waterPortions, totalWater } = await getWaterPortionsForDay();

        res.status(200).json({
            totalWater,
            waterPortions,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export async function addWaterPortionController(req, res) {

    const waterPortion = {
        amount: req.body.amount,
        time: req.body.time,
        // userId: req.user.id
    };

    if (!waterPortion.amount || !waterPortion.time) {
        throw new createHttpError(
            400,
            'Amount of water and time fields are required!'
        );
    }

    const result = await addWaterPortion(waterPortion);

    res.status(201).json({
        status: 201,
        message: 'Water portion is successfully added!',
        data: result
    });

}
