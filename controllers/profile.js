const User = require("../models/User");

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
};
