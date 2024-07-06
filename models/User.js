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
    profileImg: { type: String, default: "" },
    password: { type: String, required: true, select: false },
    refreshToken: { type: String, default: "", select: false },
    tasks: { type: [tasksSchema], default: [] },
    notes: { type: [noteSchema], default: [] },
    security: {
      passwordResetToken: { type: String, default: "", select: false },
      verificationCode: { type: String, default: "", select: false },
      verificationCodeExpiration: { type: Date, default: null, select: false },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
