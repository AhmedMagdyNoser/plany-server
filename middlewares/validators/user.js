const { body } = require("express-validator");
const colors = require("../../helpers/colors");

const validateNames = [
  body("firstName").trim().notEmpty().withMessage("Please provide a first name."),
  body("lastName").trim().notEmpty().withMessage("Please provide a last name."),
];

const validateEmail = body("email").trim().toLowerCase().isEmail().withMessage("Please provide a valid email address.");

const validateNewEmail = body("newEmail")
  .trim()
  .toLowerCase()
  .isEmail()
  .withMessage("Please provide a valid new email address.");

const validatePassword = body("password")
  .notEmpty()
  .withMessage("Please provide your password.")
  .isLength({ min: 8 })
  .withMessage("The password should be at least 8 characters long.");

const validateNewPassword = body("newPassword")
  .notEmpty()
  .withMessage("Please provide the new password.")
  .isLength({ min: 8 })
  .withMessage("The new password should be at least 8 characters long.");

// The following is to required password only WITHOUT validation
const requirePassword = body("password").notEmpty().withMessage("Please provide your password.");

const validateColor = body("color")
  .trim()
  .notEmpty()
  .withMessage("Please provide a color.")
  .isIn(colors)
  .withMessage(`Color must be one of the following: ${colors.join(", ")}.`);

  const validateCode = body("code").trim().notEmpty().withMessage("Please provide the verification code.");

module.exports = {
  validateNames,
  validateEmail,
  validateNewEmail,
  validatePassword,
  validateNewPassword,
  requirePassword,
  validateColor,
  validateCode,
};
