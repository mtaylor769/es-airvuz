var namespace = 'app.routes.apiVersion.auth1-0-0';

try {
    var log4js              = require('log4js');
    var logger              = log4js.getLogger(namespace);
    var jwt                 = require('jsonwebtoken');
//  var passport            = require('passport');
    var tokenConfig         = require('../../../config/token');
    var appConfig           = require('../../../config/config')[process.env.NODE_ENV || 'development'];
    var SocialCrud          = require('../../persistence/crud/socialMediaAccount');
    var usersCrud1_0_0      = require('../../persistence/crud/users1-0-0');
    var crypto              = require('crypto');
    var GoogleAuth          = require('google-auth-library');
    var authFactory         = new GoogleAuth();
    var token               = null;

    if (global.NODE_ENV === "production") {
        logger.setLevel("INFO");
    }
}
catch(exception) {
    logger.error(" import error:" + exception);
}
/**
 *
 * @constructor
 */
function Auth() {}

/**
 * route: POST /api/auth
 * user sign-in via email and password
 * @param req
 * @param res
 */
function localLogin(req, res) {
  var emailAddress  = req.body.emailAddress.trim();
  var password      = req.body.password;

  usersCrud1_0_0.getUserByEmail(emailAddress)
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
 * route: POST /api/auth/facebook
 * sign a user token
 * @param user
 * @private
 */
function _signToken(user) {
  return jwt.sign(user, tokenConfig.secret, {expiresIn: tokenConfig.expires});
}
/**
 * process token received from Google social login
 * @param token
 * @returns {Promise}
 * @private
 */
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
/**
 * route: POST /api/auth/facebook
 * login via facebook
 * @param req
 * @param res
 * @param next
 */
function facebook(req, res, next) {
  var socialData = req.body;
  socialData.provider = 'facebook';

  _validateFBDisplayName(socialData)
      .then(function() {
          // TODO: verify facebook token - like google
          return _socialLogin(socialData)
              .then(function (token) {
                  res.json(token);
              });
      })
      .catch(function(err) {
          if (err instanceof Array && err.length) {
              return res.status(400).json({'error': err[0].displayMsg});
          }

          return res.status(400).json(err);
      });
}
/**
 * route: POST /api/auth/google
 * login via Google+
 * @param req
 * @param res
 */
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
      return usersCrud1_0_0.getUserByEmail(socialData.email)
        .then(function (user) {
          if (user) {
            user.socialAccount = {
              isNew: false,
              provider: socialData.provider
            };
            socialData.userId = user._id;
            return SocialCrud.create(socialData)
              .then(function () {

                user.socialAccount.isNew = true;

                if (user.status === 'suspended') {
                  throw 'You are suspended, please contact support';
                }
                return _signToken({
                  _id: user._id,
                  aclRoles: user.aclRoles,
                  socialAccountInfo: user.socialAccount
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

          return usersCrud1_0_0.create(newUser)
            .then(function(user) {
              socialData.userId = user._id;
              return SocialCrud.create(socialData)
                  .then(function () {
                      return _validateFBDisplayName(socialData);
                  })
                .then(function () {
                  user.socialAccount = {
                      provider: socialData.provider,
                      isNew : true
                  };
                  return user;
                });
            })
            .then(function(user) {
              return _signToken({
                _id: user._id,
                aclRoles: user.aclRoles,
                socialAccountInfo: user.socialAccount
              });
            });
        });
    });
}

/**
 * FB login/signup require user to fill in username
 * @param socialData
 * @returns {Promise}
 * @private
 */
function _validateFBDisplayName(socialData) {
    return SocialCrud.findAccountByIdandProvider(socialData.accountId, socialData.provider)
        .then(function(account) {
            if (account) {
                var userId = account.userId._id.toString(),
                    reminderBool = socialData.useNameCreateReminder === 'true';

                if (account.provider === 'facebook') {
                    if (userId !== account.userId.userNameDisplay) {
                        return;
                    } else {
                        if (typeof socialData.altUserDisplayName === 'undefined' && account.userId.remindFBUserNameCreate === true) {
                            throw {
                                'error': 'Username is required',
                                'userName': account.userId.userNameDisplay
                            };
                        } else if (typeof socialData.altUserDisplayName === 'undefined' && account.userId.remindFBUserNameCreate === false) {
                            return;
                        } else if (socialData.altUserDisplayName.length === 0 && !reminderBool) {
                            throw {
                                'error': 'Username cannot be empty',
                                'userName': account.userId.userNameDisplay
                            };
                        } else if (socialData.altUserDisplayName.length && !reminderBool) {
                            return usersCrud1_0_0.update(userId, {
                                userNameDisplay: socialData.altUserDisplayName,
                                remindFBUserNameCreate: false
                            });
                        } else if (typeof socialData.altUserDisplayName !== 'undefined' && socialData.altUserDisplayName.length === 0 && reminderBool) {
                            return;
                        } else {
                            return usersCrud1_0_0.update(userId, {
                                userNameDisplay: socialData.altUserDisplayName,
                                remindFBUserNameCreate: false
                            });
                        }
                    }
                }
            } else {
                return true;
            }
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