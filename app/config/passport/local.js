"use strict";

let _ = require('lodash');
let LocalStrategy = require('passport-local').Strategy;
let Users =  require('../../persistence/crud/users');
let Promise = require('bluebird');

const PROVIDER_KEY = 'local';

module.exports = new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, function (email, password, done) {
  var userPromise = Users.getUserByEmail(email);
  user
  .then(function(user) {
    if (!user) {
      return done(null, false);
    }
    if (!user.verifyPassword(password)) {
      return done(null, false);
    }
    return (null, user);
  })
  .error(function(error){
    return
  });
});

module.exports.PROVIDER_KEY = PROVIDER_KEY;