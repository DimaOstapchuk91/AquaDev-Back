import {
  addWaterPortion,
  deleteWaterPortion,
  getWaterPortionsForDay,
  getWaterPortionsForMonth,
  updateWaterPortion,
} from '../services/water.js';

export async function getCurrentDayWaterController(req, res) {
  const userId = req.user._id;

  const { dateDay, transformedTimePortions, totalWater } = await getWaterPortionsForDay(
    userId,
    req,
  );

  res.status(200).json({
    message: 'Data for the selected day retrieved successfully',
    dateDay,
    totalWater,
    transformedTimePortions,
  });
}

export async function getMonthWaterController(req, res) {
  const { date } = req.params;
  const userId = req.user._id;

  const waterPortionsByDay = await getWaterPortionsForMonth(date, userId);

  res.status(200).json({
    status: 200,
    message: 'Successfully portions month',
    monthPortions: waterPortionsByDay,
  });
}

export async function addWaterPortionController(req, res) {
  const waterPortion = {
    amount: req.body.amount,
    time: req.body.time,
    userId: req.user._id,
  };

  const result = await addWaterPortion(waterPortion);

  res.status(201).json({
    status: 201,
    message: 'Water portion is successfully added!',
    data: result,
  });
}

export async function updateWaterPortionController(req, res) {
  const { id } = req.params;

  const waterPortion = {
    amount: req.body.amount,
    time: req.body.time,
  };

  const result = await updateWaterPortion(id, waterPortion, req.user._id);

  res.status(200).json({
    status: 200,
    message: 'Successfully updated an entry!',
    data: result,
  });
}

export async function deleteWaterPortionController(req, res) {
  const { id } = req.params;
  const { userId } = req.user._id;

  const result = await deleteWaterPortion(id, userId);

  res.status(200).json({
    status: 200,
    message: 'Entry successfully deleted!',
    data: result,
  });
}
