const { body } = require("express-validator");

const validateRequiredTitle = body("title")
  .notEmpty()
  .withMessage("Task title is required.")
  .isString()
  .withMessage("Task title must be a string.")
  .trim()
  .notEmpty()
  .withMessage("Task title cannot be empty.");

const validateOptionalTitle = body("title")
  .optional()
  .isString()
  .withMessage("Task title must be a string.")
  .trim()
  .notEmpty()
  .withMessage("Task title cannot be empty.");

const validateOptionalStatus = body("completed").optional().isBoolean().withMessage("Task status must be a boolean.");

module.exports = {
  validateRequiredTitle,
  validateOptionalTitle,
  validateOptionalStatus,
};
