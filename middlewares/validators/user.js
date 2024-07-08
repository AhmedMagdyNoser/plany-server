const { body, validationResult } = require("express-validator");
const { PURPOSES } = require("../../helpers/mailSender");

function getErrorMsg(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).send(errors.array()[0].msg);
  next();
}

const validateNames = [
  body("firstName").trim().notEmpty().withMessage("Please provide a first name."),
  body("lastName").trim().notEmpty().withMessage("Please provide a last name."),
];

const validateEmail = [body("email").trim().toLowerCase().isEmail().withMessage("Please provide a valid email address.")];

const validateNewEmail = [
  // This is used only in the send-verification-code route where the purpose is to change email
  body("newEmail")
    .if(body("purpose").equals(PURPOSES.CHANGE_EMAIL))
    .trim()
    .notEmpty()
    .withMessage("A new email is required for changing email.")
    .toLowerCase()
    .isEmail()
    .withMessage("Please provide a valid new email address."),
];

const validatePassword = [
  body("password")
    .notEmpty()
    .withMessage("Please provide your password.")
    .isLength({ min: 8 })
    .withMessage("The password should be at least 8 characters long."),
];

const validateNewPassword = [
  body("newPassword")
    .notEmpty()
    .withMessage("Please provide the new password.")
    .isLength({ min: 8 })
    .withMessage("The new password should be at least 8 characters long."),
];

const validatePurpose = [
  body("purpose")
    .trim()
    .notEmpty()
    .withMessage("Please provide a purpose.")
    .isIn([PURPOSES.RESET_PASSWORD, PURPOSES.VERIFY_EMAIL, PURPOSES.CHANGE_EMAIL])
    .withMessage(`Purpose must be one of the following: ${Object.values(PURPOSES).join(", ")}.`),
];

module.exports = {
  getErrorMsg,
  validateNames,
  validateEmail,
  validateNewEmail,
  validatePassword,
  validateNewPassword,
  validatePurpose,
};
