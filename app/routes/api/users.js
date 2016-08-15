try {
  var log4js                 = require('log4js');
  var Promise                = require('bluebird');
  var logger                 = log4js.getLogger('app.routes.api.users');
  var aclUtil                = require('../../utils/acl');
  var usersCrud              = require('../../persistence/crud/users');
  var videoCrud              = require('../../persistence/crud/videos');
  var socialCrud             = require('../../persistence/crud/socialMediaAccount');
  var videoCollectionCrud    = require('../../persistence/crud/videoCollection');
  var followCrud             = require('../../persistence/crud/follow');
  var commentCrud            = require('../../persistence/crud/comment');
  var notificationCrud       = require('../../persistence/crud/notifications');
  var likeCrud               = require('../../persistence/crud/videoLike');
  var videoViewCrud          = require('../../persistence/crud/videoViews');
  var nodemailer             = require('nodemailer');
  var _                      = require('lodash');
  var viewManager			 = require('../../views/manager/viewManager');
  var confirmationView		 = require('../../views/view/confirmationView');

  // add dust template
  viewManager.addView({	view : confirmationView });
} catch(exception) {
  logger.error(" import error:" + exception);
}

function User() {}

function search(req, res) {
  // aclUtil.isAllowed(req.user._id, 'user', 'search')
  //   .then(function (isAllow) {
  //     if (!isAllow) {
  //       return res.sendStatus(403);
  //     }
    return usersCrud
      .getUserByUserNameUrl(req.query.username)
      .then(function (user) {
        res.json(user);
      })
    // })
    .catch(logger.error);
}

function get(req, res) {
  return usersCrud
    .getUserById(req.params.id)
    .then(function (user) {
      res.json(user);
    });
}

function createUser(req, res) {
  var userParams = {
    emailAddress            : req.body.email.toLowerCase(),
    userNameDisplay         : req.body.userNameDisplay,
    password                : req.body.password,
    confirmPassword         : req.body.confirmPassword,
    isSubscribeAirVuzNews   : req.body.isSubscribeAirVuzNews
  };

  return usersCrud
    .create(userParams)
    .then(function(user) {
      return aclUtil.addUserRoles(user._id, ['user-general']).then(function() {
        return user;
      });
    })
    .then(function(user) {
      var mailOptions = {
        to: user.emailAddress,
        subject: 'Account Confirmation',
        html: '<p>Follow the link below to confirm your account</p><p><a href="' + req.get('host') + '/email-confirmation/' + user._id + '">Confirm Account</a></p>'
        + '<p>If the link is not working please copy and paste to the url : '+ req.get('host') + '/email-confirmation/' + user._id + '<p>'
      };

      return _sendMail(mailOptions);
    })
    .then(function () {
      res.sendStatus(200);
    })
    .catch(function(error) {
      if(error.length){
        return res.status(400).json(error);
      }
      return res.sendStatus(500);
    });
}

function put(req, res) {
  var updateObject  = req.body;
  var userId        = req.params.id;
  var data          = {};
  usersCrud.update(userId, updateObject)
  .then(function(user) {
    data.status       = 'OK';
    data.statusCode   = 200;
    data.data         = user;
    res.send(data);
  })
  .catch(function(error) {
    data.status       = 'Fail';
    data.statusCode   = 500;
    data.data         = error;
    res.send(data);
  });
}

// TODO: move html to a template
function hireMe(req, res) {
  var params = req.body;
  var mailOptions = {
    from:'AirVuz Hire Request <noreply@airvuz.com>',
    to: params.profileUser.emailAddress,
    subject: 'Request for hire',
    html: '<div>Hello ' + '</div><br><br><div style="line-height: normal;color: #000000;font-size: 14px;font-family: Calibri, sans-serif;">Great news!&nbsp; Someone from the&nbsp;<span style="color: #66B6E0;"><strong>AirVūz</strong></span>&nbsp;community is interested in hiring you for some drone / aerial photography related assignments! &nbsp;</div><div style="line-height: normal;color: #000000;font-size: 14px;font-family: Calibri, sans-serif;">Below, you\'ll find all of the information you\'ll need to contact this person and put your&nbsp;<strong><span style="color: #66B6E0;">AirVūz</span>&nbsp;</strong>connection to work!&nbsp; To ensure a positive experience for everyone, we recommend that you follow up within 24 hours at least to confirm you received their message.&nbsp; After that, you can work out the remaining logistics about the inquiry (and once it’s all said and done, we’d even love it if you shared it back with us on one of your profiles, so we can see the fruits of your labor!)</div>' +
    '<div style="font-size: 12.8px;line-height: normal;color: #000000;font-family: Calibri;"><div style="font-family: Calibri, sans-serif; font-size: 14px;"> <div>The<font color="#66b6e0">&nbsp;</font><span style="color: #66B6E0;"><strong>AirVūz</strong></span><font color="#66b6e0">&nbsp;</font>Team </div> <div>&nbsp;</div> <div>&nbsp;</div> </div> <div style="font-family: Calibri, sans-serif; font-size: 14px;"><span class="im" style="color: #500050;"><font face="arial,sans-serif"><span style="border-collapse:collapse; font-size:13px">The View from Up Here</span></font></span><br><font style="color: #66B6E0;"><strong>AirVuz</strong></font><span style="color: #66B6E0;"><strong>.com</strong>&nbsp;| &nbsp;</span><span style="color: #66B6E0;"><a href="mailto:support@airvuz.com" style="color: #1155CC;" target="_blank">support@airvuz.com</a></span> </div> <div class="yj6qo ajU" style="cursor: pointer; outline: none; padding: 10px 0px; width: 22px;"><div aria-label="Hide expanded content" class="ajR" data-tooltip="Hide expanded content" id=":iw" role="button" style="border: 1px solid #DDDDDD;clear: both;line-height: 6px;outline: none;position: relative;width: 20px;background-color: #F1F1F1;" tabindex="0"><img class="ajT" src="https://ssl.gstatic.com/ui/v1/icons/mail/images/cleardot.gif" style="height: 8px; opacity: 0.3; width: 20px; background: url(&quot;//ssl.gstatic.com/ui/v1/icons/mail/ellipsis.png&quot;) no-repeat;"> </div></div>' +
    '<div class="adL"><div style="font-family: Calibri, sans-serif; font-size: 14px;">&nbsp;<hr align="center" size="&quot;3&quot;" width="&quot;95%&quot;"> </div><div style="font-family: Calibri, sans-serif; font-size: 14px;"><span class="im" style="color: #500050;">"Hire Me" Inquiry Details:</span> </div><div style="font-family: Calibri, sans-serif; font-size: 14px;">&nbsp;</div></div></div>' +
    '<div>Name: ' + params.name +'</div>' +
    '<div>Email: ' +  params.email +'</div>' +
    '<div>message: '+params.message+'</div>' +
    '<span class="im" style="color: #500050;">This message may contain confidential and/or restricted information. If you are not the addressee or authorized to receive this for the addressee, you must not use, copy, disclose, or take any action based on this message or any information herein. This information should only be forwarded or distributed on a "need to know basis”. If you have received this message in error, please advise the sender immediately by reply e-mail and delete this message. Thank you for your cooperation.</span>'
  };

  _sendMail(mailOptions)
    .then(function () {
      res.sendStatus(200);
    })
    .catch(function () {
      res.sendStatus(500);
    });
}

// TODO: extract out as a service or util
/**
 * send email
 * - NOTE: if password is change this will break all email using _sendMail
 * @param {Object} options
 * @returns {Promise}
 * @private
 */
function _sendMail(options) {
  var transport = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user:'support@airvuz.com',
      pass:'b5&YGG6n'
    }
  });

  var defaultOptions = {
    from : 'AirVuz <noreply@airvuz.com>'
    // to
    // subject
    // html
  };

  return new Promise(function (resolve, reject) {
    transport.sendMail(_.extend({}, defaultOptions, options), function(error, message) {
      if(error) {
        return reject(message);
      }
      return resolve(message);
    });
  });
}

function _sendPasswordResetMail(user, host) {
  var mailOptions = {
    to: user.emailAddress,
    subject: 'Password Reset',
    html: '<div><a href="' + host + '/password-reset/' + user.resetPasswordCode + '">Click here to reset password</a></div>'+
    '<p>If the link is not working please copy and paste to the url : ' + host + '/password-reset/' + user.resetPasswordCode + '<p>'
  };

  return _sendMail(mailOptions);
}

function passwordResetRequest(req, res) {
  var email = req.body.email.toLowerCase();
  usersCrud
    .resetPasswordRequest(email)
    .then(function (user) {
      return _sendPasswordResetMail(user, req.get('host'));
    })
    .then(function () {
      res.sendStatus(200);
    })
    .catch(function () {
      res.sendStatus(500);
    });
}

function passwordResetChange(req, res) {
  var code      = req.body.code,
      password  = req.body.password;
  
  usersCrud
    .resetPasswordChange(code, password)
    .then(function () {
      res.sendStatus(200);
    })
    .catch(function () {
      res.sendStatus(500);
    });
}

function deleteUser(req, res) {
  logger.debug('***** delete function in ********');
  var roles = req.user.aclRoles;
  logger.debug(roles);
  var userId = req.params.id;
  var rootCheck = roles.indexOf('root');
  var userRootCheck = roles.indexOf('user-root');
  //find user
  if(rootCheck > -1 || userRootCheck > -1) {
    usersCrud.findById(userId)
      .then(function(user) {
        var deletedRootCheck = user.aclRoles.indexOf('root');
        var deletedUserRootCheck = user.aclRoles.indexOf('user-root');
        if(rootCheck > -1 || (deletedRootCheck === -1 && deletedUserRootCheck === -1)) {
          logger.error('made it into delete');
          //find user social accounts
          return socialCrud.findAllSocialById(user._id);
        } else {
          throw "can't remove root or root-user";
        }
      })
      .then(function(socialAccounts) {
        //map user social accounts
        logger.debug(socialAccounts);
        return Promise.map(socialAccounts, function (socialAccount) {
          //remove user social accounts
          return socialCrud.remove(socialAccount._id);
        });
      })
      .then(function() {
        //find user videos
        return videoCrud.findByUserId(userId);
      })
      .then(function(videos) {
        //map videos
        return Promise.map(videos, function(video) {
          //find video comments
          return commentCrud
            .getByVideoId(video._id)
            .then(function(comments) {
              //map video comments
              return Promise.map(comments, function(comment) {
                //delete video comments
                return commentCrud.remove(comment._id);
              })
            }).then(function() {
              //delete video
              return videoCrud.remove(video._id);
            });
        });
      })
      .then(function() {
        //find comments
        return commentCrud.findByUserId(userId);
      })
      .then(function(comments) {
        //map comments
        return Promise.map(comments, function(comment) {
          //delete comments
          return commentCrud.remove(comment._id);
        })
      })
      // .then(function() {
      //   return followCrud.findByFollowingUserIdAndUserId(userId);
      // })
      // .then(function(follows) {
      //   return Promise.map(follows, function(follow) {
      //     return followCrud.delete(follow._id);
      //   })
      // })
      // .then(function() {
      //   return notificationCrud.findByNotifiedUserIdAndActionUserId(userId);
      // })
      // .then(function(notifications) {
      //   return Promise.map(notifications, function(notification) {
      //     return notificationCrud.delete(notification._id);
      //   })
      // })
      // .then(function() {
      //   return videoCollectionCrud.findByUserId(userId);
      // })
      // .then(function(videoCollections) {
      //   return Promise.map(videoCollections, function(videoCollection) {
      //     return videoCollectionCrud.delete(videoCollection._id);
      //   })
      // })
      // .then(function() {
      //   //find likes
      //   return likeCrud.findByUserId(userId);
      // })
      // .then(function(likes) {
      //   //remove likes
      //   return Promise.map(likes, function(like) {
      //     return likeCrud.delete(like._id);
      //   })
      // })
      // .then(function() {
      //   //find videoView
      //   return videoViewCrud.findByUserId(userId);
      // })
      // .then(function(videoViews) {
      //   //remove videoView
      //   return Promise.map(videoViews, function(videoView) {
      //     return videoViewCrud.delete(videoView._id)
      //   })
      // })
      .then(function() {
        return usersCrud.remove(userId);
      })
      .then(function() {
        res.sendStatus(200);
      })
      .catch(function(error) {
        if (typeof error === 'string') {
          return res.sendStatus(401);
        }
        logger.debug(error);
        res.sendStatus(500);
      })
  } else {
    res.sendStatus(401);
  }

}

function statusChange(req, res) {
  aclUtil.isAllowed(req.user._id, 'user', 'update-status')
    .then(function (isAllow) {
      if (!isAllow) {
        throw 'you are not allow to update user status';
      }
      return usersCrud
        .updateStatus(req.params.id, req.body.status);
    })
    .then(function () {
      res.sendStatus(200);
    })
    .catch(function (error) {
      if (typeof error === 'string') {
        res.status(401).send(error);
      }
      res.sendStatus(500);
    });
}

function contactUs(req, res) {
  var userId = req.body.contactingUser;
  var message = req.body.contactUsMessage;
  var userInfo;

  return usersCrud.findById(userId)
      .then(function(user) {
        userInfo = user;
        return socialCrud.findAllSocialById(user._id)
      })
      .then(function(socialAccounts) {
        var socialHtml = '';
        if(socialAccounts.length > 0) {
          socialAccounts.forEach(function(socialAccount) {
            socialHtml += '<li>' + socialAccount.provider + '</li>';
          });
        }

        var transport = nodemailer.createTransport({
          service: "Gmail",
          auth: {
            user:'support@airvuz.com',
            pass:'b5&YGG6n'
          }
        });

        // TODO: make domain dynamic
        var mailOptions = {
          from:'noreply <noreply@airvuz.com>',
          to: 'support@airvuz.com',
          subject: 'Contact Us',
          html: '<div>'+
          '<h4>Someone has sent a request for information</h4>'+
          '<ul style="list-style: none">'+
          '<li>email : ' + userInfo.emailAddress + '</li>'+
          '<li>username : ' + userInfo.userNameDisplay + '</li>'+
          '<li>Social Accounts : '+
          '<ul>' + socialHtml + '</ul>'+
          '</li>'+
          '<li>Message from User : ' + message + '</li>'+
          '</ul>'+
          '</div>'
      };

        transport.sendMail(mailOptions, function(error, message) {
          if(error) {
            res.sendStatus(400);
          } else {
            res.sendStatus(200);
          }
        })
      })
}

function resendConfirmation(req, res) {
  var confirmMailOptions = {
    to: req.body.emailAddress,
    subject: 'Account Confirmation'
  };

  viewManager
      .getView({
        viewName: confirmationView.getViewName(),
        request: req,
        response: res
      })
      .then(function (resp) {
        confirmMailOptions.html = resp;
        return _sendMail(confirmMailOptions);
      })
      .then(function () {
        res.sendStatus(200);
      })
      .catch(function (error) {
        if (error.length) {
          return res.status(400).send(error);
        }
        return res.sendStatus(500);
      });
}

User.prototype.hireMe               = hireMe;
User.prototype.search               = search;
User.prototype.get                  = get;
User.prototype.createUser           = createUser;
User.prototype.put                  = put;
User.prototype.delete               = deleteUser;
User.prototype.passwordResetRequest = passwordResetRequest;
User.prototype.passwordResetChange  = passwordResetChange;
User.prototype.statusChange         = statusChange;
User.prototype.contactUs            = contactUs;
User.prototype.resendConfirmation   = resendConfirmation;

module.exports = new User();
