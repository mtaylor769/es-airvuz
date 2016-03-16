var usersRouter         = require('express').Router();
var passport            = require('passport');
var Users               = require('../../persistence/crud/users');
var jwt                 = require('jsonwebtoken');
var tokenConfig         = require('../../../config/token');



function post(req, res) {
  Users.create(req.body);
}

usersRouter.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
})

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}

module.export = {
  post: post
};