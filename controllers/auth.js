const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { generateAccessToken, generateRefreshToken } = require("../helpers/generateJWT");
const { PURPOSES, sendVerificationCodeToEmail } = require("../helpers/mailSender");
const cookiesOptions = require("../helpers/cookiesOptions");

const { body } = require("express-validator");
const {
  getErrorMsg,
  validateNames,
  validateEmail,
  validateNewEmail,
  validatePassword,
  validateNewPassword,
  requirePassword,
  validatePurpose,
} = require("../middlewares/validators/user");

module.exports = {
  register: [
    ...validateNames,
    ...validateEmail,
    ...validatePassword,
    getErrorMsg,
    async (req, res) => {
      try {
        const { firstName, lastName, email, password } = req.body;
        // Check if the email already exists
        const existingEmail = await User.findOne({ email });
        if (existingEmail) return res.status(409).send("Looks like this email already exists.");
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        // Generate a refresh token and set it as a cookie
        const refreshToken = generateRefreshToken(email);
        res.cookie("refreshToken", refreshToken, cookiesOptions);
        // Register the user in the database
        const user = await User.create({
          firstName,
          lastName,
          email,
          password: hashedPassword,
          "security.refreshToken": refreshToken,
        });
        // generate an access token and send it as a response
        res.status(201).send(generateAccessToken(user));
      } catch (error) {
        res.status(500).send(error.message);
      }
    },
  ],

  // ---------------------------------------

  login: [
    ...validateEmail,
    ...requirePassword, // Without validation
    getErrorMsg,
    async (req, res) => {
      try {
        const { email, password } = req.body;
        const loginErrorMsg = "Please check your email and password and try again.";
        // Check if the email exists
        const user = await User.findOne({ email }).select("+password");
        if (!user) return res.status(401).send(loginErrorMsg);
        // Check if the password is correct
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(401).send(loginErrorMsg);
        // Generate a refresh token, set it as a cookie, and save it in the database
        const refreshToken = generateRefreshToken(email);
        res.cookie("refreshToken", refreshToken, cookiesOptions);
        await User.updateOne({ email }, { "security.refreshToken": refreshToken });
        // generate an access token and send it as a response
        res.send(generateAccessToken(user));
      } catch (error) {
        res.status(500).send(error.message);
      }
    },
  ],

  // ---------------------------------------

  logout: async (req, res) => {
    try {
      // Get the refresh token from the cookies
      const refreshToken = req.cookies?.refreshToken;
      if (!refreshToken) return res.sendStatus(204);
      // Delete the refresh token from the user in the database
      await User.updateOne({ "security.refreshToken": refreshToken }, { "security.refreshToken": "" });
      // Clear the refresh token cookie
      res.clearCookie("refreshToken");
      res.sendStatus(204);
    } catch (error) {
      res.status(500).send(error.message);
    }
  },

  // ---------------------------------------

  refreshAccessToken: async (req, res) => {
    try {
      // Get the refresh token from the cookies
      const refreshToken = req.cookies?.refreshToken;
      if (!refreshToken) return res.status(401).send("Please login first.");
      // Check if the refresh token exists
      const user = await User.findOne({ "security.refreshToken": refreshToken });
      if (!user) return res.status(403).send("Invalid refresh token.");
      // Check if the refresh token is expired
      jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (error) => {
        if (error) return res.status(403).send("Invalid refresh token.");
        // Generate a new access token and send it as a response
        res.send(generateAccessToken(user));
      });
    } catch (error) {
      res.status(500).send(error.message);
    }
  },

  // ---------------------------------------

  sendVerificationCode: [
    ...validateEmail,
    ...validatePurpose,
    ...validateNewEmail,
    getErrorMsg,
    async (req, res) => {
      try {
        const { email, purpose } = req.body;
        // Check if the user exists
        const user = await User.findOne({ email });
        if (!user) return res.status(404).send("User not found.");
        // If the user exists
        switch (purpose) {
          case PURPOSES.RESET_PASSWORD: {
            // Check if the user email is not verified
            if (!user.emailVerified) return res.status(401).send("Your email is not verified.");
            // Generate a verification code
            const { hashedVerificationCode, verificationCode, verificationCodeExpiration } =
              await generateVerificationCode();
            // Save it for the current user
            await user.updateOne({
              "security.resetPasswordVerification": { code: hashedVerificationCode, expiration: verificationCodeExpiration },
            });
            // Send it to the his email
            await sendVerificationCodeToEmail(email, purpose, verificationCode);
            break;
          }
          case PURPOSES.VERIFY_EMAIL: {
            // Check if the user email is already verified
            if (user.emailVerified) return res.status(400).send("Your email is already verified.");
            // Generate a verification code
            const { hashedVerificationCode, verificationCode, verificationCodeExpiration } =
              await generateVerificationCode();
            // Save it for the current user
            await user.updateOne({
              "security.verifyEmailVerification": { code: hashedVerificationCode, expiration: verificationCodeExpiration },
            });
            // Send it to the his email
            await sendVerificationCodeToEmail(email, purpose, verificationCode);
            break;
          }
          case PURPOSES.CHANGE_EMAIL: {
            const { newEmail } = req.body;
            // Check if the new email is already registered.
            if (email === newEmail) return res.status(400).send("Please provide a different email.");
            const existingEmail = await User.findOne({ email: newEmail });
            if (existingEmail) return res.status(409).send("Looks like this email already exists.");
            // Generate a verification code
            const { hashedVerificationCode, verificationCode, verificationCodeExpiration } =
              await generateVerificationCode();
            // Save it for the current user
            await user.updateOne({
              "security.changeEmailVerification": {
                code: hashedVerificationCode,
                expiration: verificationCodeExpiration,
                newEmail,
              },
            });
            // Send it to the the NEW email
            await sendVerificationCodeToEmail(newEmail, purpose, verificationCode);
            break;
          }
          default:
            return res.status(400).send(`Please provide a valid purpose: ${Object.values(PURPOSES).join(", ")}.`);
        }
        return res.send("Verification code sent successfully.");
      } catch (error) {
        res.status(500).send(error.message);
      }

      async function generateVerificationCode() {
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        const verificationCodeExpiration = Date.now() + 1000 * 60 * process.env.VERIFICATION_CODE_LIFE;
        const hashedVerificationCode = await bcrypt.hash(verificationCode, 10);
        return { hashedVerificationCode, verificationCode, verificationCodeExpiration };
      }
    },
  ],

  // ---------------------------------------

  verifyVerificationCode: [
    ...validateEmail,
    ...validatePurpose,
    body("code").trim().notEmpty().withMessage("Please provide the verification code."),
    getErrorMsg,
    async (req, res) => {
      try {
        const { email, purpose, code } = req.body;
        // Check if the user exists
        const user = await User.findOne({ email }).select(
          "+security.resetPasswordToken " +
            "+security.resetPasswordVerification.code " +
            "+security.resetPasswordVerification.expiration " +
            "+security.verifyEmailVerification.code " +
            "+security.verifyEmailVerification.expiration " +
            "+security.changeEmailVerification.code " +
            "+security.changeEmailVerification.expiration " +
            "+security.changeEmailVerification.newEmail"
        );
        if (!user) return res.status(404).send("User not found.");

        let validation;

        switch (purpose) {
          case PURPOSES.RESET_PASSWORD: {
            const { resetPasswordVerification } = user.security;

            // Validate the verification code
            validation = await validateVerificationCode(
              resetPasswordVerification.code,
              resetPasswordVerification.expiration,
              code
            );
            if (!validation.valid) return res.status(validation.status).send(validation.message);

            // Generate a reset password token
            const resetPasswordToken = jwt.sign({ email }, process.env.PASSWORD_RESET_TOKEN_SECRET, {
              expiresIn: `${process.env.PASSWORD_RESET_TOKEN_LIFE}s`,
            });
            user.security.resetPasswordToken = resetPasswordToken;

            // Invalidate the verification code
            user.security.resetPasswordVerification.code = "";
            user.security.resetPasswordVerification.expiration = null;

            await user.save();
            return res.send(resetPasswordToken);
          }
          case PURPOSES.VERIFY_EMAIL: {
            const { verifyEmailVerification } = user.security;

            // Validate the verification code
            validation = await validateVerificationCode(
              verifyEmailVerification.code,
              verifyEmailVerification.expiration,
              code
            );
            if (!validation.valid) return res.status(validation.status).send(validation.message);

            // Verify the email
            user.emailVerified = true;

            // Invalidate the verification code
            user.security.verifyEmailVerification.code = "";
            user.security.verifyEmailVerification.expiration = null;

            await user.save();
            return res.send("Email verified successfully.");
          }
          case PURPOSES.CHANGE_EMAIL: {
            const { changeEmailVerification } = user.security;

            // Validate the verification code
            validation = await validateVerificationCode(
              changeEmailVerification.code,
              changeEmailVerification.expiration,
              code
            );
            if (!validation.valid) return res.status(400).send(validation.message);

            // Change the email and mark it as verified
            user.email = changeEmailVerification.newEmail;
            user.emailVerified = true;

            // invalidate the verification code
            user.security.changeEmailVerification.code = "";
            user.security.changeEmailVerification.expiration = null;
            user.security.changeEmailVerification.newEmail = "";

            await user.save();
            return res.send("Email changed successfully.");
          }
          default:
            return res.status(400).send(`Please provide a valid purpose: ${Object.values(PURPOSES).join(", ")}.`);
        }
      } catch (error) {
        res.status(500).send(error.message);
      }

      async function validateVerificationCode(storedCode, storedExpiration, providedCode) {
        if (!storedCode || !storedExpiration) {
          return { valid: false, status: 400, message: "No verification code found." };
        }

        if (Date.now() > storedExpiration) {
          return { valid: false, status: 401, message: "The verification code has expired." };
        }

        const isMatch = await bcrypt.compare(providedCode, storedCode);
        if (!isMatch) return { valid: false, status: 401, message: "Invalid verification code." };

        return { valid: true };
      }
    },
  ],

  // ---------------------------------------

  resetPassword: [
    body("token").trim().notEmpty().withMessage("Please provide the reset password token."),
    ...validateNewPassword,
    getErrorMsg,
    async (req, res) => {
      try {
        const { token, newPassword } = req.body;

        // Verify the token
        jwt.verify(token, process.env.PASSWORD_RESET_TOKEN_SECRET, async (error, decoded) => {
          if (error) return res.status(401).send("Invalid token. Please try again.");

          // Check if the user has a reset password token
          const user = await User.findOne({ email: decoded.email }).select("+security.resetPasswordToken");
          if (!user.security.resetPasswordToken) return res.status(401).send("Invalid token. Please try again.");

          // Hash the new password
          const hashedPassword = await bcrypt.hash(newPassword, 10);

          // Update the password and remove the reset password token
          user.password = hashedPassword;
          user.security.resetPasswordToken = "";

          await user.save();
          res.send("Password reset successfully.");
        });
      } catch (error) {
        res.status(500).send(error.message);
      }
    },
  ],
};
