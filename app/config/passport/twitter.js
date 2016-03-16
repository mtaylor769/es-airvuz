"use strict";
// Express 4.0 requires us to use express sessions
// http://stackoverflow.com/questions/22298033/nodejs-passport-error-oauthstrategy-requires-session-support

var TwitterStrategy     = require('passport-twitter').Strategy;

module.exports = function(passport, config) {
  passport.use(new TwitterStrategy({
    consumerKey           : config.twitter_local.clientID,
    consumerSecret        : config.twitter_local.clientSecret,
    callbackURL           : config.twitter_local.callbackURL
  }, function (token, tokenSecret, profile, cb) {
      console.log('hitting twitter strategy');
      //Need to look into profile information and return userID
      console.log(token);
      console.log(tokenSecret);
      console.log(profile);
      
      var consoleInformation = {
        token : token,
        tokenSecret : tokenSecret,
        profile : profile
      //log this and find out what it is
      
      };
    return cb(consoleInformation);
  }));
};