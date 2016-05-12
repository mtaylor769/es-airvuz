var jwtDecode = require('jwt-decode');

var user    = {},
  token     = localStorage.getItem('id_token'),
  userInfo  = localStorage.getItem('user_info');

// determine if there is current user login when load
if (token) {
  user = jwtDecode(token);

  if (userInfo) {
    user.currentUser = JSON.parse(userInfo);
  } else {
    getUserInfo();
  }
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
  localStorage.removeItem('user_info');
  token = null;
  userInfo = null;
}

function getUserInfo() {
  $.ajax({
    url: '/api/users/' + user._id,
    contentType : 'application/json',
    type: 'GET'
  }).done(function (user) {
    localStorage.setItem('user_info', JSON.stringify(user));
    user.currentUser = user;
  });
}

/////////////////////////////////////////////

user.isAuthenticated = isAuthenticated;
user.hasRole = hasRole;
user.setToken = setToken;
user.clear = clear;

module.exports = user;