"use strict";

var GoogleStrategy    = require('passport-google-oauth').OAuth2Strategy;
var UserService       = require('../../utils/service/users.service');

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
      accountId   : profile.id,
      email       : profile.emails[0].value
    }
    console.log('profile');
    console.log(profile);
    var user = UserService.findSocialAccount(data);
    return cb(null, user);
  }));
};