var Promise     = require('bluebird');
var usersCrud    = require('../../persistence/crud/users1-0-0');
var aclCrud     = require('../../persistence/crud/aclRoles');



var aclRoles = function(){};

aclRoles.prototype.addAclRoleToUser = function(req, res) {
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
};

aclRoles.prototype.removeAclRoleFromUser = function(req, res) {
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
};

aclRoles.prototype.getUserRoles = function(req, res) {
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
};


module.exports = new aclRoles();