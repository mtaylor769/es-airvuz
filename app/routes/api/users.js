var usersCrud              = require('../../persistence/crud/users');
var acl                    = require('../../utils/acl');
var log4js                 = require('log4js');
var logger                 = log4js.getLogger('app.routes.api.users');

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

User.prototype.post = post;
User.prototype.search = search;

module.exports = new User();
