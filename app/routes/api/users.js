var usersCrud              = require('../../persistence/crud/users');
var acl                    = require('../../utils/acl');

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
  var AllowRoles = ['root', 'user-admin'],
    canAccess = false;

  acl.userRoles(req.user._id)
    .then(function(userRoles) {
      userRoles.forEach(function (role) {
        // User can access if they have at least one of the roles
        if (AllowRoles.indexOf(role) > -1) {
          canAccess = true;
        }
      });

      if (!canAccess) {
        // User doesn't have access
        return res.sendStatus(403);
      }

      if (req.query.username) {
        return usersCrud
          .getUserByUserName(req.query.username)
          .then(function (user) {
            res.json(user);
          });
      }
      res.sendStatus(400);
    });
}

User.prototype.post = post;
User.prototype.search = search;

module.exports = new User();
