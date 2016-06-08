"use strict";

var FacebookStrategy    = require('passport-facebook').Strategy;
var log4js              = require('log4js');
var logger              = log4js.getLogger('app.config.passport.facebook');
var UsersCrud           = require('../../persistence/crud/users');
var SocialCrud          = require('../../persistence/crud/socialMediaAccount');
var crypto              = require('crypto');

module.exports = function(passport, config) {
  passport.use(new FacebookStrategy({
    clientID            : config.facebook.clientID,
    clientSecret        : config.facebook.clientSecret,
    callbackURL         : config.facebook.callbackURL,
    passReqToCallback   : true,
    profileFields: ['email', 'first_name', 'last_name', 'gender', 'link', 'locale', 'timezone', 'updated_time', 'verified', 'picture', 'cover']
  }, function (req, accessToken, refreshToken, profile, done) {
    logger.info(profile);
    var socialData = {
      provider          : profile.provider,
      accountData       : profile,
      accountId         : profile.id,
      email             : profile.emails[0].value
    };

    SocialCrud.findAccountByIdandProvider(socialData.accountId, 'facebook')
      .then(function(account) {
        if (account) {
          // TODO: update social media account if updated_time is different
          return done(null, {
            _id: account.userId._id,
            aclRoles: account.userId.aclRoles
          });
        }

        // check if local user exists
        UsersCrud.getUserByEmail(socialData.email)
          .then(function (user) {
            if (user) {
              socialData.userId = user._id;
              return SocialCrud.create(socialData)
                .then(function () {
                  return done(null, {
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
              coverPicture: socialData.accountData._json.cover ? socialData.accountData._json.cover.source : '',
              password: randomPassword,
              confirmPassword: randomPassword,
              social: true
            };

            return UsersCrud.create(newUser)
              .then(function(user) {
                // asumming that social id is unique for all social media platform (facebook, google, etc..)
                socialData.userId = user._id;
                return SocialCrud.create(socialData)
                  .then(function () {
                    return user;
                  });
              })
              .then(function(user) {
                return done(null, {
                  _id: user._id,
                  aclRoles: user.aclRoles
                });
              });
          })
          .catch(function (err) {
            console.log('******************** err ********************');
            console.log(err);
            console.log('************************************************');
            return done(err);
          });
      });
  }));
};