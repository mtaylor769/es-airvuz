"use strict";

var FacebookStrategy = require('passport-facebook').Strategy;
var SocialMedia =  require('../../persistence/crud/socialMediaAccount');
var Users =  require('../../persistence/crud/users');


module.exports = function(passport, config) {

  passport.serializeUser(function(user, done) {
    done(null, user);
  });

  passport.deserializeUser(function (id, done) {
    done(null, user);
  });

  passport.use(new FacebookStrategy({
    clientID: config.facebook.clientID,
    clientSecret: config.facebook.clientSecret,
    callbackURL: config.facebook.callbackURL,
    passReqToCallback: true,
    profileFields: ['id', 'email', 'gender', 'link', 'locale', 'name', 'timezone', 'updated_time', 'verified']
  }, function (req, accessToken, refreshToken, profile, done) {
    var data = {
      provider    : profile.provider,
      accountData : profile,
      accountId   : profile.id
    }
    var account = SocialMedia.findAccountByIdandProvider(data.accountId, data.provider);
    account.then(function(accountInfo){
      console.log('Users Crud: ');
      console.log(Users);
      var findUser = {};
      if (accountInfo) {
        findUser = matchAccounts(data, accountInfo._id);
        console.log('account already exists user found');
        console.log(findUser);
        return done(null, findUser);
      } else {
        var newAccount = SocialMedia.create(data);
        newAccount.then(function(error, newAccountData){
          if (error) {
            done(null, error);
          } else {
            findUser = matchAccounts(data, newAccountData._id);
            return done(null, findUser);
          }
        });
      }
    });
    

  }));

  var matchAccounts = function(data, id) {
    console.log('matching accounts');
    //console.log(data);
    console.log('id: '+ id);
    console.log(Users);
    Users.findOne({socialMediaAccounts : id }, function(error, user){
      if (error) {
        return error;
      } 
      if (!user) {
        var userData = {
          userName : data.name.givenName + " " + data.name.familyName,
          firstName : data.name.givenName,
          lastName : data.name.familyName,
          emailAddress : data.emails[0].value,
          socialMediaAccounts : id
        }
        var newUser = Users.create(userData);
        newUser.then(function(error, user){
          console.log('new user created for id: ' + id);
          console.log(user);
          return user;
        });
      } else {
        user.then(function(error, userData){
          console.log('user exists, returning user');
          console.log(userData);
        });
        return user;
      }
    });
  };

};