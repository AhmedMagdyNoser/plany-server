const cors = require("cors");

const whitelist = ["http://localhost:3000"];

module.exports = () =>
  cors({
    origin: (origin, callback) => {
      if (whitelist.includes(origin) || !origin) callback(null, true);
      else callback(new Error("BLOCKED BY CORS"));
    },
  });
