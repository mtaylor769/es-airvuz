"use strict";

var FacebookStrategy    = require('passport-facebook').Strategy;
var log4js              = require('log4js');
var logger              = log4js.getLogger('app.config.passport.facebook');
var UsersCrud           = require('../../persistence/crud/users');
var SocialCrud          = require('../../persistence/crud/socialMediaAccount');
var aclRoles            = require('../../utils/acl');
var socialAccount       = null;
var findUser            = null;
var account             = null;


logger.debug('PASSPORT: In facebook.js ********************************************');



module.exports = function(passport, config) {
	logger.debug('clientID: ' + config.facebook.clientID);
	logger.debug('clientSecret: ' + config.facebook.clientSecret);
	logger.debug('callbackURL: ' + config.facebook.callbackURL);	

  passport.serializeUser(function(user, done) {
    done(null, user);
  });

  passport.deserializeUser(function (id, done) {
    done(null, user);
  });

  passport.use(new FacebookStrategy({
    clientID            : config.facebook.clientID,
    clientSecret        : config.facebook.clientSecret,
    callbackURL         : config.facebook.callbackURL,
    passReqToCallback   : true,
    //profileFields       : ['id', 'email','link', 'locale', 'name', 'updated_time']
		profileFields: ['email', 'first_name', 'last_name', 'gender', 'link', 'locale', 'timezone', 'updated_time', 'verified', 'picture', 'cover']
  }, function (req, accessToken, refreshToken, profile, cb) {
		logger.debug('PASSPORT: Hitting facebook passport strategy ********************************************');
    var data = {
      provider          : profile.provider,
      accountData       : profile,
      accountId         : profile.id,
      email             : profile.emails[0].value
    };

    logger.debug("data.profile : " + JSON.stringify(profile, null, 2));
    
    //try to find social media account
    socialAccount = SocialCrud.findAccountByIdandProvider(data.accountId, data.provider);
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