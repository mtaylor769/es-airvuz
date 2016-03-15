var socialmediaRouter   = require('express').Router();
var passport            = require('passport');
var SocialMedia         = require('../../persistence/crud/socialMediaAccount');
var jwt                 = require('jsonwebtoken');
var tokenConfig         = require('../../../config/token');
var config              = require('../config/config')[global.NODE_ENV];

socialmediaRouter.get('/facebook', passport.authenticate('facebook', {scope : 'email'}));

socialmediaRouter.get('/api/socialmedia/facebook/callback', 
  passport.authenticate('facebook', { failureRedirect: '/play' }),
  function(req, res) {
    console.log('successful facebook auth');
    console.log(req.body);
  });

socialmediaRouter.get('/google', passport.authenticate('google', { scope : ['profile', 'email'] }));

socialmediaRouter.get('/api/socialmedia/google/callback', 
  passport.authenticate('google', { failureRedirect: '/play' }),
  function(req, res) {
    console.log('successful google auth');
    console.log(req.body);
});

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}

exports.router = socialmediaRouter;