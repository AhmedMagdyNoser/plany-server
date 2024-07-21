const Router = require("express").Router();

const controller = require("../controllers/auth");

Router.post("/register", controller.register);

Router.post("/login", controller.login);

Router.post("/logout", controller.logout);

Router.get("/refresh-access-token", controller.refreshAccessToken);

Router.post("/send-verification-code", controller.sendVerificationCode);

Router.post("/verify-verification-code", controller.verifyVerificationCode);

Router.patch("/reset-password", controller.resetPassword);

Router.post("/forgot-password/mail-code", controller.forgotPasswordMailCode);

Router.post("/forgot-password/verify-code", controller.forgotPasswordVerifyCode);

module.exports = Router;
