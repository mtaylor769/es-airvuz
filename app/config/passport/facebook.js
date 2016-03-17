"use strict";

var FacebookStrategy = require('passport-facebook').Strategy;
var SocialMedia =  require('../../persistence/crud/socialMediaAccount');
var Users =  require('../../persistence/crud/users');

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
    passReqToCallback: true
  }, function (req, accessToken, refreshToken, profile, done) {
    console.log('do your stuff here');
    console.log(profile);
    var data = {
      provider    : profile.provider,
      accountData : profile,
      accountId   : profile.id
    }
    var account = SocialMedia.findAccountByIdandProvider(data.accountId, data.provider);
    if (!account) {
      var newAccount = SocialMedia.create(data);
      console.log('a new account was created: ');
      console.log(newAccount);
      return done(null, newAccount);
    } else {
      console.log('account already exists: ');
      console.log(account);
      return done(null, account);
    }

  }));
};