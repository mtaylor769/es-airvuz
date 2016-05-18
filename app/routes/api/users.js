
var acl                    = require('../../utils/acl');
var jwt                    = require('jsonwebtoken');
var log4js                 = require('log4js');
var logger                 = log4js.getLogger('app.routes.api.users');
var tokenConfig            = require('../../../config/token');
var tokenData              = null;
var usersCrud              = require('../../persistence/crud/users');
var userParams             = null;

function User() {

}

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
      password                : req.body.password
    };
  }
  
  return usersCrud
    .create(userParams)
    .then(function(user){
      res.redirect('/login');
    });
}

function put(req, res) {
  console.log('hit this');
  var updateObject  = req.body;
  var userId        = req.params.id;
  var data          = {};
  usersCrud.update(userId, updateObject)
  .then(function(user) {
    data.status       = 'OK';
    data.statusCode   = 200;
    data.data         = user;
  })
  .catch(function(error) {
    data.status       = 'Fail';
    data.statusCode   = 500;
    data.data         = error;
  });
  res.send(data);

}

User.prototype.post         = post;
User.prototype.search       = search;
User.prototype.get          = get;
User.prototype.createUser   = createUser;
User.prototype.put          = put;

module.exports = new User();
