const User = require("../models/User");
const bcrypt = require("bcrypt");

module.exports = {
  register: async (req, res) => {
    try {
      const { firstName, lastName, email, password } = req.body;
      // Check if the email already exists
      const existingEmail = await User.findOne({ email });
      if (existingEmail) return res.status(400).send("Looks like this email already exists.");
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
      // Register the user
      const user = await User.create({ firstName, lastName, email, password: hashedPassword });
      // Send a response with the user's details excluding the password
      res.status(201).json({ firstName, lastName, email, createdAt: user.createdAt });
    } catch (error) {
      res.status(500).send(error.message);
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      // Check if the email exists
      const user = await User.findOne({ email });
      if (!user)
        return res.status(401).send("Please verify your email and password and try again.");
      // Check if the password is correct
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword)
        return res.status(401).send("Please verify your email and password and try again.");
      // Send a response with the user's details excluding the password
      res.json({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        createdAt: user.createdAt,
      });
    } catch (error) {
      res.status(500).send(error.message);
    }
  },
};
