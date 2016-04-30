var auth = require('./services/auth');

function renderProfileHeader() {

}

function bindEvents() {
  var $loginModal = $('#login-modal');
  var $searchBtn = $('.av-search a');
  var $searchInput = $('#search-input');

  $loginModal.on('hidden.bs.modal', function () {
    // TODO: reset tab to login
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

  $searchBtn.on('click', function (event) {
    event.preventDefault();
    $searchInput.focus();
  });

  $searchInput.on('keyup', function (event) {
    if (event.keyCode === 13) {
      window.location.href = '/search?q=' + $searchInput.val();
    }
  });
}

function initialize() {
  bindEvents();
}

//////////////////////

var APP = {
  initialize: initialize
};

$(function () {
  APP.initialize();
});

module.exports = APP;