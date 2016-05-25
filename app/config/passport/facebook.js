"use strict";

var FacebookStrategy    = require('passport-facebook').Strategy;
var log4js              = require('log4js');
var logger              = log4js.getLogger('app.config.passport.facebook');
var UsersCrud           = require('../../persistence/crud/users');
var SocialCrud          = require('../../persistence/crud/socialMediaAccount');
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
		profileFields: ['email', 'first_name', 'last_name', 'gender', 'link', 'locale', 'timezone', 'updated_time', 'verified']
  }, function (req, accessToken, refreshToken, profile, cb) {
		logger.debug('PASSPORT: Hitting facebook passport strategy ********************************************');
    var data = {
      provider          : profile.provider,
      accountData       : profile,
      accountId         : profile.id,
      email             : profile.emails[0].value
    };

    logger.debug("data.profile : " + JSON.stringify(profile, null, 2));
    socialAccount = SocialCrud.findAccountByIdandProvider(data.accountId, data.provider);
    socialAccount.then(function(account){
      if (account) {
        findUser = UsersCrud.getUserByEmail(data.email);
        findUser.then(function (user) {
          if (user && user._id) {
            account.userId = user._id;
            account.save()
              .then(function(account) {
                return cb(null, user);
              })
          }
        });
          //   } else {
          //
          //     findUser = UsersCrud.getUserBySocialId(account._id);
          //     findUser.then(function(user){
          //       if (user && user._id) {
          //
          //         return cb(null, user);
          //       } else {
          //         user = {
          //           email               : data.email,
          //           firstName           : data.accountData.name.givenName,
          //           lastName            : data.accountData.name.familyName,
          //           socialMediaAccounts  : account._id,
          //           provider            : data.provider
          //         };
          //         req.newUser = true;
          //         return cb(null, user);
          //       }
          //     });
          //   }
          // });
        } else {
          // SocialMediaAccount does NOT exist
          account = SocialCrud.create(data);
          account.then(function (newAccount) {
            if (newAccount && newAccount._id) {
              findUser = UsersCrud.getUserByEmail(data.email);
              findUser.then(function (user) {
                if (user && user._id) {
                  account.userId = user._id;
                  account.save()
                    .then(function(account) {
                      return cb(null, user);
                    })
                } else {
                  user = {
                    email: data.email,
                    firstName: data.accountData.name.givenName,
                    lastName: data.accountData.name.familyName,
                    socialMediaAccount: newAccount._id,
                    provider: data.provider
                  };
                  req.newUser = true;
                  return cb(null, user);
                }
              });
            }
          });
        }
      }
      );
  }));
};