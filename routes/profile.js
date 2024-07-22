const Router = require("express").Router();

const controller = require("../controllers/profile");

Router.patch("/upload-img", controller.uploadImg);

Router.delete("/delete-img", controller.deleteImg);

Router.patch("/change-color", controller.changeColor);

Router.patch("/change-name", controller.changeName);

Router.post("/change-email/mail-code", controller.changeEmailMailCode);

Router.patch("/change-email/verify-code", controller.changeEmailVerifyCode);

Router.post("/verify-email/mail-code", controller.verifyEmailMailCode);

Router.patch("/verify-email/verify-code", controller.verifyEmailVerifyCode);

Router.patch("/change-password", controller.changePassword);

Router.delete("/delete-account", controller.deleteAccount);

module.exports = Router;
