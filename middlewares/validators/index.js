const { validationResult } = require('express-validator');

function getErrorMsg(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).send(errors.array()[0].msg);
  next();
}

module.exports = { getErrorMsg };
