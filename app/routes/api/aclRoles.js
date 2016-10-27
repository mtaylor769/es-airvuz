var Promise     = require('bluebird');
var usersCrud    = require('../../persistence/crud/users');
var aclCrud     = require('../../persistence/crud/aclRoles');
var tokenDecode = require('../../middlewares/token');



var aclRoles = function(){};

function aclCheck(user) {
  if(user.indexOf('user-admin') > -1 || user.indexOf('user-root') > -1 || user.indexOf('root') > -1) {
    return Promise.resolve()
  } else {
    throw {error: 500};
  }
}

aclRoles.prototype.addAclRoleToUser = function(req, res) {
    return aclCheck(req.user.aclRoles)
      .then(function() {
        var userId = req.params.id;
        var role = req.body.role;
        return usersCrud.addAclRole(userId, role)
          .then(function(user) {
            var index = user.aclRoles.indexOf('root');
            if(index > -1) {
              user.aclRoles.splice(index, 1);
            }
            res.send(user.aclRoles);
          })
          .catch(function(error) {
            res.sendStatus(500);
          })
      });
};

aclRoles.prototype.removeAclRoleFromUser = function(req, res) {
  return aclCheck(req.user.aclRoles)
    .then(function() {
      var userId = req.params.id;
      var role = req.body.role;
      return usersCrud.removeAclRole(userId, role)
        .then(function(user) {
          var index = user.aclRoles.indexOf('root');
          if(index > -1) {
            user.aclRoles.splice(index, 1);
          }
          res.send(user.aclRoles)
        })
        .catch(function(error) {
          res.sendStatus(500)
        })
    });
};

aclRoles.prototype.getUserRoles = function(req, res) {
  return aclCheck(req.user.aclRoles)
    .then(function() {
      var userId = req.params.id;
      return usersCrud.getUserById(userId)
        .then(function(user) {
          var index = user.aclRoles.indexOf('root');
          if(index > -1) {
            user.aclRoles.splice(index, 1);
          }
          res.send(user)
        })
        .catch(function(error) {
          res.sendStatus(500);
        })
    });
};


module.exports = new aclRoles();