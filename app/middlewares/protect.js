/**
 * Protect middleware require a token
 */

var jwt = require('jsonwebtoken'),
  token = require('../../config/token');

module.exports = function (req, res, next) {
  if ('authorization' in req.headers && req.headers.authorization.split(' ')[0] === 'Bearer') {
    jwt.verify(req.headers.authorization.split(' ')[1], token.secret, function (err, decode) {
      if (err) {
        res.status(401).send('Invalid token');
      } else {
        req.user = decode;
        next();
      }
    });
  } else {
    res.status(401).send('No authorization token was found');
  }
};