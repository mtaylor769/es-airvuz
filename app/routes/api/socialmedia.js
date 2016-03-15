var socialmediaRouter   = require('express').Router();
var passport            = require('passport');
var SocialMedia         = require('../../persistence/crud/socialMediaAccount');
var jwt                 = require('jsonwebtoken');
var tokenConfig         = require('../../../config/token');
var config              = require('../config/config')[global.NODE_ENV];

socialmediaRouter.get('/auth/facebook', passport.authenticate('facebook', passport.authenticate('facebook', {scope : 'email'})));

socialmediaRouter.get(config.facebook.callbackURL, function(req, res) {
  console.log(req.body);
});

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}

exports.router = socialmediaRouter;