var apiRouter = require('express').Router();
var passport  = require('passport');

var users = require('./users');

apiRouter.use('/users', users.router);

exports.router = apiRouter;