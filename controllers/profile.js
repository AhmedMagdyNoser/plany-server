const User = require("../models/User");
const bcrypt = require("bcrypt");

const { getErrorMsg } = require("../middlewares/validators");
const { validateNames, requirePassword, validateNewPassword } = require("../middlewares/validators/user");

module.exports = {
  changeName: [
    ...validateNames,
    getErrorMsg,
    async (req, res) => {
      try {
        const { firstName, lastName } = req.body;

        const user = await User.findById(req.user._id);

        user.firstName = firstName;
        user.lastName = lastName;

        await user.save();

        res.send(user);
      } catch (error) {
        res.status(500).send(error.message);
      }
    },
  ],

  // ---------------------------------------

  changePassword: [
    requirePassword,
    validateNewPassword,
    getErrorMsg,
    async (req, res) => {
      try {
        const { password, newPassword } = req.body;

        const user = await User.findById(req.user._id).select("+password");

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) return res.status(401).send("The current password is not correct.");

        user.password = await bcrypt.hash(newPassword, 10);

        await user.save();

        res.send("Password changed successfully.");
      } catch (error) {
        res.status(500).send(error.message);
      }
    },
  ],
};
