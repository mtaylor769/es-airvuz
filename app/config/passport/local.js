"use strict";

var LocalStrategy = require('passport-local').Strategy;
var Users =  require('../../persistence/crud/users');

module.exports = function(app, passport) {

  passport.use('local-login', new LocalStrategy({
    usernameField: 'emailAddress'
  },
  function(emailAddress, password, done){
    var userPromise = Users.getUserByEmail(emailAddress);

    userPromise.then(function(user){
      if (!user) {
        return done(null, false);
      }
      if (!user.validPassword(password)) {
        return done(null, false)
      }
      return done(null, user);
    })
    .error(function(error){
      return done(null, false);
    });
  }));
};