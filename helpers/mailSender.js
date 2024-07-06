const nodemailer = require("nodemailer");

const PURPOSES = {
  RESET_PASSWORD: "Reset Password",
  VERIFY_EMAIL: "Verify Email",
  CHANGE_EMAIL: "Change Email",
};

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_SENDER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendVerificationEmail = async (to, purpose, verificationCode) => {
  await transporter.sendMail({
    to,
    from: `"Plany ✨🚀" ${process.env.EMAIL_SENDER}`,
    subject: `Plany - ${purpose}`,
    text: `Your verification code is: ${verificationCode}`,
    html: getHtmlVerificationContent(verificationCode),
  });
};

function getHtmlVerificationContent(verificationCode) {
  return `
    <div>
      <h2>Hello!</h2>
      <p>We received a request from you. Here is your verification code:</p>
      <h3>${verificationCode}</h3>
      <strong>This code is valid for only ${process.env.VERIFICATION_CODE_LIFE} minutes.</strong>
      <p>Best regards,</p>
      <p>Plany Team</p>
    </div>
  `;
}

module.exports = {
  PURPOSES,
  sendVerificationEmail,
};
