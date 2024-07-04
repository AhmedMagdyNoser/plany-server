const jwt = require("jsonwebtoken");

function generateAccessToken(user) {
  return jwt.sign(
    {
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        emailVerified: user.emailVerified,
        profileImg: user.profileImg,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: `${process.env.ACCESS_TOKEN_LIFE}s` }
  );
}

function generateRefreshToken(email) {
  return jwt.sign({ email }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: `${process.env.REFRESH_TOKEN_LIFE}s`,
  });
}

module.exports = { generateAccessToken, generateRefreshToken };
