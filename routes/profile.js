const Router = require("express").Router();

const controller = require("../controllers/profile");

Router.patch("/change-name", controller.changeName);

Router.patch("/change-password", controller.changePassword);

module.exports = Router;
