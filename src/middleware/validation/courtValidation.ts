import { body } from 'express-validator';

export const createCourtValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Court name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Court name must be between 2 and 100 characters'),
  body('location.coordinates')
    .isArray()
    .withMessage('Location coordinates must be an array')
    .custom((value) => {
      if (!Array.isArray(value) || value.length !== 2) {
        throw new Error('Location must contain latitude and longitude');
      }
      const [longitude, latitude] = value;
      if (latitude < -90 || latitude > 90) {
        throw new Error('Invalid latitude');
      }
      if (longitude < -180 || longitude > 180) {
        throw new Error('Invalid longitude');
      }
      return true;
    }),
  body('address')
    .trim()
    .notEmpty()
    .withMessage('Address is required'),
  body('city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  body('neighborhood')
    .trim()
    .notEmpty()
    .withMessage('Neighborhood is required'),
  body('whatsApp')
    .trim()
    .notEmpty()
    .withMessage('WhatsApp number is required')
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Invalid WhatsApp number format'),
  body('responsible')
    .trim()
    .notEmpty()
    .withMessage('Responsible person name is required'),
  body('surface')
    .trim()
    .notEmpty()
    .withMessage('Surface type is required'),
  body('dimensions')
    .isObject()
    .withMessage('Dimensions must be an object'),
  body('dimensions.width')
    .isFloat({ min: 1 })
    .withMessage('Width must be a positive number'),
  body('dimensions.length')
    .isFloat({ min: 1 })
    .withMessage('Length must be a positive number'),
  body('schedule')
    .isArray()
    .withMessage('Schedule must be an array'),
  body('schedule.*.dayOfWeek')
    .isInt({ min: 0, max: 6 })
    .withMessage('Day of week must be between 0 and 6'),
  body('schedule.*.startTime')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('Start time must be in HH:mm format'),
  body('schedule.*.endTime')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('End time must be in HH:mm format')
    .custom((endTime, { req }) => {
      const startTime = req.body.schedule.find(
        (s: any) => s.endTime === endTime
      ).startTime;
      if (startTime >= endTime) {
        throw new Error('End time must be after start time');
      }
      return true;
    }),
];

export const updateCourtValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Court name must be between 2 and 100 characters'),
  body('location.coordinates')
    .optional()
    .isArray()
    .custom((value) => {
      if (!Array.isArray(value) || value.length !== 2) {
        throw new Error('Location must contain latitude and longitude');
      }
      const [longitude, latitude] = value;
      if (latitude < -90 || latitude > 90) {
        throw new Error('Invalid latitude');
      }
      if (longitude < -180 || longitude > 180) {
        throw new Error('Invalid longitude');
      }
      return true;
    }),
  body('address').optional().trim(),
  body('city').optional().trim(),
  body('neighborhood').optional().trim(),
  body('whatsApp')
    .optional()
    .trim()
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Invalid WhatsApp number format'),
  body('responsible').optional().trim(),
  body('surface').optional().trim(),
  body('dimensions')
    .optional()
    .isObject()
    .withMessage('Dimensions must be an object'),
  body('dimensions.width')
    .optional()
    .isFloat({ min: 1 })
    .withMessage('Width must be a positive number'),
  body('dimensions.length')
    .optional()
    .isFloat({ min: 1 })
    .withMessage('Length must be a positive number'),
  body('schedule')
    .optional()
    .isArray()
    .withMessage('Schedule must be an array'),
  body('schedule.*.dayOfWeek')
    .optional()
    .isInt({ min: 0, max: 6 })
    .withMessage('Day of week must be between 0 and 6'),
  body('schedule.*.startTime')
    .optional()
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('Start time must be in HH:mm format'),
  body('schedule.*.endTime')
    .optional()
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('End time must be in HH:mm format'),
]; 