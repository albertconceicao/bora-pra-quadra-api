import { body } from 'express-validator';

export const createMatchValidation = [
  body('courtId')
    .notEmpty()
    .withMessage('Court ID is required')
    .isMongoId()
    .withMessage('Invalid court ID'),
  body('date')
    .notEmpty()
    .withMessage('Date is required')
    .isISO8601()
    .withMessage('Invalid date format'),
  body('startTime')
    .notEmpty()
    .withMessage('Start time is required')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('Start time must be in HH:mm format'),
  body('endTime')
    .notEmpty()
    .withMessage('End time is required')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('End time must be in HH:mm format')
    .custom((endTime, { req }) => {
      if (endTime <= req.body.startTime) {
        throw new Error('End time must be after start time');
      }
      return true;
    }),
  body('maxPlayers')
    .notEmpty()
    .withMessage('Maximum players is required')
    .isInt({ min: 2 })
    .withMessage('Maximum players must be at least 2'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
];

export const updateMatchValidation = [
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),
  body('startTime')
    .optional()
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('Start time must be in HH:mm format'),
  body('endTime')
    .optional()
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('End time must be in HH:mm format')
    .custom((endTime, { req }) => {
      if (endTime && req.body.startTime && endTime <= req.body.startTime) {
        throw new Error('End time must be after start time');
      }
      return true;
    }),
  body('maxPlayers')
    .optional()
    .isInt({ min: 2 })
    .withMessage('Maximum players must be at least 2')
    .custom((value, { req }) => {
      // If updating maxPlayers, ensure it's not less than current attendees
      if (req.match && req.match.attendees.length > value) {
        throw new Error('Maximum players cannot be less than current attendees');
      }
      return true;
    }),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('status')
    .optional()
    .isIn(['scheduled', 'in-progress', 'completed', 'cancelled'])
    .withMessage('Invalid status'),
];

export const joinMatchValidation = [
  body('matchId')
    .notEmpty()
    .withMessage('Match ID is required')
    .isMongoId()
    .withMessage('Invalid match ID'),
]; 