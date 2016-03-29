"use strict";

var InstagramStrategy    = require('passport-instagram').Strategy;
var UserService       = require('../../utils/service/users.service');

module.exports = function(passport, config) {

  passport.serializeUser(function(user, done) {
    done(null, user);
  });

  passport.deserializeUser(function (id, done) {
    done(null, user);
  });

  passport.use(new InstagramStrategy({
    clientID: config.instagram.clientID,
    clientSecret: config.instagram.clientSecret,
    callbackURL: config.instagram.callbackURL,
    passReqToCallback: true
  }, function (req, accessToken, refreshToken, profile, cb) {
    console.log('profile');
    console.log(profile);
    var data = {
      provider    : profile.provider,
      accountData : profile,
      accountId   : profile.id
    }
    
    logger.debug('Hitting facebook passport strategy');
    var socialAccount = SocialCrud.findAccountByIdandProvider(data.accountId, data.provider);
    socialAccount.then(function(account){
      if (account) {
        logger.debug('found social media account in social media model');
        logger.info(account);
        var findUser = UsersCrud.getUserByEmail(data.email);
        findUser.then(function(user){
          if (user && user._id) {
            logger.debug('found user - check to see social media ids match');
            if (user.socialMediaAccounts.indexOf(account._id) < 0) {
              //add social media id to user
            }
            return cb(null, user);
          } else {
            logger.debug('no user found with email, searching for existing social media id');
            findUser = UsersCrud.getUserBySocialId(account._id);
            findUser.then(function(user){
              if (user && user._id) {
                logger.debug('user found with social media id returning user');
                return cb(null, user);
              } else {
                logger.debug('no user found, prompt to create new user');
                //req needs information about user data and social media id
                data.socialMediaAccounts = account._id;
                req.newUserInfo = data;
                return cb(null, null);
              }
            });
          }
        });
      } else {
        logger.debug('social media account does not currently exist');
        var account = SocialCrud.create(data);
        account.then(function(newAccount){
          if (newAccount && newAccount._id) {
            logger.debug('created new social media account in social media model');
            logger.debug('search user model for existing user with email');
            var findUser = UsersCrud.getUserByEmail(data.email);
            findUser.then(function(user){
              if (user && user._id) {
                logger.debug('user with email currently exists, adding social media id and returing user');
                //add social media id to current user and return user
                return cb(null, user);
              } else {
                logger.trace('Needs to be passed back to client to verify and create new account');
                data.socialMediaAccounts = newAccount._id;
                req.newUserInfo = data;
                return cb(null, null);
              }
            });
            
          }
        });
      }
    });

  }));

};