const { body } = require("express-validator");

const validateRequiredTitle = body("title")
  .notEmpty()
  .withMessage("Note title is required.")
  .isString()
  .withMessage("Note title must be a string.")
  .trim()
  .notEmpty()
  .withMessage("Note title cannot be empty.");

const validateOptionalTitle = body("title")
  .optional()
  .isString()
  .withMessage("Note title must be a string.")
  .trim()
  .notEmpty()
  .withMessage("Note title cannot be empty.");

const validateRequiredContent = body("content")
  .notEmpty()
  .withMessage("Note content is required.")
  .isString()
  .withMessage("Note content must be a string.")
  .trim()
  .notEmpty()
  .withMessage("Note content cannot be empty.");

const validateOptionalContent = body("content")
  .optional()
  .isString()
  .withMessage("Note content must be a string.")
  .trim()
  .notEmpty()
  .withMessage("Note content cannot be empty.");

module.exports = {
  validateRequiredTitle,
  validateOptionalTitle,
  validateRequiredContent,
  validateOptionalContent,
};
