var auth      = require('./services/auth');
var identity  = require('./services/identity');

/**
 * Templates
 */
var headerProfileTpl = require('../templates/core/header-profile.dust');

var $loginModal,
    $headerProfile,
    $footerSub1;

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
  
  $loginModal.on('show.bs.modal', function (event) {
    if ($(event.relatedTarget).data('footer')) {
      $loginModal.find('#signup-anchor-tab').click();
    }
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
        $footerSub1.addClass('is-login');
        $loginModal.modal('hide');
      })
      .fail(function (err) {
        $loginModal.find('.error-message').text('Wrong email or password').delay(5000).slideUp(300);
      })
  });

  $loginModal.on('click', '#signup-btn', function () {
    var emailAddress = $loginModal.find('.email-input:visible').val();
    var password = $loginModal.find('.password-input:visible').val();
    var isSubscribeAirVuzNews = $loginModal.find('#isSubscribeAirVuzNews').val();

    // TODO: signup user
  });

  $header.on('click', '.av-search a', function (event) {
    event.preventDefault();
    $header.find('#search-input').focus();
  });

  $header.on('keyup', '#search-input', function (event) {
    if (event.keyCode === 13) {
      window.location.href = '/search?q=' + $(this).val();
    }
  });

  $header.on('click', '.logout-btn', function () {
    auth.logout()
      .then(function () {
        // redirect to home page
        window.location.href = '/';
      });
  });
}

function initialize() {
  $footerSub1 = $('.footer-sub1');
  bindEvents();

  if (identity.isAuthenticated()) {
    renderProfileHeader();
    $footerSub1.addClass('is-login');
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