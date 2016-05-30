try {
  var log4js                 = require('log4js');
  var logger                 = log4js.getLogger('app.routes.api.users');
  var acl                    = require('../../utils/acl');
  var jwt                    = require('jsonwebtoken');
  var tokenConfig            = require('../../../config/token');
  var aclRoles               = require('../../utils/acl');
  var usersCrud              = require('../../persistence/crud/users');
  var userParams             = null;
  var nodemailer            = require('nodemailer');
  var tokenData              = null;
var authCrud                 = require('./auth');
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
        .getUserByUserName(req.query.username)
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
        userName                : req.body.username
      };
    });
  } else {
    userParams = {
      emailAddress            : req.body.email,
      userName                : req.body.username,
      password                : req.body.password,
      confirmPassword         : req.body.confirmPassword
    };
  }
  
  return usersCrud
    .create(userParams)
    .then(function(user) {
      aclRoles.addUserRoles(user._id, ['user-general']).then(function() {
      });
      return user;
    })
    .then(function(user) {
      logger.debug(user);
      var token =  jwt.sign({_id: user._id, aclRoles: user.aclRoles}, tokenConfig.secret, { expiresIn: tokenConfig.expires });
      res.json({token: token});
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
  logger.debug(params);
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
    html: '<div>hello</div>'
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
  var email = req.body.email;
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
