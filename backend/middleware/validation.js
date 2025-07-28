const { body, param, query, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// User validation rules
const validateUserRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .optional()
    .isIn(['admin', 'employee'])
    .withMessage('Role must be either admin or employee'),
  body('baseSalary')
    .isFloat({ min: 0 })
    .withMessage('Base salary must be a positive number'),
  body('department')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Department must be between 2 and 50 characters'),
  handleValidationErrors
];

const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

const validateUserUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('role')
    .optional()
    .isIn(['admin', 'employee'])
    .withMessage('Role must be either admin or employee'),
  body('baseSalary')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Base salary must be a positive number'),
  body('department')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Department must be between 2 and 50 characters'),
  handleValidationErrors
];

// Performance validation rules
const validatePerformanceCreate = [
  body('taskName')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Task name must be between 2 and 200 characters'),
  body('score')
    .isFloat({ min: 0, max: 100 })
    .withMessage('Score must be between 0 and 100'),
  body('difficulty')
    .isIn(['easy', 'medium', 'hard'])
    .withMessage('Difficulty must be easy, medium, or hard'),
  body('clientFeedback')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Client feedback cannot exceed 500 characters'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid ISO 8601 date'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters'),
  handleValidationErrors
];

const validatePerformanceUpdate = [
  body('taskName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Task name must be between 2 and 200 characters'),
  body('score')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Score must be between 0 and 100'),
  body('difficulty')
    .optional()
    .isIn(['easy', 'medium', 'hard'])
    .withMessage('Difficulty must be easy, medium, or hard'),
  body('clientFeedback')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Client feedback cannot exceed 500 characters'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters'),
  handleValidationErrors
];

// Salary validation rules
const validateSalaryCalculation = [
  body('period')
    .optional()
    .matches(/^\d{4}-\d{2}$/)
    .withMessage('Period must be in YYYY-MM format'),
  handleValidationErrors
];

const validateSalaryStatusUpdate = [
  body('status')
    .isIn(['pending', 'approved', 'paid'])
    .withMessage('Status must be pending, approved, or paid'),
  handleValidationErrors
];

const validateBulkSalaryStatusUpdate = [
  body('salaryIds')
    .isArray({ min: 1 })
    .withMessage('Salary IDs must be a non-empty array'),
  body('salaryIds.*')
    .isMongoId()
    .withMessage('Each salary ID must be a valid MongoDB ID'),
  body('status')
    .isIn(['pending', 'approved', 'paid'])
    .withMessage('Status must be pending, approved, or paid'),
  handleValidationErrors
];

const validatePerformanceApproval = [
  body('performanceIds')
    .isArray({ min: 1 })
    .withMessage('Performance IDs must be a non-empty array'),
  body('performanceIds.*')
    .isMongoId()
    .withMessage('Each performance ID must be a valid MongoDB ID'),
  body('period')
    .matches(/^\d{4}-\d{2}$/)
    .withMessage('Period must be in YYYY-MM format'),
  handleValidationErrors
];

const validatePeriodQuery = [
  query('period')
    .matches(/^\d{4}-\d{2}$/)
    .withMessage('Period must be in YYYY-MM format'),
  handleValidationErrors
];

// Settings validation rules
const validateSettingsUpdate = [
  body('salaryMultiplier')
    .isFloat({ min: 0 })
    .withMessage('Salary multiplier must be a positive number'),
  handleValidationErrors
];

// ID validation
const validateObjectId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),
  handleValidationErrors
];

// Query validation
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateUserRegistration,
  validateUserLogin,
  validateUserUpdate,
  validatePerformanceCreate,
  validatePerformanceUpdate,
  validateSalaryCalculation,
  validateSalaryStatusUpdate,
  validateBulkSalaryStatusUpdate,
  validatePerformanceApproval,
  validatePeriodQuery,
  validateSettingsUpdate,
  validateObjectId,
  validatePagination
}; 