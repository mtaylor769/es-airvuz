var log4js								= require('log4js');
var logger								= log4js.getLogger('app.routes.api.auth');

var jwt               = require('jsonwebtoken'),
  // passport            = require('passport'),
  tokenConfig         = require('../../../config/token'),
  appConfig           = require('../../../config/config')[process.env.NODE_ENV || 'development'],
  SocialCrud          = require('../../persistence/crud/socialMediaAccount'),
  UsersCrud           = require('../../persistence/crud/users'),
  crypto              = require('crypto'),
  GoogleAuth          = require('google-auth-library'),
  authFactory         = new GoogleAuth(),
  token               = null,
  EventTrackingCrud	  = require('../../persistence/crud/events/eventTracking');

function localLogin(req, res) {
  var emailAddress  = req.body.emailAddress.trim();
  var password      = req.body.password;

  UsersCrud.getUserByEmail(emailAddress)
    .then(function(user) {
      if (!user || !user.validPassword(password)) {
        throw 'Wrong email or password';
      }
      if(user.status !== 'active') {
        var message = 'You are suspended, please contact support';
        
        if (user.status === 'email-confirm') {
          message = 'Please check your email to confirm account';
        }
        throw message;
      }
      return _signToken({
        _id: user._id,
        aclRoles: user.aclRoles
      });
    })
    .then(function (token) {
      res.send(token);
    })
    .catch(function(error) {
      if (typeof error === 'string') {
        return res.status(400).send(error);
      }
      res.sendStatus(500);
    });
}

/**
 * sign a user token
 * @param user
 * @private
 */
function _signToken(user) {
  return jwt.sign(user, tokenConfig.secret, {expiresIn: tokenConfig.expires});
}

function _verifyGoogleToken(token) {
  var aud = appConfig.google.clientID;

  return new Promise(function (resolve, reject) {
    (new authFactory.OAuth2()).verifyIdToken(token, aud, function (err, user) {
      if (err) {
        return reject(err);
      }
      resolve(user.getPayload());
    });
  });
}

function Auth() {}

function facebook(req, res, next) {
  var socialData = req.body;
  socialData.provider = 'facebook';

  // TODO: verify facebook token - like google
  _socialLogin(socialData)
    .then(function (token) {
      res.json(token);
    })
    .catch(function (error) {
      if (typeof error === 'string') {
        return res.status(400).send(error);
      }
      res.sendStatus(500);
    });
}

function google(req, res) {
  _verifyGoogleToken(req.body.token)
    .then(function (response) {
      var socialData = {};

      socialData.profilePicture = response.picture;
      socialData.accountData = req.body.accountData;
      socialData.coverPicture = req.body.coverPicture;
      socialData.accountId = req.body.accountId;
      socialData.provider = 'google';
      socialData.email = response.email;

      return _socialLogin(socialData);
    })
    .then(function (token) {
      res.json(token);
    })
    .catch(function (error) {
      if (typeof error === 'string') {
        return res.status(400).send(error);
      }
      res.sendStatus(500);
    });
}

/**
 * social login or create new account
 * @param socialData
 * @returns {Promise} - with token if success
 * @private
 */
function _socialLogin(socialData) {
  return SocialCrud.findAccountByIdandProvider(socialData.accountId, socialData.provider)
    .then(function(account) {
      if (account) {
        if (account.userId.status === 'suspended') {
          throw 'You are suspended, please contact support';
        }
        return _signToken({
          _id: account.userId._id,
          aclRoles: account.userId.aclRoles
        });
      }

      // check if local user exists
      return UsersCrud.getUserByEmail(socialData.email)
        .then(function (user) {
          if (user) {
            socialData.userId = user._id;
            return SocialCrud.create(socialData)
              .then(function () {
                if (user.status === 'suspended') {
                  throw 'You are suspended, please contact support';
                }
                return _signToken({
                  _id: user._id,
                  aclRoles: user.aclRoles
                });
              });
          }

          // create a local user
          var randomPassword = crypto.randomBytes(7).toString('base64');
          var newUser = {
            emailAddress: socialData.email,
            // * validation require userNameDisplay
            // this will be replace later when saving
            userNameDisplay: socialData.accountId,
            // check to see if user have a cover picture
            coverPicture: socialData.coverPicture,
            profilePicture: socialData.profilePicture,
            password: randomPassword,
            confirmPassword: randomPassword,
            social: true
          };

          return UsersCrud.create(newUser)
            .then(function(user) {
              socialData.userId = user._id;
              return SocialCrud.create(socialData)
                .then(function () {
                  EventTrackingCrud.create({
                    codeSource  : "auth",
                    eventSource : "nodejs",
                    eventType   : "post",
                    eventName   : (socialData.provider === 'google' ? 'google-account-created' : 'facebook-account-created')
                  });

                  return user;
                });
            })
            .then(function(user) {
              return _signToken({
                _id: user._id,
                aclRoles: user.aclRoles
              });
            });
        });
    });
}

// function instagram(req, res, next) {
//   logger.debug('hitting instagram api');
//   passport.authenticate('instagram')(req, res, next);
// }
//
// function instagramCallback(req, res, next) {
//   passport.authenticate('instagram', {
//     successRedirect: '/?login=success',
//     failureRedirect: '/?login=failed'
//   })(req, res, next);
// }
//
// function twitter(req, res, next) {
//   logger.debug('hitting twitter api');
//   passport.authenticate('twitter', { scope : ['profile', 'email'] })(req, res, next);
// }
//
// function twitterCallback(req, res, next) {
//   logger.debug('successful twitter auth callback');
//   passport.authenticate('twitter', { failureRedirect: '/play' })(req, res, next),
//   function(req, res) {
//     logger.debug(req.body);
//     res.redirect('/');
//   };
// }


Auth.prototype.localLogin          = localLogin;
Auth.prototype.facebook            = facebook;
Auth.prototype.google              = google;
// Auth.prototype.twitter             = twitter;
// Auth.prototype.twitterCallback     = twitterCallback;
// Auth.prototype.instagram           = instagram;
// Auth.prototype.instagramCallback   = instagramCallback;

module.exports = new Auth();