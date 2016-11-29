var $dialogs,
    dfd,
    dialogs = {};

var CONFIRM_MESSAGE = 'Confirmation required.';
var REQUIRED_MESSAGE = 'Please check required fileds.';
var ERROR_MESSAGE = 'Oops! Something went wrong! Help us improve your experience by sending an error report to support@airvuz.com';

/**
 *
 * @param params {Object}
 * @param params.title {String}
 * @param params.body {String}
 * @param params.html {String}
 * @param params.preventClose {Boolean}
 * @param params.hideCloseBtn {Boolean}
 * @param params.showOkay {Boolean}
 */
function open(params) {
  var title = params && params.title || '';
  var body = params && params.body || '';
  var html = params && params.html || false;
  var preventClose = params && params.preventClose || false;
  var hideCloseBtn = params && params.hideCloseBtn || false;

  $dialogs.find('.modal-footer .btn').addClass('hidden');
  $dialogs.find('.modal-footer .btn-close').removeClass('hidden');

  if (params.showOkay) {
    $dialogs.find('.modal-footer .btn-okay').removeClass('hidden');
  }

  $dialogs.find('.modal-title').text(title);

  if (!html) {
    $dialogs.find('.modal-body').text(body);
  } else {
    $dialogs.find('.modal-body').html(body);
  }

  if (preventClose) {
    $dialogs.modal({
      backdrop: 'static',
      keyboard: false
    });
  }

  if (hideCloseBtn) {
    $dialogs.find('.close').hide();
    $dialogs.find('.btn-close').hide();
  }

  $dialogs.modal('show');


  dfd =  $.Deferred();
  return dfd.promise();
}

/**
 * hide modal
 */
function hide() {
  $dialogs.modal('hide');
  dfd.reject();
}


function error(params) {
  return open({
    title: 'Error',
    body: params || ERROR_MESSAGE
  });
}

function confirm(params) {
  return open({
    title: 'Confirmation',
    body: params || CONFIRM_MESSAGE
  });
}

function required() {
  return open({title: 'Required fields', body: REQUIRED_MESSAGE});
}

$(function () {
  $dialogs = $('#service-dialog');

  function okayClick () {
    dfd.resolve();
  }

  $dialogs.on('click', '.btn-okay', okayClick);
});

/**
 * change modal size
 *  - change size first before openning
 * @param size {String} - lg md sm
 *  - default is sm
 */
function setSize(size) {
  if (size === 'md' && $dialogs.find('.modal-dialog').hasClass('modal-sm')) {
    $dialogs.find('.modal-dialog').removeClass('modal-sm');
  }
  $dialogs.find('.modal-dialog').addClass('modal-' + size);
}

/////////////////

dialogs.open = open;
dialogs.hide = hide;
dialogs.error = error;
dialogs.confirm = confirm;
dialogs.required = required;
dialogs.setSize = setSize;

module.exports = dialogs;