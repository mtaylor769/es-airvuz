"use strict";

var FacebookStrategy    = require('passport-facebook').Strategy;
var UsersCrud           = require('../../persistence/crud/users');
var SocialCrud          = require('../../persistence/crud/socialMediaAccount');


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
  }, function (req, accessToken, refreshToken, profile, cb) {
    var data = {
      provider       : profile.provider,
      accountData    : profile,
      accountId      : profile.id,
      email          : profile.emails[0].value
    }
    //find social account

    var socialAccount = SocialCrud.findAccountByIdandProvider(data);
    if (socialAccount) {
      console.log('found social media account in social media model');
      var user = UsersCrud.getUserByEmail(data.email);
      if (user && user._id) {
        console.log('found user - check to see social media ids match');
        if (user.socialMediaAccounts.indexOf(socialAccount._id) < 0) {
          //add social media id to user
        }
        return cb(null, user);
      } else {
        console.log('no user found with email, searching for existing social media id');
        user = UsersCrud.getUserBySocialId(socialAccount._id);
        if (user) {
          console.log('user found with social media id returning user');
          return cb(null, user);
        } else {
          console.log('no user found, prompt to create new user');
          //req needs information about user data and social media id
          data.socialMediaAccounts = socialAccount._id;
          req.newUserInfo = data;
          return cb(null, null);
        }
      }
      
    } else {
      console.log('social media account does not currently exist');
      socialAccount = SocialCrud.create(data);
      if (socialAccount && socialAccount._id) {
        console.log('created social media account in social media model');
      }
      console.log('search user model for existing user with email');
      var user = UsersCrud.getUserByEmail(data.email);
      if (user && user._id) {
        console.log('user with email currently exists, adding social media id and returing user');
        //add social media id to current user and return user
        return cb(null, user);
      } else {
        data.socialMediaAccounts = socialAccount._id;
        req.newUserInfo = data;
        return cb(null, null);
      }

      console.log('no user exists, prompt to create new user');
      //req needs information about user data and social media id
    }
    
  }));
}