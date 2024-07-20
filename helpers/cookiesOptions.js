module.exports = { httpOnly: true, maxAge: process.env.REFRESH_TOKEN_LIFE * 1000, sameSite: "none", secure: true };
