var $page;

function initialize() {
  $page = $('#static-page');
  bindEvents();
}

function bindEvents() {
  var $modal = $('#submit-modal');
  function onChangeUnder18() {
    $page.find('#under-18-agreement').toggleClass('hidden');
  }

  function onSubmit(event) {
    event.preventDefault();
    var params = {
      firstName: $page.find('#firstName').val(),
      lastName: $page.find('#lastName').val(),
      emailAddress: $page.find('#emailAddress').val(),
      isUnder18: $page.find('#cb-under-18').is(':checked'),
      isUnder18agreement: $page.find('#cb-under-18-agreement').is(':checked'),
      type: 'valley-fair'
    };

    if (!params.firstName || !params.lastName || !params.emailAddress) {
      return _showModal('Please enter in required fields');
    }

    $.ajax({
      url: '/api/forms',
      contentType : 'application/json',
      type: 'POST',
      data: JSON.stringify(params)
    }).done(onSubmited)
      .fail(onFailed)
  }

  function onFailed(response) {
    if (response.status === 400) {
      return _showModal('Max capacity exceed.');
    }
    _showModal('Something wrong with submitting. Please contact us at rsvp@airvuz.com.');
  }

  function onSubmited() {
    $page.find('form').get(0).reset();
    $page.find('#under-18-agreement').addClass('hidden');

    _showModal('Thanks for joining us. See you there!');
  }

  function _showModal(message) {
    $modal.find('.modal-body').text(message);
    $modal.modal('show');
  }

  $page.find('#cb-under-18').on('change', onChangeUnder18);
  $page.find('#btn-submit').on('click', onSubmit);
}

module.exports = {
  initialize: initialize
};