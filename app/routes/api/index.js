var apiRouter = require('express').Router();

var users = require('./users');

apiRouter.use('/users', users.router);

exports.router = apiRouter;