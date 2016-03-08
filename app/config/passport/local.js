"use strict";

let LocalStrategy = require('passport-local').Strategy;
let Users =  require('../../persistence/crud/users');

module.exports = function(passport){
  passport.use('local-signup', new LocalStrategy({
    firstName           : 'firstName',
    lastName            : 'lastName',
    userName            : 'userName',
    emailAddress        : 'email',
    password            : 'password'
  },
  function(req, email, password, done){
    process.nextTick(function(){
      var userPromise = Users.getUserByEmail(email);
      user.then(function(user) {
        //console.log(user);
        if (!user) {
          var newUser = {
            firstName         : req.firstName,
            lastName          : req.lastName,
            userName          : req.userName,
            emailAddress      : req.emailAddress
          }
          //TODO:  Zeke - look into doing this encryption
          newUser.password = bcrypt(password);

          var createUser = Users.create(newUser);
          return done(null, createUser);
        }
        if (!user.verifyPassword(password)) {
          return done(null, false);
        }
        return (null, user);
      })
      .error(function(error){
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
      if (!user.validPassword)
    })
    .error(function(error){
      return done(null, false);
    });
  }));
};