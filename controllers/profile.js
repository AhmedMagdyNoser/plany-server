const User = require("../models/User");
const bcrypt = require("bcrypt");

module.exports = {
  async changeName(req, res) {
    try {
      const { firstName, lastName } = req.body;

      const user = await User.findById(req.user._id);

      user.firstName = firstName;
      user.lastName = lastName;

      await user.save();

      res.sendStatus(200);
    } catch (error) {
      res.status(500).send(error.message);
    }
  },

  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword)
        return res.status(400).send("The current password and new password are required.");

      const user = await User.findById(req.user._id).select("+password");

      const isMatch = await bcrypt.compare(currentPassword, user.password);

      if (!isMatch) return res.status(400).send("The current password is incorrect.");

      user.password = await bcrypt.hash(newPassword, 10);

      await user.save();

      res.sendStatus(200);
    } catch (error) {
      res.status(500).send(error.message);
    }
  },
};
