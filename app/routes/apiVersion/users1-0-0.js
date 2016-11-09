var namespace = 'app.routes.apiVersion.users1-0-0';

try {
    var nodemailer                  = require('nodemailer');
    var _                           = require('lodash');
    var log4js                      = require('log4js');
    var Promise                     = require('bluebird');
    var logger                      = log4js.getLogger(namespace);
    var viewManager                 = require('../../views/manager/viewManager');
    var confirmationView            = require('../../views/view/confirmationView');

    var aclUtil                     = require('../../utils/acl');
    var usersCrud1_0_0              = require('../../persistence/crud/users1-0-0');
    var videoCrud1_0_0              = require('../../persistence/crud/videos1-0-0');
    var socialCrud                  = require('../../persistence/crud/socialMediaAccount');
    var videoCollCrud1_0_0          = require('../../persistence/crud/videoCollection1-0-0');
    var followCrud1_0_0             = require('../../persistence/crud/follow1-0-0');
    var commentCrud1_0_0            = require('../../persistence/crud/comment1-0-0');
    var notificationCrud1_0_0       = require('../../persistence/crud/notifications1-0-0');
    var videoLikeCrud1_0_0          = require('../../persistence/crud/videoLike1-0-0');
    var videoViewCrud               = require('../../persistence/crud/videoViews');

    // add dust template
    viewManager.addView({view: confirmationView});

    if (global.NODE_ENV === "production") {
        logger.setLevel("INFO");
    }


} catch(exception) {
    logger.error(" import error:" + exception);
}

function User() {}

/**
 * route: GET /api/users/search/?username=userNameDisplay
 * @param req
 * @param res
 * @returns
 * {
    "_id": "57f3eff096190c114272aa8a",
    "coverPicture": "https://scontent.xx.fbcdn.net/v/t1.0-0/p180x540/13529096_10154283959321660_1226387418316521094_n.jpg?oh=13105693a82e18a16b2a0268b4d4597c&oe=587A083B",
    "emailAddress": "bluemagma@gmail.com",
    "userNameDisplay": "bluemagma-at-gmail",
    "profilePicture": "",
    "userNameUrl": "bluemagma-at-gmail",
    "version": "2.0.0",
    "socialMediaLinks": [
        {
            "url": "",
            "socialType": "FACEBOOK",
            "_id": "57f5479efce8b505442e2aae"
        },
        {
            "url": "",
            "socialType": "GOOGLE+",
            "_id": "57f5479efce8b505442e2aad"
        },
        {
            "url": "",
            "socialType": "INSTAGRAM",
            "_id": "57f5479efce8b505442e2aac"
        },
        {
            "url": "",
            "socialType": "TWITTER",
            "_id": "57f5479efce8b505442e2aab"
        }
    ],
    "lastLoginDate": "2016-10-04T18:07:44.528Z",
    "isSubscribeAirVuzNews": false,
    "status": "active",
    "autoPlay": true,
    "accountCreatedDate": "2016-10-04T18:07:44.528Z",
    "allowHire": false,
    "allowDonation": false,
    "aclRoles": [
        "user-general"
    ],
    "__v": 0,
    "aboutMe": "",
    "lastName": "",
    "firstName": "Bryce",
    "resetPasswordCode": "2e83a91062ff132f63a8"
}
 */
function search(req, res) {
    // aclUtil.isAllowed(req.user._id, 'user', 'search')
    //   .then(function (isAllow) {
    //     if (!isAllow) {
    //       return res.sendStatus(403);
    //     }
    return usersCrud1_0_0
        .getUserByUserNameUrl(req.query.username)
        .then(function (user) {
            res.json(user);
        })
        // })
        .catch(logger.error);
}
/**
 * route: PROTECTED GET /api/users/search
 * @param req
 * @param res
 * @returns {*}
 */
function get(req, res) {
    return usersCrud1_0_0
        .getUserById(req.params.id)
        .then(function (user) {
            res.json(user);
        });
}
/**
 * route: POST /api/users/create
 * @param req
 * @param res
 * @returns {*}
 */
function createUser(req, res) {
    var userParams = {
        emailAddress            : req.body.email.toLowerCase().trim(),
        userNameDisplay         : req.body.userNameDisplay.trim(),
        password                : req.body.password,
        confirmPassword         : req.body.confirmPassword,
        isSubscribeAirVuzNews   : req.body.isSubscribeAirVuzNews
    };

    return usersCrud1_0_0
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
                html: '<p>Follow the link below to confirm your account</p><p><a href="' + req.protocol + '://' + req.get('host') + '/email-confirmation/' + user._id + '">Confirm Account</a></p>'
                + '<p>If the link is not working please copy and paste to the url : ' + req.protocol + '://' + req.get('host') + '/email-confirmation/' + user._id + '<p>'
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
/**
 * route: PROTECTED PUT /api/users/:id
 * @param req
 * @param res
 */
function put(req, res) {
    var updateObject  = req.body;
    var userId        = req.params.id;
    var data          = {};
    usersCrud1_0_0.update(userId, updateObject)
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
/**
 * route: POST /api/users/hireme
 * @param req
 * @param res
 */
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
/**
 * route: POST /api/users/password-reset
 * @param req
 * @param res
 */
function passwordResetRequest(req, res) {
    var email = req.body.email.toLowerCase().trim();
    usersCrud1_0_0
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
/**
 * route: PUT /api/users/password-reset
 * @param req
 * @param res
 */
function passwordResetChange(req, res) {
    var code      = req.body.code,
        password  = req.body.password;

    usersCrud1_0_0
        .resetPasswordChange(code, password)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function () {
            res.sendStatus(500);
        });
}
/**
 * route: PROTECTED DELETE /api/users/:id
 * @param req
 * @param res
 */
function deleteUser(req, res) {
    logger.debug('***** delete function in ********');
    var roles = req.user.aclRoles;
    logger.debug(roles);
    var userId = req.params.id;
    var rootCheck = roles.indexOf('root');
    var userRootCheck = roles.indexOf('user-root');
    //find user
    if(rootCheck > -1 || userRootCheck > -1) {
        usersCrud1_0_0.findById(userId)
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
                    return commentCrud1_0_0
                        .getByVideoId(video._id)
                        .then(function(comments) {
                            //map video comments
                            return Promise.map(comments, function(comment) {
                                //delete video comments
                                return commentCrud1_0_0.remove(comment._id);
                            })
                        }).then(function() {
                            //delete video
                            return videoCrud.remove(video._id);
                        });
                });
            })
            .then(function() {
                //find comments
                return commentCrud1_0_0.findByUserId(userId);
            })
            .then(function(comments) {
                //map comments
                return Promise.map(comments, function(comment) {
                    //delete comments
                    return commentCrud1_0_0.remove(comment._id);
                })
            })
            // .then(function() {
            //   return followCrud1_0_0.findByFollowingUserIdAndUserId(userId);
            // })
            // .then(function(follows) {
            //   return Promise.map(follows, function(follow) {
            //     return followCrud1_0_0.delete(follow._id);
            //   })
            // })
            // .then(function() {
            //   return notificationCrud1_0_0.findByNotifiedUserIdAndActionUserId(userId);
            // })
            // .then(function(notifications) {
            //   return Promise.map(notifications, function(notification) {
            //     return notificationCrud1_0_0.delete(notification._id);
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
            //   return videoLikeCrud1_0_0.findByUserId(userId);
            // })
            // .then(function(likes) {
            //   //remove likes
            //   return Promise.map(likes, function(like) {
            //     return videoLikeCrud1_0_0.delete(like._id);
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
                return usersCrud1_0_0.remove(userId);
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
/**
 * route: PROTECTED PUT /api/users/:id
 * @param req
 * @param res
 */
function statusChange(req, res) {
    aclUtil.isAllowed(req.user._id, 'user', 'update-status')
        .then(function (isAllow) {
            if (!isAllow) {
                throw 'you are not allowed to update a users status';
            }
            return usersCrud1_0_0
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
/**
 * route: POST /api/users/contact-us
 * @param req
 * @param res
 * @returns {*}
 */
function contactUs(req, res) {
    var userId = req.body.contactingUser;
    var message = req.body.contactUsMessage;
    var userInfo;

    return usersCrud1_0_0.findById(userId)
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
/**
 * route: POST /api/users/resend-confirmation
 * @param req
 * @param res
 */
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

function addAclRole(req, res) {

}

User.prototype.hireMe                   = hireMe;
User.prototype.search                   = search;
User.prototype.get                      = get;
User.prototype.createUser               = createUser;
User.prototype.put                      = put;
User.prototype.delete                   = deleteUser;
User.prototype.passwordResetRequest     = passwordResetRequest;
User.prototype.passwordResetChange      = passwordResetChange;
User.prototype.statusChange             = statusChange;
User.prototype.contactUs                = contactUs;
User.prototype.resendConfirmation       = resendConfirmation;
User.prototype.addAclRole               = addAclRole;

module.exports = new User();
