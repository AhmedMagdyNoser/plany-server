const User = require("../models/User");

module.exports = {
  create: async (req, res) => {
    try {
      const { title } = req.body;
      const user = await User.findById(req.user._id);
      user.tasks.push({ title });
      await user.save();
      res.status(201).json(user.tasks[user.tasks.length - 1]);
    } catch (error) {
      res.status(500).send(error.message);
    }
  },
};
