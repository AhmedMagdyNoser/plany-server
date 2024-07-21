const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { generateAccessToken, generateRefreshToken } = require("../helpers/generateJWT");
const { PURPOSES, sendVerificationCodeToEmail } = require("../helpers/mailSender");
const generateVerificationCode = require("../helpers/generateVerificationCode");
const cookiesOptions = require("../helpers/cookiesOptions");

const { body } = require("express-validator");
const { getErrorMsg } = require("../middlewares/validators");
const {
  validateNames,
  validateEmail,
  validatePassword,
  validateNewPassword,
  requirePassword,
} = require("../middlewares/validators/user");

module.exports = {
  register: [
    ...validateNames,
    validateEmail,
    validatePassword,
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
    validateEmail,
    requirePassword, // Without validation
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
    const refreshErrorMsg = "Invalid refresh token.";
    try {
      // Get the refresh token from the cookies
      const refreshToken = req.cookies?.refreshToken;
      if (!refreshToken) return res.status(401).send(refreshErrorMsg);
      // Check if the refresh token exists
      const user = await User.findOne({ "security.refreshToken": refreshToken });
      if (!user) return res.status(403).send(refreshErrorMsg);
      // Check if the refresh token is expired
      jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (error) => {
        if (error) return res.status(403).send(refreshErrorMsg);
        // Generate a new access token and send it as a response
        res.send(generateAccessToken(user));
      });
    } catch (error) {
      res.status(500).send(error.message);
    }
  },

  // ---------------------------------------

  forgotPasswordMailCode: [
    validateEmail,
    getErrorMsg,
    async (req, res) => {
      try {
        const { email } = req.body;
        // Check if the user exists
        const user = await User.findOne({ email });
        if (!user) return res.status(404).send("User not found.");
        // Check if the user email is not verified
        if (!user.emailVerified) return res.status(401).send("Your email is not verified.");
        // Generate a verification code
        const { hashedVerificationCode, verificationCode, verificationCodeExpiration } = await generateVerificationCode();
        // Save it for the current user
        await user.updateOne({
          "security.resetPasswordVerification": { code: hashedVerificationCode, expiration: verificationCodeExpiration },
        });
        // Send it to the his email
        await sendVerificationCodeToEmail(email, PURPOSES.RESET_PASSWORD, verificationCode);
        return res.sendStatus(200);
      } catch (error) {
        res.status(500).send(error.message);
      }
    },
  ],

  // ---------------------------------------

  forgotPasswordVerifyCode: [
    validateEmail,
    body("code").trim().notEmpty().withMessage("Please provide the verification code."),
    getErrorMsg,
    async (req, res) => {
      try {
        const { email, code } = req.body;
        // Check if the user exists
        const user = await User.findOne({ email }).select(
          "+security.resetPasswordVerification.code +security.resetPasswordVerification.expiration"
        );
        if (!user) return res.status(404).send("User not found.");
        // Validate the verification code
        const { resetPasswordVerification } = user.security;
        if (!resetPasswordVerification.code || !resetPasswordVerification.expiration)
          return res.status(400).send("No verification code found.");
        if (Date.now() > resetPasswordVerification.expiration)
          return res.status(401).send("The verification code has expired.");
        const isMatch = await bcrypt.compare(code, resetPasswordVerification.code);
        if (!isMatch) return res.status(401).send("Invalid verification code.");
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
      } catch (error) {
        res.status(500).send(error.message);
      }
    },
  ],

  // ---------------------------------------

  forgotPasswordResetPassword: [
    body("token").trim().notEmpty().withMessage("Please provide the reset password token."),
    validateNewPassword,
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
          res.sendStatus(200);
        });
      } catch (error) {
        res.status(500).send(error.message);
      }
    },
  ],
};
