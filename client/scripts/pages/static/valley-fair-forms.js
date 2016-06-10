var $page;

function initialize() {
  $page = $('#static-page');
  bindEvents();
}

function bindEvents() {
  var $modal = $('#submit-modal');
  function onChangeUnder18() {
    var isUnder18 = $(this).is(':checked');

    if (isUnder18) {
      $page.find('#agree-text').html('I understand that <strong>I must bring a signed copy of the AirVūz Authorization and Appearance Release Form</strong> to the event, and I understand that if the signed form is not provided to AirVūz, I may not able to participate in this event. <br><strong>The Authorization and Release Form will be linked in an email sent to me, upon clicking Submit below </strong>');
    } else {
      $page.find('#agree-text').text('By clicking on Submit My RSVP, I will be registered as an extra for this event. I will sign the necessary waivers and release upon my arrival at the event.');
    }
  }

  function onSubmit(event) {
    event.preventDefault();
    var params = {
      firstName: $page.find('#firstName').val(),
      lastName: $page.find('#lastName').val(),
      emailAddress: $page.find('#emailAddress').val(),
      isUnder18: $page.find('#cb-under-18').is(':checked'),
      iAgree: $page.find('#cb-agreement').is(':checked'),
      type: 'valley-fair'
    };

    if (!params.firstName || !params.lastName || !params.emailAddress || !params.iAgree) {
      return _showModal('Please enter in required fields or check agreement');
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

    _showModal('Confirmation email has been sent!');
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