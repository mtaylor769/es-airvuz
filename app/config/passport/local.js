"use strict";

var log4js = require('log4js');
var logger = log4js.getLogger('app.config.passport.local');

var LocalStrategy         = require('passport-local').Strategy;
var Users                 = require('../../persistence/crud/users');

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
      logger.debug(error);
      done(error, null);
    });
  });
  
  passport.use('local-login', new LocalStrategy({
    usernameField: 'emailAddress',
    passwordField: 'password'
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
      if(user.status !== 'active') {
        return done(user.status, false);
      }
      return done(null, {
        _id: user._id,
        aclRoles: user.aclRoles
      });
    })
    .error(function(error){
      logger.error(error);
      return done(error, false);
    });
  }));
};