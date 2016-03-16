"use strict";

var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var SocialMedia =  require('../../persistence/crud/socialMediaAccount');

module.exports = function(passport, config) {
  passport.use(new GoogleStrategy({
    //Google local
    // clientID: "257509599064-3omlk38mtq8e3upm55eemp8q7hk1pqg6.apps.googleusercontent.com",
    // clientSecret: "DPdvaCrEoP2p6Jc7tzn5QOzP",
    // callbackURL: "http://localhost/auth/google/callback"
    clientID: config.google_localhost.clientID,
    clientSecret: config.google_localhost.clientSecret,
    callbackURL: 'http://localhost/api/socialmedia/google/callback',
    passReqToCallback: true
  }, function (token, refreshToken, profile, done) {
    //Need to look into profile information and return userID
    console.log(token);
    console.log(refreshToken);
    console.log(profile);
    
    var consoleInformation = {
      token: token,
      refreshToken: refreshToken,
      profile: profile
    }
    //log this and find out what it is
    return consoleInformation;
  }));
};