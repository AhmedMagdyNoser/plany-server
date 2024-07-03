const User = require("../models/User");

module.exports = {
  register: async (req, res) => {
    try {
      const { firstName, lastName, email, password } = req.body;
      const user = await User.create({ firstName, lastName, email, password });
      res.status(201).json(user);
    } catch (error) {
      res.status(500).send(error.message);
    }
  },
};
