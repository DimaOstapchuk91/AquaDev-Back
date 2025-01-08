import Joi from 'joi';

export const addWaterPortionSchema = Joi.object({
    amount: Joi.number().
        integer().
        min(50).
        max(5000).
        required(),
    time: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):([0-5][0-9])$/).required(),
});

export const updateWaterPortionSchema = Joi.object({
    amount: Joi.number().
        integer().
        min(50).
        max(5000),
    time: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):([0-5][0-9])$/),
});
