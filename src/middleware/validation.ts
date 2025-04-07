import { NextFunction, Request, Response } from 'express';
import { ValidationChain, ValidationError, param, query, validationResult } from 'express-validator';

export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    return res.status(400).json({
      success: false,
      errors: errors.array().map((err: ValidationError) => ({
        field: err.path,
        message: err.msg
      }))
    });
  };
};

// Common validation rules
export const paginationRules = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
  query('sort').optional().isString(),
];

export const locationRules = [
  query('latitude').isFloat({ min: -90, max: 90 }).toFloat(),
  query('longitude').isFloat({ min: -180, max: 180 }).toFloat(),
  query('maxDistance').optional().isFloat({ min: 0 }).toFloat(),
];

export const courtIdRule = param('courtId').isMongoId().withMessage('Invalid court ID');
export const matchIdRule = param('matchId').isMongoId().withMessage('Invalid match ID'); 