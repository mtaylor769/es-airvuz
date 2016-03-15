"use strict";

var FacebookStrategy = require('passport-facebook').Strategy;


module.exports = function(passport, config) {
  passport.use(new FacebookStrategy({
    clientID: config.facebook.clientID,
    clientSecret: config.facebook.clientSecret,
    callbackURL: config.facebook.callbackURL,
    passReqToCallback: true
  }, function (req, accessToken, refreshToken, profile, done) {
    //Need to look into profile information and return userID
    var consoleInformation = {
      accessToken : accessToken,
      refreshToken : refreshToken,
      profile : profile,
      done : done
    }
    //log this and find out what it is
    return consoleInformation;
  }));
};


  //profileFields: ['email', 'first_name', 'last_name', 'gender', 'link', 'locale', 'timezone', 'updated_time', 'verified']

