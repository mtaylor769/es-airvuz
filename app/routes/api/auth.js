var jwt               = require('jsonwebtoken'),
  passport            = require('passport'),
  tokenConfig         = require('../../../config/token'),
  SocialMedia         = require('../../persistence/crud/socialMediaAccount');

function login(req, res, next) {
  passport.authenticate('local-login', function(error, user, info){
    if (error) {
      return next(error);
    }
    if (!user) {
      return res.status(401).json({error: 'No user found'});
    }
    var userToken = {
      _id: user._id,
      aclRoles: user.aclRoles,
      userName: user.userName
    };
    var token =  jwt.sign(userToken, tokenConfig.secret, { expiresIn: tokenConfig.expires });
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

function instagram(req, res, next) {
  console.log('hitting instagram api');
  passport.authenticate('instagram')(req, res, next);
}

function instagramCallback(req, res, next) {
  passport.authenticate('instagram', { 
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
  twitterCallback     : twitterCallback,
  instagram           : instagram,
  instagramCallback   : instagramCallback
};