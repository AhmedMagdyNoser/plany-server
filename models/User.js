const mongoose = require("mongoose");

mongoose.plugin((schema) => schema.set("versionKey", false));

const tasksSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    completed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const noteSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    emailVerified: { type: Boolean, default: false },
    imgUrl: { type: String, default: "" },
    password: { type: String, required: true, select: false },
    tasks: { type: [tasksSchema], default: [] },
    notes: { type: [noteSchema], default: [] },
    security: {
      refreshToken: { type: String, default: "", select: false },
      resetPasswordToken: { type: String, default: "", select: false },
      resetPasswordVerification: {
        code: { type: String, default: "", select: false },
        expiration: { type: Date, default: null, select: false },
      },
      verifyEmailVerification: {
        code: { type: String, default: "", select: false },
        expiration: { type: Date, default: null, select: false },
      },
      changeEmailVerification: {
        code: { type: String, default: "", select: false },
        expiration: { type: Date, default: null, select: false },
        newEmail: { type: String, default: "", select: false },
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
