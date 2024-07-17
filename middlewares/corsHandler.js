const cors = require("cors");

module.exports = (whitelist) =>
  cors({
    origin: (origin, callback) => {
      if (whitelist.includes(origin) || !origin) callback(null, true);
      else callback(new Error(`Origin: ${origin} not allowed by CORS`));
    },
    credentials: true,
  });
