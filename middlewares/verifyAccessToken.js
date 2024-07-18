const jwt = require("jsonwebtoken");

// Middleware to verify the access token to protect the routes and pass the user data to the next middleware.

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).send("No access token provided.");
  // Verify the sent access token
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) return res.status(403).send("Invalid access token.");
    req.user = decoded.user;
    next();
  });
};
