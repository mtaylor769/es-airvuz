var auth      = require('./services/auth');
var identity  = require('./services/identity');

/**
 * Templates
 */
var headerProfileTpl = require('../templates/core/header-profile.dust');

var $loginModal,
    $headerProfile;

function renderProfileHeader() {
  headerProfileTpl(identity, function (err, html) {
    $headerProfile.html(html);
  });
}

function bindEvents() {
  var $header = $('#header');

  $headerProfile = $('#profile-header');
  $loginModal = $('#login-modal');

  $loginModal.on('hidden.bs.modal', function () {
    // reset tab to login
    $loginModal.find('#login-anchor-tab').click();
  });

  $loginModal.find('a[data-toggle="tab"]').on('shown.bs.tab', function (event) {
    var target = $(event.target).attr('href'),
        title = 'Login';

    switch(target) {
      case '#signup-tab':
        title = 'Sign up';
        break;
      case '#forgot-password-tab':
        title = 'Forgot password';
        break;
    }

    $loginModal.find('.modal-title').text(title);
  });

  $loginModal.on('click', '#login-btn', function () {
    var emailAddress = $loginModal.find('.email-input:visible').val();
    var password = $loginModal.find('.password-input:visible').val();

    auth.login({emailAddress: emailAddress, password: password})
      .done(function () {
        renderProfileHeader();
        $loginModal.modal('hide');
      })
      .fail(function (err) {
        $loginModal.find('.error-message').text('Wrong email or password').delay(5000).slideUp(300);
      })
  });

  $header.on('click', '.av-search a', function (event) {
    event.preventDefault();
    $header.find('#search-input').focus();
  });

  $header.find('#search-input').on('keyup', function (event) {
    if (event.keyCode === 13) {
      window.location.href = '/search?q=' + $(this).val();
    }
  });
}

function initialize() {
  bindEvents();

  if (identity.isAuthenticated()) {
    renderProfileHeader();
  }
}

//////////////////////

var APP = {
  initialize: initialize
};

$(function () {
  APP.initialize();
});

module.exports = APP;