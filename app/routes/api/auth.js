var jwt               = require('jsonwebtoken'),
  passport            = require('passport'),
  tokenConfig         = require('../../../config/token'),
  passport            = require('passport'),
  SocialMedia         = require('../../persistence/crud/socialMediaAccount');;

function login(req, res, next) {
  passport.authenticate('local-login', function(error, user, info){
    if (error) {
      return next(error);
    }
    if (!user) {
      return res.json(401, {error: 'No user found'});
    }
    var token =  jwt.sign(user, tokenConfig.secret, { expiresIn: tokenConfig.expires });
    res.json({token: token});
  })(req, res, next);
}

function facebook(req, res, next) {
  passport.authenticate('facebook')(req, res, next);
}

function facebookCallback(req, res, next) {
  passport.authenticate('facebook', { 
    successRedirect: '/',
    failureRedirect: '/play'
  })(req, res, next);
}

function google(req, res, next) {
  console.log('hitting google api');
  passport.authenticate('google', { scope : ['profile', 'email'] })(req, res, next);
}

function googleCallback(req, res, next) {
  passport.authenticate('google', { 
    successRedirect: '/',
    failureRedirect: '/play'
  })(req, res, next);
}

function twitter(req, res, next) {
  console.log('hitting twitter api');
  passport.authenticate('twitter', { scope : ['profile', 'email'] })(req, res, next);
}

function twitterCallback(req, res, next) {
  console.log('successful twitter auth callback');
  passport.authenticate('twitter', { failureRedirect: '/play' })(req, res, next),
  function(req, res) {
    console.log(req.body);
    res.redirect('/');
  };
}

module.exports = {
  login               : login,
  facebook            : facebook,
  facebookCallback    : facebookCallback,
  google              : google,
  googleCallback      : googleCallback,
  twitter             : twitter,
  twitterCallback     : twitterCallback
};