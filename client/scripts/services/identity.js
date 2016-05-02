var jwtDecode = require('jwt-decode');

var user = {},
  token = localStorage.getItem('id_token');

// determine if there is current user login when load
if (token) {
  user = jwtDecode(token);
}

/**
 * check if user is login
 * @returns {boolean}
 */
function isAuthenticated() {
  return !!token;
}

/**
 * check if user has role
 * @param role
 * @returns {boolean}
 */
function hasRole(role) {
  return !!token && this.aclRoles.indexOf(role) > -1;
}

/**
 * change identity
 * @param newToken
 */
function setToken(newToken) {
  var newUser;
  token = newToken;

  newUser = jwtDecode(token);

  $.extend(user, newUser);

  localStorage.setItem('id_token', token);
}

/**
 * reset identiy
 */
function clear() {
  localStorage.removeItem('id_token');
  token = null;
}

/////////////////////////////////////////////

user.isAuthenticated = isAuthenticated;
user.hasRole = hasRole;
user.setToken = setToken;
user.clear = clear;

module.exports = user;