/**
 * middleware to extract token if exists
 */

var jwt = require('jsonwebtoken'),
  token = require('../../config/token');

module.exports = function (req, res, next) {
  if ('authorization' in req.headers && req.headers.authorization.split(' ')[0] === 'Bearer') {
    jwt.verify(req.headers.authorization.split(' ')[1], token.secret, function (err, decode) {
      req.user = err ? null : decode;
      next();
    });
  } else {
    next();
  }
};