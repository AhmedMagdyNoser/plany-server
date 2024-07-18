const User = require("../models/User");
const bcrypt = require("bcrypt");

const cloudinary = require("../config/cloudinary");
const upload = require("../middlewares/multer");

const { getErrorMsg } = require("../middlewares/validators");
const { validateNames, requirePassword, validateNewPassword } = require("../middlewares/validators/user");

module.exports = {
  uploadImg: [
    upload.single("img"),
    async (req, res) => {
      if (!req.file) return res.status(400).send("Please upload an image.");
      cloudinary.uploader.upload(
        req.file.path,
        { transformation: [{ width: 500, height: 500, gravity: "face", crop: "thumb" }] },
        async (error, result) => {
          if (error) return res.status(500).send(error.message);
          try {
            const user = await User.findByIdAndUpdate(req.user._id, { imgUrl: result.secure_url }, { new: true });
            res.send(user);
          } catch (error) {
            res.status(500).send(error.message);
          }
        }
      );
    },
  ],

  // ---------------------------------------

  deleteImg: async (req, res) => {
    try {
      const user = await User.findByIdAndUpdate(req.user._id, { imgUrl: "" }, { new: true });
      res.send(user);
    } catch (error) {
      res.status(500).send(error.message);
    }
  },

  // ---------------------------------------

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

  // ---------------------------------------

  deleteAccount: [
    requirePassword,
    getErrorMsg,
    async (req, res) => {
      try {
        const { password } = req.body;
        const user = await User.findById(req.user._id).select("+password");
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).send("The password is not correct.");
        await User.findByIdAndDelete(req.user._id);
        res.send("Account deleted successfully.");
      } catch (error) {
        res.status(500).send(error.message);
      }
    },
  ],
};
