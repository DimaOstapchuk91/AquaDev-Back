import {
  addWaterPortion,
  deleteWaterPortion,
  getWaterPortionsForDay,
  getWaterPortionsForMonth,
  updateWaterPortion,
} from '../services/water.js';

export async function getCurrentDayWaterController(req, res) {
  const userId = req.user._id;

  const { dateDay, waterPortions, totalWater } = await getWaterPortionsForDay(
    userId,
    req,
  );

  res.status(200).json({
    dateDay,
    totalWater,
    waterPortions,
  });
}

export async function getMonthWaterController(req, res) {
  const { year, month } = req.params;
  const userId = req.user._id;

  const parsedYear = parseInt(year, 10);
  const parsedMonth = parseInt(month, 10) - 1;

  if (
    isNaN(parsedYear) ||
    isNaN(parsedMonth) ||
    parsedMonth < 0 ||
    parsedMonth > 11
  ) {
    return res.status(400).json({ message: 'Invalid year or month' });
  }

  const waterPortionsByDay = await getWaterPortionsForMonth(
    parsedYear,
    parsedMonth,
    userId,
  );
  res.status(200).json(waterPortionsByDay);
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

  const result = await deleteWaterPortion(id);

  res.status(200).json({ status: 200, message: 'Entry successfully deleted!', data: result });
}
