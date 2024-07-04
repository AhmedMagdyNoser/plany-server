const jwt = require("jsonwebtoken");

// Middleware to verify the access token to protect the routes and pass the user data to the next middleware.

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.sendStatus(401);
  // Verify the sent access token
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) return res.sendStatus(403);
    req.user = decoded.user;
    next();
  });
};
