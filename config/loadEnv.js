const fs = require("fs");
const path = require("path");

module.exports = () => {
  try {
    const data = fs.readFileSync(path.resolve(__dirname, "..", ".env"), "utf8");
    const lines = data.split("\n");
    lines.forEach((line) => {
      const [key, value] = line.split("=");
      if (key && value) {
        process.env[key.trim()] = value.trim();
      }
    });
  } catch (error) {
    console.error("Error loading .env file", error);
  }
};
