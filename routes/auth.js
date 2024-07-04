const Router = require("express").Router();

const controller = require("../controllers/auth");

const { validateFirstName, validateLastName, validateEmail, validatePassword } = require("../middlewares/validators/user");

Router.post("/register", validateFirstName, validateLastName, validateEmail, validatePassword, controller.register);

Router.post("/login", controller.login);

Router.post("/logout", controller.logout);

Router.get("/refresh-access-token", controller.refreshAccessToken);

module.exports = Router;
