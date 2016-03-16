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
  console.log('hitting facebook api');
  passport.authenticate('facebook', {scope : 'email'})(req, res, next);
}

function facebookCallback(req, res, next) {
  console.log('successful facebook auth callback');
  passport.authenticate('facebook', { failureRedirect: '/play' })(req, res, next),
  function(req, res) {
    console.log(req.body);
    res.redirect('/');
  };
}

function google(req, res, next) {
  console.log('hitting google api');
  passport.authenticate('google', { scope : ['profile', 'email'] })(req, res, next);
}

function googleCallback(req, res, next) {
  console.log('successful google auth callback');
  passport.authenticate('google', { failureRedirect: '/play' })(req, res, next),
  function(req, res) {
    console.log(req.body);
    res.redirect('/');
  };
}

function local(req, res) {
  //passport
}

module.exports = {
  login               : login,
  local               : local,
  facebook            : facebook,
  facebookCallback    : facebookCallback,
  google              : google,
  googleCallback      : googleCallback
};