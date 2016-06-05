try {
  var log4js                 = require('log4js');
  var logger                 = log4js.getLogger('app.routes.api.users');
  var acl                    = require('../../utils/acl');
  var jwt                    = require('jsonwebtoken');
  var tokenConfig            = require('../../../config/token');
  var aclRoles               = require('../../utils/acl');
  var usersCrud              = require('../../persistence/crud/users');
  var userParams             = null;
  var nodemailer             = require('nodemailer');
  var tokenData              = null;
  var authCrud               = require('./auth');
  var HireMe                 = require('../../utils/emails/hireMe');
}

catch(exception) {
  logger.error(" import error:" + exception);
}

function User() {}

function post(req, res) {
  usersCrud
    .create(req.params)
    .then(function (user) {
      res.send(user);
    });
}

function search(req, res) {
  acl.isAllowed(req.user._id, 'user', 'search')
    .then(function (isAllow) {
      if (!isAllow) {
        res.sendStatus(400);
      }
      return usersCrud
        .getUserByUserNameUrl(req.query.username)
        .then(function (user) {
          res.json(user);
        });
    })
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
	logger.debug(".createUser: BEG");
	
  if (
		(req.body.token)
		&& (req.body.token.length > 0)
	) {
    //decrypt token for use
    jwt.verify(req.body.token, tokenConfig.secret, function(error, data){
      userParams = {
        emailAddress            : data.email,
        socialMediaAccounts     : data.socialMediaAccounts,
        userNameDisplay                : req.body.username
      };
    });
  } else {
    userParams = {
      emailAddress            : req.body.email,
      userNameDisplay                : req.body.username,
      password                : req.body.password,
      confirmPassword         : req.body.confirmPassword
    };
  }

  //create a local login if a social login already exists
  
  return usersCrud
    .create(userParams)
    .then(function(user) {
      logger.debug(user);
      aclRoles.addUserRoles(user._id, ['user-general']).then(function() {
      });
      return user;
    })
    .then(function(user) {
      logger.debug(user);
      var sendData = {};
      var params = req.body;
      logger.debug(params);
      var transport = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user:'support@airvuz.com',
          pass:'b5&YGG6n'
        }
      });

      var mailOptions = {
        from:'Account Confirmation <noreply@airvuz.com>',
        to: user.emailAddress,
        subject: 'Account Confirmation',
        html: '<p>Follow the link below to confirm your account</p><p><a href="' + req.get('host') + '/email-confirmation/' + user._id + '">Confirm Account</a></p>'
      };
      logger.debug(mailOptions.html);
      transport.sendMail(mailOptions, function(error, message) {
        if(error) {
          sendData = {
            statusCode    : 400,
            data          : JSON.stringify(error),
            msg           : JSON.stringify(error)

          }
        } else {
          sendData = {
            statusCode    : 200,
            data          : message,
            msg           : 'Message Sent'
          }
        }
        res.send({email: 'sent'});
      })

    })
    .catch(function(error) {
      res.send(error)
    })
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

function hireMe(req, res) {
  var sendData = {};
  var params = req.body;
  var transport = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user:'support@airvuz.com',
      pass:'b5&YGG6n'
    }
  });
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
  transport.sendMail(mailOptions, function(error, message) {
    if(error) {
      sendData = {
        statusCode    : 400,
        data          : JSON.stringify(error),
        msg           : JSON.stringify(error)

      }
    } else {
      sendData = {
        statusCode    : 200,
        data          : message,
        msg           : 'Message Sent'
      }
    }
    res.send(sendData);
  })
}

function _sendPasswordResetMail(user, host) {
  var transport = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user:'support@airvuz.com',
      pass:'b5&YGG6n'
    }
  });

  var mailOptions = {
    from:'AirVuz<noreply@airvuz.com>',
    to: user.emailAddress,
    subject: 'Password Reset',
    html: '<div><a href="' + host + '/password-reset/' + user.resetPasswordCode + '">Click here to reset password</a></div>'
  };

  return new Promise(function (resolve, reject) {
    transport.sendMail(mailOptions, function(error, message) {
      if(error) {
        return reject(message);
      }
      return resolve(message);
    });
  });
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

User.prototype.hireMe               = hireMe;
User.prototype.search               = search;
User.prototype.get                  = get;
User.prototype.createUser           = createUser;
User.prototype.put                  = put;
User.prototype.passwordResetRequest = passwordResetRequest;
User.prototype.passwordResetChange  = passwordResetChange;

module.exports = new User();
