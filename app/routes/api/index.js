var apiRouter = require('express').Router();
var passport  = require('passport');

var users = require('./users');
var videos = require('./videos');

apiRouter.use('/users', users.router);
apiRouter.use('/videos', videos.router);

/**
 * /auth
 */
var auth = require('./auth');
apiRouter.route('/auth/token')
  .post(auth.login);

exports.router = apiRouter;