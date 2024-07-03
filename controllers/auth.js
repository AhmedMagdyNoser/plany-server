const User = require("../models/User");
const bcrypt = require("bcrypt");
const cookiesOptions = require("../helpers/cookiesOptions");
const { generateAccessToken, generateRefreshToken } = require("../helpers/generateJWT");

module.exports = {
  register: async (req, res) => {
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
      const user = await User.create({ firstName, lastName, email, password: hashedPassword, refreshToken });
      // generate an access token and send it as a response
      res.status(201).send(generateAccessToken(user));
    } catch (error) {
      res.status(500).send(error.message);
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const loginErrorMsg = "Please verify your email and password and try again.";
      // Check if the email exists
      const user = await User.findOne({ email });
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
};
