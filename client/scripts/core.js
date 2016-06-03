var auth          = require('./services/auth');
var identity      = require('./services/identity');
var amazonConfig  = require('./config/amazon.config.client');

/**
 * Templates
 */
var headerProfileTpl      = require('../templates/core/header-profile.dust');
var headerLoginTpl = require('../templates/core/header-login.dust');

var $loginModal,
    $headerProfile,
    $header,
    $footerSub1,
    $emailConfirmModal;


//////////////////////////////////////////////////////

//documentation for error message setup

// var errors = errorMessage.getErrorMessage({
//   statusCode			: "400",
//   errorId					: "VALIDA1000",
//   templateParams	: {
//     name : "userName"
//   },
//   sourceError		: '#username',
//   displayMsg			: "Username already exists",
//   errorMessage		: "Username already exists",
//   sourceLocation	: sourceLocation
// });

function appendErrorMessage(errorArray) {
  errorArray.forEach(function(error) {
    var inputId = $(error.sourceError);
    //console.log(inputId);
    var errorMessage = error.displayMsg;
    var html = '<div class="error text-danger m-t-5">' + errorMessage + '</div>';
    inputId.parent().append(html);
  })
}

function removeErrorMessage() {
  $('.error').remove();
}

///////////////////////////////////////////////////////

function renderProfileHeader(notification) {
  var awsAssetUrl = amazonConfig.ASSET_URL + 'users/profile-pictures',
      viewData = {
        currentUser: identity.currentUser,
        awsAssetUrl: awsAssetUrl,
        notification: notification,
        hasNotification: notification.total > 0
      };

  headerProfileTpl(viewData, function (err, html) {
    $headerProfile.html(html);
  });
}

function renderLoginHeader() {
  headerLoginTpl({}, function (err, html) {
    $headerProfile.html(html);
  });
}

function getNewNotification() {
  // notifications are render from server side so no need to get it in the client side
  var isInNotificationPage = window.location.pathname.indexOf('/notifications/') > -1,
      ajaxOption = {
        type: 'GET',
        url: '/api/notifications'
      };

  if (!isInNotificationPage) {
    return $.ajax(ajaxOption);
  }
  return $.Deferred().resolve({notifications: [], total: 0}).promise();
}

function bindEvents() {
  $header = $('#header');

  $headerProfile = $('#profile-header');
  $loginModal = $('#login-modal');
  $emailConfirmModal = $('#email-sent-modal');

  function onPasswordReset() {
    var url = '/api/users/password-reset',
        $emailInput = $loginModal.find('.email-input:visible'),
        emailAddress = $emailInput.val();

    function _showHideInput(which) {
      $emailInput.val('');
      $loginModal.find('#forgot-password-tab .text-message.' + which).removeClass('hidden');
      setTimeout(function () {
        $loginModal.find('#forgot-password-tab .text-message.' + which).addClass('hidden');
      }, 5000);
    }

    $.ajax({
      type: 'POST',
      url: url,
      data: {email: emailAddress}
    }).then(function () {
      _showHideInput('text-success');
    }).fail(function () {
      _showHideInput('text-danger');
    });
  }

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
        getNewNotification()
          .then(renderProfileHeader);
        $footerSub1.addClass('is-login');
        $loginModal.modal('hide');
      })
      .fail(function (err) {
          var message = 'Wrong email or password';
          if(err.responseText.indexOf('email-confirm') > -1){
            message = 'Please check your email to confirm account';
          }
          $loginModal.find('.error-message').text(message).slideDown().delay(5000).slideUp(300);
      })
  });

  $loginModal.on('click', '#signup-btn', function () {
    removeErrorMessage();
    //ajax object
    var newUserObject = {};

    // modal values
    var emailAddress = $loginModal.find('#email:visible').val();
    var username = $loginModal.find('#username:visible').val();
    var password = $loginModal.find('#password:visible').val();
    var confirmPassword = $loginModal.find('#confirm-password:visible').val();
    var isSubscribeAirVuzNews = $loginModal.find('#isSubscribeAirVuzNews').val();

    //setting object equal to modal values
    newUserObject.email = emailAddress;
    newUserObject.username = username;
    newUserObject.password = password;
    newUserObject.confirmPassword = confirmPassword;
    
    $.ajax({
      type: 'POST',
      url: '/api/users/create',
      data: newUserObject
    })
      .done(function(response) {
        if(response.email) {
          $loginModal.find('#email:visible').val('');
          $loginModal.find('#username:visible').val('');
          $loginModal.find('#password:visible').val('');
          $loginModal.find('#confirm-password:visible').val('');
          $loginModal.modal('hide');
          
        } else {
          appendErrorMessage(response);
        }
      })
      .error(function(error) {
        //console.log(error);
      })
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

  $header.on('click', '#notification', function () {
    var ajaxOptions = {
          type: 'POST',
          url: '/api/notifications/seen'
        },
        $badge = $(this).find('.badge');
      
    
    $.ajax(ajaxOptions)
      .then(function () {
        $badge.remove();
      });
  });

  $loginModal.on('click', '#btn-facebook', function() {
    window.location.href = '/api/auth/facebook';
  });
  
  $loginModal.on('click', '#btn-google', function() {
    window.location.href = '/api/auth/google';
  });

  $loginModal.on('click', '#btn-password-reset', onPasswordReset);

  $('.go-to-login').on('click', function () {
    $('#login-modal').modal('show');
  })
}

function initialize() {
  $footerSub1 = $('.footer-sub1');
  bindEvents();
  if (identity.isAuthenticated()) {
    getNewNotification()
      .then(renderProfileHeader);
    $footerSub1.addClass('is-login');
    $header.addClass('is-login');
  } else {
    renderLoginHeader();
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