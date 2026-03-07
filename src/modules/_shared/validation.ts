import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

const formatJoiError = (error: Joi.ValidationError) =>
  error.details.map((detail) => ({
    path: detail.path.join('.'),
    message: detail.message,
  }));

export const validateBody = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { value, error } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: formatJoiError(error),
      });
      return;
    }
    req.body = value;
    next();
  };
};

export const validateQuery = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { value, error } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: formatJoiError(error),
      });
      return;
    }
    (req as any).validatedQuery = value;
    next();
  };
};

export const validateParams = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { value, error } = schema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: formatJoiError(error),
      });
      return;
    }
    req.params = value as any;
    next();
  };
};

export const parseIdParam = (req: Request): string | null => {
  const id = req.params.id;
  return typeof id === 'string' && id.length > 0 ? id : null;
};
