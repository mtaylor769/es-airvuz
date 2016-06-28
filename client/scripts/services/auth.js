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
    success : function(token) {
      identity.setToken(token).then(function () {
        dfd.resolve();
      });
    },
    error: function (err) {
      if (err.status === 400) {
        return dfd.reject(err.responseText);
      }
      dfd.reject('Error trying to login');
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