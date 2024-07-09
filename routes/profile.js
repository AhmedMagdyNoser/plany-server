const Router = require("express").Router();

const controller = require("../controllers/profile");

Router.patch("/upload-img", controller.uploadImg);

Router.delete("/delete-img", controller.deleteImg);

Router.patch("/change-name", controller.changeName);

Router.patch("/change-password", controller.changePassword);

module.exports = Router;
