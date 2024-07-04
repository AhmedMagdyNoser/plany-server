const User = require("../models/User");

module.exports = {
  create: async (req, res) => {
    try {
      const { title, content } = req.body;
      if (!title) return res.status(400).send("Note title is required");
      if (!content) return res.status(400).send("Note content is required");
      const user = await User.findById(req.user._id);
      user.notes.push({ title, content });
      await user.save();
      res.status(201).json(user.notes[user.notes.length - 1]);
    } catch (error) {
      res.status(500).send(error.message);
    }
  },
};
