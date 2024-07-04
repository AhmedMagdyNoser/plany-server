const Router = require("express").Router();

const controller = require("../controllers/tasks");

Router.post("/", controller.create);

Router.get("/", controller.index);

Router.patch("/:id", controller.update);

Router.delete("/:id", controller.delete);

module.exports = Router;
