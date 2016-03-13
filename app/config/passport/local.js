"use strict";

var LocalStrategy = require('passport-local').Strategy;
var Users =  require('../../persistence/crud/users');
var passport = require('passport');

module.exports = function(){
  passport.use('local-signup', new LocalStrategy({
    firstName           : 'firstName',
    lastName            : 'lastName',
    userName            : 'userName',
    emailAddress        : 'emailAddress',
    password            : 'password'
  },
  function(req, email, password, firstName, lastName, userName, done){
    console.log('Hittng local passport signup');
    process.nextTick(function(){
      
      var userPromise = Users.getUserByEmail(email);
      console.log('email: ');
      console.log(email);
      user.then(function(user) {
        console.log('user: ');
        console.log(user);
        if (!user) {
          var newUser = new User();
          newUser.emailAddress    = email;
          newUser.firstName       = firstName;
          newUser.lastName        = lastName;
          newUser.userName        = userName;
          newUser.password        = newUser.generateHash(password);

          var createUser = Users.create(newUser);
          return done(null, createUser);
        }
        if (!user.verifyPassword(password)) {
          return done(null, false);
        }
        return (null, user);
      })
      .error(function(error){
        console.log("Error from promise: " + error);
        return done(null, false);
      });
    });
  }));

  passport.use('local-login', new LocalStrategy({
    emailAddress            : 'email',
    password                : 'password'
  },
  function(req, email, password, done){
    var userPromise = Users.getUserByEmail({emailAddress : email});
    userPromise.then(function(user){
      if (!user) {
        return done(null, false);
      }
      if (!user.validPassword) {
        return done(null, false)
      }
      return done(null, user);
    })
    .error(function(error){
      return done(null, false);
    });
  }));
};