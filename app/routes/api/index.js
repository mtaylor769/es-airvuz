var apiRouter = require('express').Router();

var users = require('./users');


apiRouter.use('/users', users.router);

var auth = require('./auth');
apiRouter.route('/auth/token')
  .post(auth.login);

exports.router = apiRouter;