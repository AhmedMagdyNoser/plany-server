const { body, validationResult } = require("express-validator");
const { PURPOSES } = require("../../helpers/mailSender");

const validateNames = [
  body("firstName").trim().notEmpty().withMessage("Please provide a first name."),
  body("lastName").trim().notEmpty().withMessage("Please provide a last name."),
];

const validateEmail = body("email").trim().toLowerCase().isEmail().withMessage("Please provide a valid email address.");

// The following is used only in the send-verification-code route where the purpose is to change email
const validateNewEmail = body("newEmail")
  .if(body("purpose").equals(PURPOSES.CHANGE_EMAIL))
  .trim()
  .notEmpty()
  .withMessage("A new email is required for changing email.")
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

const validatePurpose = body("purpose")
  .trim()
  .notEmpty()
  .withMessage("Please provide a purpose.")
  .isIn([PURPOSES.RESET_PASSWORD, PURPOSES.VERIFY_EMAIL, PURPOSES.CHANGE_EMAIL])
  .withMessage(`Purpose must be one of the following: ${Object.values(PURPOSES).join(", ")}.`);

module.exports = {
  validateNames,
  validateEmail,
  validateNewEmail,
  validatePassword,
  validateNewPassword,
  requirePassword,
  validatePurpose,
};
