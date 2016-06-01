"use strict";

var GoogleStrategy    = require('passport-google-oauth').OAuth2Strategy;
var UsersCrud         = require('../../persistence/crud/users');
var SocialCrud        = require('../../persistence/crud/socialMediaAccount');
var log4js            = require('log4js');
var logger            = log4js.getLogger('app.config.passport.google');
var aclRoles            = require('../../utils/acl');
var socialAccount       = null;
var findUser            = null;
var account             = null;

module.exports = function(passport, config) {
  
  logger.debug('making it to google.js');
  passport.serializeUser(function(user, done) {
    done(null, user);
  });

  passport.deserializeUser(function (id, done) {
    done(null, user);
  });

  passport.use(new GoogleStrategy({
    clientID: config.google.clientID,
    clientSecret: config.google.clientSecret,
    callbackURL: config.google.callbackURL,
    passReqToCallback: true
  }, function (req, token, refreshToken, profile, cb) {
    var data = {
      provider    : 'google',
      accountData : profile,
      accountId   : profile.id,
      email       : profile.emails[0].value
    };

    socialAccount = SocialCrud.findAccountByIdandProvider(data.accountId, 'google');
    socialAccount.then(function(account){
      if (account) {

        //if there is a social media account try to find user
        if(account.userId) {

          // if account user._id exists get by ID
          findUser = UsersCrud.getUserById(account.userId);
        } else {

          //otherwise get by email
          findUser = UsersCrud.getUserByEmail(account.email);
        }
        findUser.then(function (user) {

          //if theres a user check account userId
          if (user && user._id) {

            account.userId = user._id;
            account.save()
              .then(function(account) {
                return cb(null, user);
              })
          } else {
            logger.debug('failed email logging social account');
            logger.debug(account);
          }
        });
      } else {

        // SocialMediaAccount does NOT exist
        account = SocialCrud.create(data);
        account.then(function (newAccount) {
          if (newAccount && newAccount._id) {

            //find out if user exists
            findUser = UsersCrud.getUserByEmail(data.email);
            findUser.then(function (user) {
              if (user && user._id) {

                //if user exists add userId to social
                SocialCrud.update(newAccount._id, user._id)
                  .then(function(account) {
                    return cb(null, user);
                  })
              } else {

                //if user doesn't exist create new user
                var user = {
                  emailAddress: data.email,
                  userName: newAccount._id,
                  profilePicture: newAccount.accountData._json.picture.data.url,
                  coverPicture: newAccount.accountData._json.cover.source,
                  social: true
                };
                UsersCrud.create(user)
                  .then(function(user) {
                    return SocialCrud.update(newAccount._id, user._id).then(function() {
                      return user;
                    })
                  })
                  .then(function(user) {
                    return aclRoles.addUserRoles(user._id, ['user-general']).then(function() {
                      return user;
                    })
                  })
                  .then(function(user) {
                    return cb(null, user);
                  })
              }
            });
          }
        });
      }
    });
  })
  );
};