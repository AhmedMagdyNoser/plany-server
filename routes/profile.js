const Router = require("express").Router();

const controller = require("../controllers/profile");

const { validateFirstName, validateLastName } = require("../middlewares/validators/user");

Router.patch("/change-name", validateFirstName, validateLastName, controller.changeName);

Router.patch("/change-password", controller.changePassword);

module.exports = Router;
