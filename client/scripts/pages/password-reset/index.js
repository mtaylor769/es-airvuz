var $page,
    resetCode,
    animateTimer = null;

function initialize(code) {
  $page = $('#password-reset-page');
  resetCode = code;
  bindEvents();
}

function bindEvents() {
  function onResetClick(event) {
    event.preventDefault();
    var url = '/api/users/password-reset',
      newPassword = $page.find('#password').val(),
      confirmNewPassword = $page.find('#password-confirm').val();

    $page.find('.text-message.text-danger').empty();

    if (animateTimer !== null) {
      clearTimeout(animateTimer);
    }

    if (newPassword.length === 0 || confirmNewPassword.length === 0) {
      $page.find('.text-message.text-danger').removeClass('hidden');
      $page.find('.text-message.text-danger').text('Password cannot be blank.');
      animateTimer = setTimeout(function () {
        $page.find('.text-message.text-danger').addClass('hidden');
      }, 5000);
      return;
    }

    if (newPassword !== confirmNewPassword) {
      $page.find('.text-message.text-danger').removeClass('hidden');
      $page.find('.text-message.text-danger').text('Password does not match.');
      animateTimer = setTimeout(function () {
        $page.find('.text-message.text-danger').addClass('hidden');
      }, 5000);
      return;
    }

    $.ajax({
      type: 'PUT',
      url: url,
      data: {
        code    : resetCode,
        password: newPassword
      }
    }).then(function () {
      $page.find('.text-message.text-success').removeClass('hidden');
      $page.find('.text-message.text-success').text('Password has been reset.');
      $page.find('#btn-reset').attr('disabled', true);
    }).fail(function () {
        alert('There was an error resetting your password. Please contact support');
    });
  }

  $page.find('#btn-reset').on('click', onResetClick);
}

module.exports = {
  initialize: initialize
};