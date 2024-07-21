const bcrypt = require("bcrypt");

async function generateVerificationCode() {
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
  const verificationCodeExpiration = Date.now() + 1000 * 60 * process.env.VERIFICATION_CODE_LIFE;
  const hashedVerificationCode = await bcrypt.hash(verificationCode, 10);
  return { hashedVerificationCode, verificationCode, verificationCodeExpiration };
}

async function validateVerificationCode(storedCode, storedExpiration, providedCode) {
  if (!storedCode || !storedExpiration) {
    return { valid: false, status: 400, message: "No verification code found." };
  }

  if (Date.now() > storedExpiration) {
    return { valid: false, status: 401, message: "The verification code has expired." };
  }

  const isMatch = await bcrypt.compare(providedCode, storedCode);
  if (!isMatch) return { valid: false, status: 401, message: "Invalid verification code." };

  return { valid: true };
}

module.exports = { generateVerificationCode, validateVerificationCode };
