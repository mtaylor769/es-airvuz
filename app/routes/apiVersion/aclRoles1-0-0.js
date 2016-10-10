var namespace = 'app.routes.apiVersion.aclRoles1-0-0';

try {
    var log4js              = require('log4js');
    var logger              = log4js.getLogger(namespace);
    var Promise             = require('bluebird');
    var usersCrud1_0_0      = require('../../persistence/crud/users1-0-0');
    var aclCrud             = require('../../persistence/crud/aclRoles');
}
catch(exception) {
    logger.error(" import error:" + exception);
}

function AclRoles() {}
/**
 * route: PUT /api/aclRoles/:id
 * @param req
 * @param res
 * @returns {*}
 */
function addAclRoleToUser (req, res) {
    var userId = req.params.id;
    var role = req.body.role;
    return usersCrud1_0_0.addAclRole(userId, role)
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
}
/**
 * route: POST /api/aclRoles/:id
 * @param req
 * @param res
 * @returns {*}
 */
function removeAclRoleFromUser (req, res) {
    var userId = req.params.id;
    var role = req.body.role;
    return usersCrud1_0_0.removeAclRole(userId, role)
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
}
/**
 * route: GET /api/aclRoles/:id
 * @param req
 * @param res
 * @returns {*}
 */
function getUserRoles (req, res) {
  var userId = req.params.id;
    return usersCrud1_0_0.getUserById(userId)
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
}

AclRoles.prototype.addAclRoleToUser = addAclRoleToUser;
AclRoles.prototype.removeAclRoleFromUser = removeAclRoleFromUser;
AclRoles.prototype.getUserRoles = getUserRoles;


module.exports = new AclRoles();