var identity = require('./identity');

var auth = {};

/**
 * Authenticate user
 * @param {Object} user
 * @param {string} user.emailAddress
 * @param {string} user.password
 *
 * @returns {Promise}
 */
function login(user) {
  var dfd = $.Deferred();

  $.ajax({
    type: 'POST',
    url: '/api/auth',
    data : {
      emailAddress    : user.emailAddress,
      password        : user.password
    },
    success : function(response) {
      identity.setToken(response.token).then(function () {
        dfd.resolve();
      });
    },
    error: function (err) {
      dfd.reject(err);
    }
  });

  return dfd.promise();
}

function signupLogin(token) {
  return identity.setToken(token);
}

function logout() {
  identity.clear();

  return $.when();
}

/////////////////////////////////////////////

auth.login = login;
auth.logout = logout;
auth.signupLogin = signupLogin;

module.exports = auth;