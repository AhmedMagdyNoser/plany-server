const NAME_REGEX = /^[a-zA-Z]+$/;
const EMAIL_PART_REGEX = /[a-zA-Z_\d]([a-zA-Z_\d.-]*[a-zA-Z_\d])?/;
const EMAIL_REGEX = new RegExp(`^${EMAIL_PART_REGEX.source}@${EMAIL_PART_REGEX.source}\\.[a-zA-Z0-9]{2,}$`);
const PASSWORD_REGEX = /^.{8,}$/;

const validateName = (name, nameLabel) => {
  if (!name) return { valid: false, status: 400, message: `Please provide a ${nameLabel}.` };
  if (!NAME_REGEX.test(name))
    return { valid: false, status: 400, message: `The ${nameLabel} should only contain alphabets.` };
  return { valid: true };
};

const validateFirstName = (req, res, next) => {
  const { valid, status, message } = validateName(req.body.firstName, "first name");
  if (!valid) return res.status(status).send(message);
  next();
};

const validateLastName = (req, res, next) => {
  const { valid, status, message } = validateName(req.body.lastName, "last name");
  if (!valid) return res.status(status).send(message);
  next();
};

const validateEmail = (req, res, next) => {
  const email = req.body.email;
  if (!email) return res.status(400).send("Please provide an email address.");
  if (!EMAIL_REGEX.test(email)) return res.status(400).send("Please provide a valid email address.");
  next();
};

const validatePassword = (req, res, next) => {
  const password = req.body.password;
  if (!password) return res.status(400).send("Please provide a password.");
  if (!PASSWORD_REGEX.test(password)) return res.status(400).send("The password should be at least 8 characters long.");
  next();
};

module.exports = {
  NAME_REGEX,
  EMAIL_REGEX,
  PASSWORD_REGEX,
  validateFirstName,
  validateLastName,
  validateEmail,
  validatePassword,
};
