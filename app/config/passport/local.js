"use strict";

var LocalStrategy = require('passport-local').Strategy;
var Users =  require('../../persistence/crud/users');

module.exports = function(app, passport) {

  passport.use('local-login', new LocalStrategy(
  function(username, password, done){
    console.log(username);
    console.log(password);
    var userPromise = Users.getUserByUserName({username : username});
    userPromise.then(function(user){
      if (!user) {
        console.log('no user found');
        return done(null, false);
      }
      if (!user.validPassword) {
        console.log('invalid password');
        return done(null, false)
      }
      console.log('good to go');
      return done(null, user);
    })
    .error(function(error){
      return done(null, false);
    });
  }));
};