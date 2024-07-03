const jwt = require("jsonwebtoken");

function generateAccessToken(payload) {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: `${process.env.ACCESS_TOKEN_LIFE}s`,
  });
}

function generateRefreshToken(payload) {
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: `${process.env.REFRESH_TOKEN_LIFE}s`,
  });
}

module.exports = { generateAccessToken, generateRefreshToken };
