var log4js								= require('log4js');
var logger								= log4js.getLogger('app.routes.api.auth');

var jwt               = require('jsonwebtoken'),
  passport            = require('passport'),
  tokenConfig         = require('../../../config/token'),
  SocialMedia         = require('../../persistence/crud/socialMediaAccount'),
  token               = null,
  user                = null;



logger.debug("IN: *************************************************************");

function Auth() {

}

function loginSuccess(req, res, next) {
  token =  jwt.sign(req.user, tokenConfig.secret, { expiresIn: tokenConfig.expires });
  res.json({token: token});
}

function facebook(req, res, next){
  //logger.debug('hit route');
	logger.debug(".facebook IN: *************************************************************");
  passport.authenticate('facebook')(req, res, next);
}

function facebookAuthFailure() {
  passport.authenticate('facebook', { failureRedirect: '/login' });
}

function facebookCallback(req, res, next) {
  if (req.newUser) {
    req.user = req.newUser;
    token =  jwt.sign({_id: req.user._id, aclRoles: req.user.aclRoles}, tokenConfig.secret, { expiresIn: tokenConfig.expires });
  }
  else {
    token =  jwt.sign({_id: req.user._id, aclRoles: req.user.aclRoles}, tokenConfig.secret, { expiresIn: tokenConfig.expires });
  }
  res.redirect('/social-login?token='+token);
}

function google() {
  passport.authenticate('google', { scope: [ 'email', 'profile'],
    failureRedirect: '/',
    successRedirect: 'back'
  });
}

function googleCallback(req, res, next) {
    logger.debug('google callback function');
    if (req.newUser) {
      req.user = req.newUser;
      token = jwt.sign({
        _id: req.user._id,
        aclRoles: req.user.aclRoles
      }, tokenConfig.secret, {expiresIn: tokenConfig.expires});
    }
    else {
      token = jwt.sign({
        _id: req.user._id,
        aclRoles: req.user.aclRoles
      }, tokenConfig.secret, {expiresIn: tokenConfig.expires});
    }
    res.redirect('/social-login?token=' + token);
}

function instagram(req, res, next) {
  logger.debug('hitting instagram api');
  passport.authenticate('instagram')(req, res, next);
}

function instagramCallback(req, res, next) {
  passport.authenticate('instagram', { 
    successRedirect: '/?login=success',
    failureRedirect: '/?login=failed'
  })(req, res, next);
}

function twitter(req, res, next) {
  logger.debug('hitting twitter api');
  passport.authenticate('twitter', { scope : ['profile', 'email'] })(req, res, next);
}

function twitterCallback(req, res, next) {
  logger.debug('successful twitter auth callback');
  passport.authenticate('twitter', { failureRedirect: '/play' })(req, res, next),
  function(req, res) {
    logger.debug(req.body);
    res.redirect('/');
  };
}


Auth.prototype.login               = passport.authenticate('local-login');
Auth.prototype.loginSuccess        = loginSuccess;
Auth.prototype.facebook            = facebook;
Auth.prototype.facebookAuthFailure = facebookAuthFailure;
Auth.prototype.facebookCallback    = facebookCallback;
Auth.prototype.google              = google;
Auth.prototype.googleCallback      = googleCallback;
Auth.prototype.twitter             = twitter;
Auth.prototype.twitterCallback     = twitterCallback;
Auth.prototype.instagram           = instagram;
Auth.prototype.instagramCallback   = instagramCallback;

module.exports = new Auth();