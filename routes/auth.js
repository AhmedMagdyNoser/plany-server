const Router = require("express").Router();

const controller = require("../controllers/auth");

Router.post("/register", controller.register);

Router.post("/login", controller.login);

Router.post("/logout", controller.logout);

Router.get("/refresh-access-token", controller.refreshAccessToken);

Router.post("/forgot-password/mail-code", controller.forgotPasswordMailCode);

Router.post("/forgot-password/verify-code", controller.forgotPasswordVerifyCode);

Router.patch("/forgot-password/reset-password", controller.forgotPasswordResetPassword);

module.exports = Router;
