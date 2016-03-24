"use strict";

var FacebookStrategy    = require('passport-facebook').Strategy;


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
      provider       : profile.provider,
      accountData    : profile,
      accountId      : profile.id,
      email          : profile.emails[0].value
    }
    var user = UserService.findSocialAccount(data);
    return cb(null, user);
  }));
}