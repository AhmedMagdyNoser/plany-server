const bcrypt = require("bcrypt");

async function generateVerificationCode() {
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
  const verificationCodeExpiration = Date.now() + 1000 * 60 * process.env.VERIFICATION_CODE_LIFE;
  const hashedVerificationCode = await bcrypt.hash(verificationCode, 10);
  return { hashedVerificationCode, verificationCode, verificationCodeExpiration };
}

module.exports = generateVerificationCode;
