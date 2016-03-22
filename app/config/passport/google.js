"use strict";

var GoogleStrategy    = require('passport-google-oauth').OAuth2Strategy;
var SocialMedia         =  require('../../persistence/crud/socialMediaAccount');
var Users               = require('../../persistence/crud/users');

module.exports = function(passport, config) {
  passport.use(new GoogleStrategy({
    clientID: config.google.clientID,
    clientSecret: config.google.clientSecret,
    callbackURL: config.google.callbackURL,
    passReqToCallback: true
  }, function (req, token, refreshToken, profile, cb) {
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
        console.log('empty user');
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