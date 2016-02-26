var usersRouter = require('express').Router();

usersRouter.get('/', function (req, res) {

  res.send('Test');

});

exports.router = usersRouter;