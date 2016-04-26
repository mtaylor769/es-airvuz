function bindEvents() {
  $('#login-modal').on('hidden.bs.modal', function () {
    // TODO: reset tab to login
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