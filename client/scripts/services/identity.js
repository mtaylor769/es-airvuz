var jwtDecode = require('jwt-decode');

var user    = {},
  token     = localStorage.getItem('id_token'),
  userInfo;

// determine if there is current user login when load
if (token) {
  var tmpUser = jwtDecode(token);

  // check if token is expired
  if (Math.floor(Date.now() / 1000) >= tmpUser.exp) {
    localStorage.removeItem('id_token');
    localStorage.removeItem('user_info');
    token = null;
  } else {
    user = tmpUser;
    userInfo = localStorage.getItem('user_info');

    if (userInfo) {
      user.currentUser = JSON.parse(userInfo);
    } else {
      getUserInfo();
    }
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

  return getUserInfo();
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

/**
 * update currentUser info in local storage
 */
function save() {
  localStorage.setItem('user_info', JSON.stringify(user.currentUser));
}

function getUserInfo() {
  return $.ajax({
    url: '/api/users/' + user._id,
    contentType : 'application/json',
    type: 'GET'
  }).done(function (currentUser) {
    localStorage.setItem('user_info', JSON.stringify(currentUser));
    user.currentUser = currentUser;
  });
}

function getAclRoles() {
  var token = localStorage.getItem('id_token');
  var user = jwtDecode(token);
  var aclRoles = user.aclRoles;
  return aclRoles;
}

/////////////////////////////////////////////

user.isAuthenticated = isAuthenticated;
user.hasRole = hasRole;
user.setToken = setToken;
user.clear = clear;
user.save = save;
user.getUserInfo = getUserInfo;
user.getAclRoles = getAclRoles;

module.exports = user;