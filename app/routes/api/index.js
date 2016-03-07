var apiRouter = require('express').Router();
var passport  = require('passport');

var users = require('./users');

apiRouter.use('/users', users.router);

/**
 * /auth
 */
var auth = require('./auth');
apiRouter.route('/auth/token')
  .post(auth.login);

exports.router = apiRouter;