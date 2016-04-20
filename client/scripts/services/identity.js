var jwtDecode = require('jwt-decode');

var user = {},
  token = localStorage.getItem('id_token');

if (token) {
  user = jwtDecode(token);
}

function isAuthenticated() {
  return !!token;
}

function hasRole(role) {
  return !!token && this.aclRoles.indexOf(role) > -1;
}

/////////////////////////////////////////////

user.isAuthenticated = isAuthenticated;
user.hasRole = hasRole;

module.exports = user;