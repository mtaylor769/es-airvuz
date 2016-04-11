"use strict";

var FacebookStrategy    = require('passport-facebook').Strategy;
var log4js              = require('log4js');
var logger              = log4js.getLogger('app.config.passport.facebook');
var UsersCrud           = require('../../persistence/crud/users');
var SocialCrud          = require('../../persistence/crud/socialMediaAccount');
var socialAccount       = null;
var findUser            = null;
var account             = null;

module.exports = function(passport, config) {

  passport.serializeUser(function(user, done) {
    done(null, user);
  });

  passport.deserializeUser(function (id, done) {
    done(null, user);
  });

  passport.use(new FacebookStrategy({
    clientID            : config.facebook.clientID,
    clientSecret        : config.facebook.clientSecret,
    callbackURL         : config.facebook.callbackURL,
    passReqToCallback   : true,
    profileFields       : ['id', 'email','link', 'locale', 'name', 'updated_time']
  }, function (req, accessToken, refreshToken, profile, cb) {
    var data = {
      provider          : profile.provider,
      accountData       : profile,
      accountId         : profile.id,
      email             : profile.emails[0].value
    }

    logger.debug('Hitting facebook passport strategy');
    socialAccount = SocialCrud.findAccountByIdandProvider(data.accountId, data.provider);
    socialAccount.then(function(account){
      if (account) {
        findUser = UsersCrud.getUserByEmail(data.email);
        findUser.then(function(user){
          if (user && user._id) {

            if (user.socialMediaAccounts.indexOf(account._id) < 0) {
              //add social media id to user
            }
            return cb(null, user);
          } else {

            findUser = UsersCrud.getUserBySocialId(account._id);
            findUser.then(function(user){
              if (user && user._id) {

                return cb(null, user);
              } else {
                user = {
                  email               : data.email,
                  firstName           : data.accountData.name.givenName,
                  lastName            : data.accountData.name.familyName,
                  socialMediaAccount  : account._id,
                  provider            : data.provider
                }
                return cb(null, user);
              }
            });
          }
        });
      } else {
        account = SocialCrud.create(data);
        account.then(function(newAccount){
          if (newAccount && newAccount._id) {
            findUser = UsersCrud.getUserByEmail(data.email);
            findUser.then(function(user){
              if (user && user._id) {
                //add social media id to current user and return user
                return cb(null, user);
              } else {
                user = {
                  email               : data.email,
                  firstName           : data.accountData.name.givenName,
                  lastName            : data.accountData.name.familyName,
                  socialMediaAccount  : newAccount._id,
                  provider            : data.provider
                }
                return cb(null, user);
              }
            });
          }
        });
      }
    });
  }));
}