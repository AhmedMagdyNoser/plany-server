const mongoose = require("mongoose");

module.exports = () => {
  mongoose
    .connect(process.env.DB_URI)
    .then(() => {
      console.log("Connected to the database.");
    })
    .catch((err) => {
      console.log("Failed to connect to the database.", err);
    });
};
