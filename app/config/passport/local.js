"use strict";

var LocalStrategy = require('passport-local').Strategy;
var Users =  require('../../persistence/crud/users');

module.exports = function(passport, config) {

  passport.serializeUser(function(user, done) {
    done(null, user._id);
  });

  passport.deserializeUser(function (id, done) {
    Users.findById({ _id: id})
    .then(function(user){
      done(null, user);
    })
    .error(function(error){
      done(error, null);
    });
  });
  
  passport.use('local-login', new LocalStrategy({
    usernameField: 'email'
  },
  function(emailAddress, password, done){
    Users.getUserByEmail(emailAddress)
    .then(function(user) {
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