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

  index: async (req, res) => {
    try {
      const user = await User.findById(req.user._id);
      res.status(200).json(user.notes);
    } catch (error) {
      res.status(500).send(error.message);
    }
  },

  get: async (req, res) => {
    try {
      const { id } = req.params;
      const user = await User.findById(req.user._id);
      const note = user.notes.id(id);
      if (!note) return res.status(404).send("Note not found");
      res.status(200).json(note);
    } catch (error) {
      res.status(500).send(error.message);
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { title, content } = req.body;
      if (!title && !content) return res.status(400).send("Note title or content is required");
      const user = await User.findById(req.user._id);
      const note = user.notes.id(id); // the id function is a mongoose helper function to find a subdocument by its id
      if (!note) return res.status(404).send("Note not found");
      if (title) note.title = title;
      if (content) note.content = content;
      await user.save();
      res.status(200).json(note);
    } catch (error) {
      res.status(500).send(error.message);
    }
  },
};
