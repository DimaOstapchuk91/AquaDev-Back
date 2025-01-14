import Joi from 'joi';

export const authSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(28).required(),
});

export const updateUserSchema = Joi.object({
  name: Joi.string().min(2).max(16),
  email: Joi.string().email(),
  gender: Joi.string().valid('woman', 'man'),
  weight: Joi.number().min(30).max(200),
  timeActive: Joi.number().min(0).max(24),
  dailyNorma: Joi.number().min(100).max(15000),
  avatar: Joi.any().optional(),
});

export const requstResetEmailSchema = Joi.object({
  email: Joi.string().email().required(),
});

export const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  password: Joi.string().min(3).max(20).required(),
});

export const loginWithGoogleOAuthSchema = Joi.object({
  code: Joi.string().required(),
});
