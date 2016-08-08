/**
 * Protect middleware require a token
 */
try {
  var jwt = require('jsonwebtoken'),
    token = require('../../config/token');

  var log4js                 = require('log4js');
  var logger                 = log4js.getLogger('app.middlewares.protect');
  var usersCrud              = require('../persistence/crud/users');
  var _                      = require('lodash');
} catch(exception) {
  logger.error('require error:' + exception);
}

module.exports = function (req, res, next) {
  if ('authorization' in req.headers && req.headers.authorization.split(' ')[0] === 'Bearer') {
    jwt.verify(req.headers.authorization.split(' ')[1], token.secret, function (err, decode) {
      if (err) {
        return res.status(401).send('Invalid token');
      }
      // verify that the user is not suspend and also get the aclRoles from the database
      // incase the role was update
      usersCrud.verifyStatus(decode._id)
        .then(function (user) {
          if (user.status === 'suspended') {
            return res.status(403).send('suspended');
          }
          req.user = _.extend(decode, user);
          next();
        })
        .catch(function () {
          res.sendStatus(500);
        });
    });
  } else {
    res.status(401).send('No authorization token was found');
  }
};