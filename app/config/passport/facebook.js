"use strict";

var FacebookStrategy    = require('passport-facebook').Strategy;
var SocialMedia         = require('../../persistence/crud/socialMediaAccount');
var Users               = require('../../persistence/crud/users');


module.exports = function(passport, config) {

  passport.serializeUser(function(user, done) {
    done(null, user);
  });

  passport.deserializeUser(function (id, done) {
    done(null, user);
  });

  passport.use(new FacebookStrategy({
    clientID: config.facebook.clientID,
    clientSecret: config.facebook.clientSecret,
    callbackURL: config.facebook.callbackURL,
    passReqToCallback: true,
    profileFields: ['id', 'email', 'gender', 'link', 'locale', 'name', 'timezone', 'updated_time', 'verified']
  }, function (req, accessToken, refreshToken, profile, cb) {
    var data = {
      provider    : profile.provider,
      accountData : profile,
      accountId   : profile.id
    }
    var account = SocialMedia.findAccountByIdandProvider(data.accountId, data.provider);
    account.then(function(accountInfo){
      if (accountInfo) {
        var findUser = matchAccounts(data, accountInfo);
        return cb(null, findUser);
      } else {
        var newAccount = SocialMedia.create(data);
        newAccount.then(function(error, newAccountData){
          if (error) {
            cb(null, error);
          } else {
            var findUser = matchAccounts(data, newAccountData._id);
            return cb(null, findUser);
          }
        });
      }
    });
    

  }));

  var matchAccounts = function(data, account) {
    var findUser = Users.getUserBySocialId(account._id);
    findUser.then(function(theUser){
      if (theUser && theUser.length > 0) {
        return theUser;
      } else {
        console.log('no user found in matchAccounts');
        console.log(data.accountData.emails[0].value);
        var userData = {
          userName : data.accountData.name.givenName + " " + data.accountData.name.familyName,
          firstName : data.accountData.name.givenName,
          lastName : data.accountData.name.familyName,
          emailAddress : data.accountData.emails[0].value,
          socialMediaAccounts : account._id
        }
        var newUser = Users.create(userData);
        return newUser;
      }
    });
  };
};