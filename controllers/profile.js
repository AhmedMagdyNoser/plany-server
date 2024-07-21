const User = require("../models/User");
const bcrypt = require("bcrypt");

const cloudinary = require("../config/cloudinary");
const upload = require("../middlewares/multer");

const { getErrorMsg } = require("../middlewares/validators");
const {
  validateNames,
  requirePassword,
  validateNewEmail,
  validateNewPassword,
  validateColor,
} = require("../middlewares/validators/user");
const generateVerificationCode = require("../helpers/generateVerificationCode");
const { PURPOSES, sendVerificationCodeToEmail } = require("../helpers/mailSender");

module.exports = {
  uploadImg: [
    upload.single("img"),
    async (req, res) => {
      if (!req.file) return res.status(400).send("Please upload an image.");
      cloudinary.uploader.upload(
        req.file.path,
        { transformation: [{ width: 500, height: 500, gravity: "face" }] },
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

  changeColor: [
    validateColor,
    getErrorMsg,
    async (req, res) => {
      try {
        const { color } = req.body;
        await User.findByIdAndUpdate(req.user._id, { favColor: color });
        res.send("Favorite color changed successfully.");
      } catch (error) {
        res.status(500).send(error.message);
      }
    },
  ],

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

  changeEmailMailCode: [
    validateNewEmail,
    getErrorMsg,
    async (req, res) => {
      try {
        const { newEmail } = req.body;
        const user = await User.findById(req.user._id);
        // Check if the new email is the same as the current email
        if (user.email === newEmail) return res.status(400).send("Please provide a different email.");
        // Check if the new email is already registered.
        const existingEmail = await User.findOne({ email: newEmail });
        if (existingEmail) return res.status(409).send("Looks like this email already exists.");
        // Generate a verification code
        const { hashedVerificationCode, verificationCode, verificationCodeExpiration } = await generateVerificationCode();
        // Save it for the current user
        await user.updateOne({
          "security.changeEmailVerification": {
            code: hashedVerificationCode,
            expiration: verificationCodeExpiration,
            newEmail,
          },
        });
        // Send it to the the NEW email
        await sendVerificationCodeToEmail(newEmail, PURPOSES.CHANGE_EMAIL, verificationCode);
        return res.sendStatus(200);
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
