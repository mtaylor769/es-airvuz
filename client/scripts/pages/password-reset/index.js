var $page,
    resetCode;

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

    if (newPassword !== confirmNewPassword) {
      $page.find('.text-message.text-danger').removeClass('hidden');
      setTimeout(function () {
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
    }).fail(function () {
      alert('There was an error resetting your password. Please contact support');
    })
  }

  $page.find('#btn-reset').on('click', onResetClick);
}

module.exports = {
  initialize: initialize
};