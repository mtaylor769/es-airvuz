"use strict";

var InstagramStrategy    = require('passport-instagram').Strategy;
var UserService       = require('../../utils/service/users.service');

module.exports = function(passport, config) {

  passport.serializeUser(function(user, done) {
    done(null, user);
  });

  passport.deserializeUser(function (id, done) {
    done(null, user);
  });

  passport.use(new InstagramStrategy({
    clientID: config.instagram.clientID,
    clientSecret: config.instagram.clientSecret,
    callbackURL: config.instagram.callbackURL,
    passReqToCallback: true
  }, function (req, accessToken, refreshToken, profile, cb) {
    console.log('profile');
    console.log(profile);
    var data = {
      provider    : profile.provider,
      accountData : profile,
      accountId   : profile.id,
      email       : profile.emails[0].value
    }
    
    var user = UserService.findSocialAccount(data);
    return cb(null, user);

  }));

};