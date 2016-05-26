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
      return aclRoles.addUserRoles(user._id, ['user-general']);
    })
    .then(function() {
      res.redirect('/');
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

function hireMe(res, req) {
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
    to: params.emailAddress,
    subject: 'Request for hire',
    html: HireMe.hireMeTemplate(params)
  };

  transport.sendMail(mailOptions, function(error, message) {
    if(error) {
      sendData = {
        statusCode    : 400,
        data          : error,
        msg           : error

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

User.prototype.hireMe         = hireMe;
User.prototype.search       = search;
User.prototype.get          = get;
User.prototype.createUser   = createUser;
User.prototype.put          = put;

module.exports = new User();
