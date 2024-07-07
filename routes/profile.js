const Router = require("express").Router();

const controller = require("../controllers/profile");

const { validateFirstName, validateLastName, validatePassword } = require("../middlewares/validators/user");

Router.patch("/change-name", validateFirstName, validateLastName, controller.changeName);

// Router.patch("/change-password", validatePassword, controller.changePassword);

module.exports = Router;
