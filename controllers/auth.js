const User = require("../models/User");

module.exports = {
  register: async (req, res) => {
    try {
      const existingEmail = await User.findOne({ email: req.body.email });
      if (existingEmail) return res.status(400).send("Looks like this email already exists.");
      const user = await User.create(req.body);
      res.status(201).json(user);
    } catch (error) {
      res.status(500).send(error.message);
    }
  },
};
