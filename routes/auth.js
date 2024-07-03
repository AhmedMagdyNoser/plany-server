const Router = require("express").Router();
const controller = require("../controllers/auth");

Router.post("/register", controller.register);

module.exports = Router;
