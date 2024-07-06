const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookiesOptions = require("../helpers/cookiesOptions");
const { generateAccessToken, generateRefreshToken } = require("../helpers/generateJWT");
const { PURPOSES, sendVerificationEmail } = require("../helpers/mailSender");

module.exports = {
  register: async (req, res) => {
    try {
      let { firstName, lastName, email, password } = req.body;
      email = email.toLowerCase();
      // Check if the email already exists
      const existingEmail = await User.findOne({ email });
      if (existingEmail) return res.status(409).send("Looks like this email already exists.");
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
      // Generate a refresh token and set it as a cookie
      const refreshToken = generateRefreshToken(email);
      res.cookie("refreshToken", refreshToken, cookiesOptions);
      // Register the user in the database
      const user = await User.create({ firstName, lastName, email, password: hashedPassword, refreshToken });
      // generate an access token and send it as a response
      res.status(201).send(generateAccessToken(user));
    } catch (error) {
      res.status(500).send(error.message);
    }
  },

  login: async (req, res) => {
    try {
      let { email, password } = req.body;
      if (!email || !password) return res.status(400).send("Please provide an email and a password.");
      email = email.toLowerCase();
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
      await User.updateOne({ email }, { refreshToken });
      // generate an access token and send it as a response
      res.send(generateAccessToken(user));
    } catch (error) {
      res.status(500).send(error.message);
    }
  },

  logout: async (req, res) => {
    try {
      // Get the refresh token from the cookies
      const refreshToken = req.cookies?.refreshToken;
      if (!refreshToken) return res.sendStatus(204);
      // Delete the refresh token from the user in the database
      await User.updateOne({ refreshToken }, { refreshToken: "" });
      // Clear the refresh token cookie
      res.clearCookie("refreshToken");
      res.sendStatus(204);
    } catch (error) {
      res.status(500).send(error.message);
    }
  },

  refreshAccessToken: async (req, res) => {
    try {
      // Get the refresh token from the cookies
      const refreshToken = req.cookies?.refreshToken;
      if (!refreshToken) return res.status(401).send("Please login first.");
      // Check if the refresh token exists
      const user = await User.findOne({ refreshToken });
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

  sendVerificationCode: async (req, res) => {
    try {
      const { email, purpose } = req.body;
      // The purpose must exclusively be one of the following: resetForgottenPassword, verifyEmail, or changeEmail
      if (!email) return res.status(400).send("Please provide an email.");
      if (!purpose) return res.status(400).send("Please provide a purpose.");
      if (!Object.values(PURPOSES).includes(purpose)) return res.status(400).send("Please provide a valid purpose.");
      const user = await User.findOne({ email });
      if (!user) return res.status(404).send("User not found.");
      // Generate a verification code and set its expiration time
      const verificationCode = await bcrypt.hash(Math.floor(100000 + Math.random() * 900000).toString(), 10);
      const verificationCodeExpiration = Date.now() + 1000 * 60 * process.env.VERIFICATION_CODE_LIFE;
      // Save the verification code in the database
      await User.updateOne(
        { email },
        {
          "security.verificationCode": verificationCode,
          "security.verificationCodeExpiration": verificationCodeExpiration,
        }
      );
      // Send the verification code to the user's email
      await sendVerificationEmail(email, purpose, verificationCode);
      res.sendStatus(200);
    } catch (error) {
      res.status(500).send(error.message);
    }
  },
};
