var jwt               = require('jsonwebtoken'),
  passport            = require('passport'),
  tokenConfig         = require('../../../config/token'),
  SocialMedia         = require('../../persistence/crud/socialMediaAccount'),
  token               = null,
  user                = null;

function Auth() {

}

// function login(req, res, next) {
//   passport.authenticate('local-login', function(error, user, info){
//     if (error) {
//       return next(error);
//     }
//     if (!user) {
//       return res.status(401).json({error: 'No user found'});
//     }
//     var userToken = {
//       _id: user._id,
//       aclRoles: user.aclRoles,
//       userName: user.userName
//     };
//     token =  jwt.sign(userToken, tokenConfig.secret, { expiresIn: tokenConfig.expires });
//     res.json({token: token});
//   })(req, res, next);
// }


function loginSuccess(req, res, next) {
  token =  jwt.sign(req.user, tokenConfig.secret, { expiresIn: tokenConfig.expires });
  debugger;
  res.json({token: token});
}



function facebook(req, res, next){
  passport.authenticate('facebook')(req, res, next);
}

function facebookAuthFailure() {
  passport.authenticate('facebook', { failureRedirect: '/login' });
}

function facebookCallback(req, res, next) {
  
  debugger;
  if (req.newUser) 
  {
    req.user.newUser = req.newUser;
    token =  jwt.sign(req.user, tokenConfig.secret, { expiresIn: tokenConfig.expires });
    req.user = '';
    req.token = token;
    res.redirect('/login?token='+token);
  }
  else 
  {
    token =  jwt.sign(req.user, tokenConfig.secret, { expiresIn: tokenConfig.expires });
    req.user = '';
    req.token = token;
    res.redirect('/login');
  }
  
}

function google() {
  passport.authenticate('google');
}

function googleCallback(req, res, next) {
  passport.authenticate('google', { 
    successRedirect: '/?login=success',
    failureRedirect: '/?login=failed'
  })(req, res, next);
}

function instagram(req, res, next) {
  console.log('hitting instagram api');
  passport.authenticate('instagram')(req, res, next);
}

function instagramCallback(req, res, next) {
  passport.authenticate('instagram', { 
    successRedirect: '/?login=success',
    failureRedirect: '/?login=failed'
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


Auth.prototype.login               = passport.authenticate('local-login');
Auth.prototype.loginSuccess        = loginSuccess;
Auth.prototype.facebook            = passport.authenticate('facebook');
Auth.prototype.facebookAuthFailure = passport.authenticate('facebook', { failureRedirect: '/login' });
Auth.prototype.facebookCallback    = facebookCallback;
Auth.prototype.google              = google;
Auth.prototype.googleCallback      = googleCallback;
Auth.prototype.twitter             = twitter;
Auth.prototype.twitterCallback     = twitterCallback;
Auth.prototype.instagram           = instagram;
Auth.prototype.instagramCallback   = instagramCallback;

module.exports = new Auth();