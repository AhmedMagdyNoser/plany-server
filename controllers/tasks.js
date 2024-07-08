const User = require("../models/User");
const { validateRequiredTitle, validateOptionalTitle, validateOptionalStatus } = require("../middlewares/validators/tasks");
const { getErrorMsg } = require("../middlewares/validators");

module.exports = {
  create: [
    validateRequiredTitle,
    getErrorMsg,
    async (req, res) => {
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
  ],

  index: async (req, res) => {
    try {
      const user = await User.findById(req.user._id);
      res.status(200).json(user.tasks);
    } catch (error) {
      res.status(500).send(error.message);
    }
  },

  update: [
    validateOptionalTitle,
    validateOptionalStatus,
    getErrorMsg,
    async (req, res) => {
      try {
        const { id } = req.params;
        const { title, completed } = req.body;
        if (!title && completed === undefined) return res.status(400).send("Task title or status is required.");
        const user = await User.findById(req.user._id);
        const task = user.tasks.id(id); // the id function is a mongoose helper function to find a subdocument by its id
        if (!task) return res.status(404).send("Task not found.");
        if (title) task.title = title;
        if (completed === true || completed === false) task.completed = completed;
        await user.save();
        res.status(200).json(task);
      } catch (error) {
        res.status(500).send(error.message);
      }
    },
  ],

  delete: async (req, res) => {
    try {
      const { id } = req.params;
      const user = await User.findById(req.user._id);
      const task = user.tasks.id(id);
      if (!task) return res.status(404).send("Task not found.");
      user.tasks.remove(task); // the remove function is a mongoose helper function to remove a subdocument
      await user.save();
      res.sendStatus(204);
    } catch (error) {
      res.status(500).send(error.message);
    }
  },
};
