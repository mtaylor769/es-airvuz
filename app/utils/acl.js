var acl = require('acl'),
    mongoose = require('mongoose');

/**
 * Adds roles to a given user id.
 * @param userId {String|Number} User id.
 * @param roles {String|Array} Role(s) to add to the user id.
 * @returns {Promise}
 */
function addUserRoles(userId, roles) {
  return this._acl.addUserRoles(userId.toString(), roles);
}

/**
 * Remove roles from a given user.
 * @param userId {String|Number} User id.
 * @param roles {String|Array} Role(s) to remove to the user id.
 * @returns {Promise}
 */
function removeUserRoles(userId, roles) {
  return this._acl.removeUserRoles(userId.toString(), roles);
}

/**
 * Return all the roles from a given user.
 * @param userId {String|Number} User id.
 * @returns {Promise} [roles]
 */
function userRoles(userId) {
  return this._acl.userRoles(userId.toString());
}

/**
 * Return all users who has a given role.
 * @param roleName {String|Number} User id.
 * @returns {Promise} [users]
 */
function roleUsers(roleName) {
  return this._acl.roleUsers(roleName);
}

/**
 * Return boolean whether user has the role
 * @param userId {String|Number} User id.
 * @param roleName {String|Number} role name.
 * @returns {Promise} Boolean
 */
function hasRole(userId, roleName) {
  return this._acl.hasRole(userId.toString(), roleName);
}

/**
 * Adds a parent or parent list to role.
 * @param role {String} Child role.
 * @param parents {String|Array} Parent role(s) to be added.
 * @returns {Promise}
 */
function addRoleParents(role, parents) {
  return this._acl.addRoleParents(role, parents);
}

/**
 * Removes a parent or parent list from role.
 * If parents is not specified, removes all parents.
 * @param role {String} Child role.
 * @param parents {String|Array} Parent role(s) to be removed [optional].
 * @returns {Promise}
 */
function removeRoleParents(role, parents) {
  return this._acl.removeRoleParents(role, parents);
}

/**
 * Removes a role from the system.
 * @param role {String} Role to be removed
 * @returns {Promise}
 */
function removeRole(role) {
  return this._acl.removeRole(role);
}

/**
 * Removes a resource from the system
 * @param resource {String} Resource to be removed
 */
function removeResource(resource) {
  return this._acl.removeResource(resource);
}

/**
 * Adds the given permissions to the given roles over the given resources.
 * @param roles {String|Array} role(s) to add permissions to.
 * @param resources {String|Array} resource(s) to add permisisons to.
 * @param permissions {String|Array} permission(s) to add to the roles over the resources.
 * @returns {Promise}
 */
function allow(roles, resources, permissions) {
  return this._acl.allow(roles, resources, permissions);
}

/**
 * Adds the given permissions to the given roles over the given resources.
 * @param array
 * @returns {Promise}
 */
function allowArray(array) {
  return this._acl.allow(array);
}

/**
 * Remove permissions from the given roles owned by the given role.
 * Note: we loose atomicity when removing empty role_resources.
 * @param role {String}
 * @param resources {String|Array}
 * @param permissions {String|Array}
 * @returns {Promise}
 */
function removeAllow(role, resources, permissions) {
  return this._acl.removeAllow(role, resources, permissions);
}

/**
 * Returns all the allowable permissions a given user have to access the given resources.
 * It returns an array of objects where every object maps a resource name to a list of permissions for that resource.
 * @param userId {String|Number} User id.
 * @param resources {String|Array} resource(s) to ask permissions for.
 * @returns {Promise}
 */
function allowedPermissions(userId, resources) {
  return this._acl.allowedPermissions(userId.toString(), resources);
}

/**
 * Checks if the given user is allowed to access the resource for the given permissions (note: it must fulfill all the permissions).
 * @param userId {String|Number} User id.
 * @param resource {String} resource to ask permissions for.
 * @param permissions {String|Array} asked permissions.
 * @returns {Promise}
 */
function isAllowed(userId, resource, permissions) {
  return this._acl.isAllowed(userId.toString(), resource, permissions);
}

/**
 * Returns true if any of the given roles have the right permissions.
 * @param roles {String|Array} Role(s) to check the permissions for.
 * @param resource {String} resource to ask permissions for.
 * @param permissions {String|Array} asked permissions.
 * @returns {Promise}
 */
function areAnyRolesAllowed(roles, resource, permissions) {
  return this._acl.areAnyRolesAllowed(roles, resource, permissions);
}

/**
 * Returns what resources a given role has permissions over.
 * @param role {String|Array} Roles
 * @returns {Promise}
 *
 * @note
 * library acl allow role and permission as arguments
 */
function whatResources(role) {
  return this._acl.whatResources(role);
}

function init(connection) {
  this._acl = new acl(new acl.mongodbBackend(connection, 'acl_'));
}

function ACL() {
}

ACL.prototype.init = init;
ACL.prototype.addUserRoles = addUserRoles;
ACL.prototype.removeUserRoles = removeUserRoles;
ACL.prototype.userRoles = userRoles;
ACL.prototype.roleUsers = roleUsers;
ACL.prototype.hasRole = hasRole;
ACL.prototype.addRoleParents = addRoleParents;
ACL.prototype.removeRoleParents = removeRoleParents;
ACL.prototype.removeRole = removeRole;
ACL.prototype.removeResource = removeResource;
ACL.prototype.allow = allow;
ACL.prototype.allowArray = allowArray;
ACL.prototype.removeAllow = removeAllow;
ACL.prototype.allowedPermissions = allowedPermissions;
ACL.prototype.isAllowed = isAllowed;
ACL.prototype.areAnyRolesAllowed = areAnyRolesAllowed;
ACL.prototype.whatResources = whatResources;

module.exports = new ACL();