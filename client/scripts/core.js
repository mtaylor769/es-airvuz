/* global fbq, ga */
var auth          = require('./services/auth');
var identity      = require('./services/identity');
var amazonConfig  = require('./config/amazon.config.client');
var appConfig     = require('./config/application.config.client');
var PubSub        = require('pubsub-js');
var FacebookPixel = require('./facebook-pixel');
var GoogleAnalytic = require('./google-analytic');
var GoogleTagManager = require('./google-tag-manager');
var AVEventTracker = require('./avEventTracker');
var browser       = require('./services/browser');
var dialog        = require('./services/dialogs');

/**
 * Templates
 */
var headerProfileTpl      = require('../templates/core/header-profile.dust');
var headerLoginTpl = require('../templates/core/header-login.dust');
var resendConfirmationTpl = require('../templates/core/resendConfirmation.dust');

var $loginModal,
    $headerProfile,
    $header,
    $footerSub1,
    $emailConfirmModal,
    $contactUs,
    $contactUsModal,
    contactUsFlag,
    sendContactUsEmail,
    auth2,
    isLoggedIn = false;


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
        hasNotification: notification.total > 0,
        cdnUrl: amazonConfig.CDN_URL
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

function onLoginSuccess() {
  isLoggedIn = true;
  getNewNotification()
    .then(renderProfileHeader);
  $footerSub1.addClass('is-login');
  $loginModal.modal('hide');
  if(contactUsFlag === true) {
    $contactUsModal.modal('show');
    contactUsFlag = false;
  }

  if ($('#service-dialog').is(":visible")) {
    dialog.hide();
  }

  if (identity.socialAccountInfo && identity.socialAccountInfo.isNew) {
    var socialEvent = 'account-created:' + identity.socialAccountInfo.provider;

    fbq('trackCustom', socialEvent);
    ga('send', 'event', 'login', socialEvent, 'login');
    AVEventTracker({
      codeSource: 'core',
      eventName: socialEvent,
      eventType: 'loginClick'
    });

    fbq('trackCustom', 'account-created:any');
    ga('send', 'event', 'login', 'account-created:any', 'login');
    AVEventTracker({
      codeSource: 'core',
      eventName: 'account-created:any',
      eventType: 'loginClick'
    });
  }

  fbq('trackCustom', 'login');
  ga('send', 'event', 'login', 'login-success', 'login');
  AVEventTracker({
    codeSource: 'core',
    eventName: 'login-success',
    eventType: 'loginClick'
  });
}

function execSocialLogin(ajaxOption) {
  $.ajax(ajaxOption)
    .then(function (token) {
      return identity.setToken(token);
    })
    .then(onLoginSuccess)
    .fail(function (response) {
      var errMsg = JSON.parse(response.responseText);

      if (errMsg.error === 'Username is required' ||
          errMsg.error === 'Username cannot be empty' ||
          errMsg.error === 'Username already exists') {

        var isLoginReq = browser.getUrlParams('login') === 'req' ? true : false,
            errMsg2 = errMsg.error === 'Username is required' ? '' : errMsg.error;

        $('#login-modal').modal('hide');

        // modify the dialog
        $('#service-dialog').find('.btn-okay').removeAttr('data-dismiss');
        $('#service-dialog').find('.btn-okay').html('Continue');

        dialog.setSize('md');

        dialog.open({
          title: 'Now’s your chance – update your username!',
          body: [
              "<div id='fb-body'>",
              "<p>Tell people who you are!  (We recommend using your same username from Instagram and Facebook so others can follow your great work).</p>",
              "<p>Your current username is: <b id='fb-username' style='font-size:1.5em;'></b></p>",
              "<input type='text' class='form-control fb-username-input' placeholder='Username'>",
              "<p class='text-danger' id='fb-username-error' style='padding:5px;'></p>",
              "</div>",
              "<input type='checkbox' id='user-name-create-reminder'>",
              "<span>&nbsp;Remind Me Later.</span>"
          ].join(""),
          html: true,
          showOkay: true,
          preventClose: isLoginReq,
          hideCloseBtn: isLoginReq
        }).then(function () {
          ajaxOption.data.altUserDisplayName = $('.fb-username-input').val();
          ajaxOption.data.useNameCreateReminder = $('#user-name-create-reminder').is(':checked');

          execSocialLogin(ajaxOption);
        });

        $('#user-name-create-reminder').on('change', function(evt) {
          if (evt.target.checked) {
            $('#fb-body').addClass('hidden');
            $('.fb-username-input').val('');
          } else {
            $('#fb-body').removeClass('hidden');
          }
        });

        $('#service-dialog').find('#fb-username-error').html(errMsg2);
        $('#service-dialog').find('#fb-username').html(errMsg.userName);

        if ($('#user-name-create-reminder').is(':checked')) {
          $('#fb-body').addClass('hidden');
        }

      } else {
        $loginModal.find('#social-login-error').text(response.responseText).slideDown().delay(5000).slideUp(300);
      }
    });
}

function bindEvents() {
  $header = $('#header');

  $headerProfile = $('#profile-header');
  $loginModal = $('#login-modal');
  $emailConfirmModal = $('#email-sent-modal');
  $contactUsModal = $('#contact-us-modal');
  $contactUs = $('.contact-us');
  sendContactUsEmail = $('#send-contact-us');

  function contactUs() {
    if(identity.isAuthenticated()) {
      $contactUsModal.modal('show');
    } else {
      $loginModal.modal('show');
      contactUsFlag = true;
    }
  }

  function logout() {
    auth.logout()
      .then(function () {
        auth2 && auth2.signOut();
        // redirect to home page
        window.location.href = '/';
      });
  }

  $contactUs.on('click', function() {
    contactUs();
  });

  sendContactUsEmail.on('click', function() {
    var contactData = {};
    contactData.contactUsMessage = $('body').find('#contact-us-textarea').val();
    contactData.contactingUser = identity.currentUser._id;
    $.ajax({
      type: 'POST',
      url: '/api/users/contact-us',
      data: contactData
    })
    .done(function() {
      $contactUsModal.modal('hide');
    })
    .fail(function(error) {
    })
  });

  function onPasswordReset() {
    var url = '/api/users/password-reset',
        $emailInput = $loginModal.find('.email-input:visible'),
        emailAddress = $emailInput.val().trim();

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

  function onSignupClick() {
    if (onSignupClick.isSubmitted) {
      return;
    }

    removeErrorMessage();
    //ajax object
    var newUserObject = {};

    // modal values
    var emailAddress = $loginModal.find('#email:visible').val().trim();
    var userNameDisplay = $loginModal.find('#username:visible').val().trim();
    var password = $loginModal.find('#password:visible').val();
    var confirmPassword = $loginModal.find('#confirm-password:visible').val();
    var isSubscribeAirVuzNews = $loginModal.find('#isSubscribeAirVuzNews').is(':checked');

    //setting object equal to modal values
    newUserObject.email = emailAddress;
    newUserObject.userNameDisplay = userNameDisplay;
    newUserObject.password = password;
    newUserObject.confirmPassword = confirmPassword;
    newUserObject.isSubscribeAirVuzNews = isSubscribeAirVuzNews;

    onSignupClick.isSubmitted = true;
    $.ajax({
      type: 'POST',
      url: '/api/users',
      data: JSON.stringify(newUserObject),
      contentType : 'application/json',
      beforeSend: function () {
        $loginModal.find('#signup-btn').prop('disabled', true);
      }
    })
      .done(function() {
        $loginModal.find('#email:visible').val('');
        $loginModal.find('#username:visible').val('');
        $loginModal.find('#password:visible').val('');
        $loginModal.find('#confirm-password:visible').val('');
        $loginModal.find('.text-message').removeClass('hidden');

        setTimeout(function () {
          $loginModal.find('.text-message').addClass('hidden');
        }, 5000);

        AVEventTracker({
          codeSource: 'core',
          eventName: 'account-created:local',
          eventType: 'signUpClick',
          referrer: document.referrer
        });
        fbq('trackCustom', 'account-created:local');
        ga('send', 'event', 'signup', 'account-created:local', 'signup');

        fbq('trackCustom', 'account-created:any');
        ga('send', 'event', 'login', 'account-created:any', 'login');
        AVEventTracker({
          codeSource: 'core',
          eventName: 'account-created:any',
          eventType: 'loginClick'
        });
      })
      .fail(function(response) {
        appendErrorMessage(response.responseJSON);
        //console.log(error);
      })
      .always(function () {
        onSignupClick.isSubmitted = false;
        $loginModal.find('#signup-btn').prop('disabled', false);
      });
  }
  /*
   * clear out the login text input fields
   */
  function resetLogin() {
    $('.error-message').html('');
    $('#login-modal').find('input[type=text], input[type=password]').each(function () {
      $(this).val('');
    });
  }

  function sendUserConfirmation() {
    var emailAddr = $('.email-input').val();

    ga('send', 'event', 'login', 'login-resend-confirmation', 'login');
    AVEventTracker({
      codeSource: 'core',
      eventName: 'login-resend-confirmation',
      eventType: 'resendConfirmationClick'
    });

    $.ajax({
      type: 'POST',
      url: '/api/users/resend-confirmation',
      data: {emailAddress: emailAddr}
    })
        .done(function () {
          $('.error-message').empty();
          $('.error-message').removeClass('text-danger').addClass('text-success').text('A confirmation email has been sent to ' + emailAddr);
        })
        .fail(function (error) {
        });
  }

  onSignupClick.isSubmitted = false;

  $loginModal.on('hidden.bs.modal', function () {
    if (!isLoggedIn) {
      ga('send', 'event', 'login', 'login-dismissed', 'login');
      AVEventTracker({
        codeSource: 'core',
        eventName: 'login-dismissed',
        eventType: 'loginClick'
      });
    }

    resetLogin();

    // reset tab to login
    $loginModal.find('#login-anchor-tab').click();
    contactUsFlag = false;
  });

  $loginModal.on('show.bs.modal', function (event) {
    ga('send', 'event', 'login', 'login-button-click', 'login');
    AVEventTracker({
      codeSource: 'core',
      eventName: 'login-button-click',
      eventType: 'loginClick'
    });

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

  $loginModal.on('click', '#login-btn', function (event) {
    event.preventDefault();
    var emailAddress = $loginModal.find('.email-input:visible').val().trim();
    var password = $loginModal.find('.password-input:visible').val();
    var errorMsgElem = $('.error-message');

    ga('send', 'event', 'login', 'login-attempt', 'login');
    AVEventTracker({
      codeSource: 'core',
      eventName: 'login-attempt',
      eventType: 'loginClick'
    });

    auth.login({emailAddress: emailAddress, password: password})
      .done(onLoginSuccess)
      .fail(function (message) {

          if (errorMsgElem.hasClass('text-success')) {
            errorMsgElem.removeClass('text-success').addClass('text-danger');
          }

          if (errorMsgElem.text().length) {
            errorMsgElem.empty().slideUp();
          }

          if (message === 'Please check your email to confirm account') {
            resendConfirmationTpl({}, function(err, html) {
              errorMsgElem.append(html);

              $('#send-confirmation').on('click', sendUserConfirmation);
              $('.email-input').on('keyup', function() {
                var _this = $(this);
                if (_this.val() !== emailAddress) {
                  errorMsgElem.empty();
                }
              });
            });
          } else {
            $('.email-input').unbind('keyup');
            errorMsgElem.text(message);
          }

          errorMsgElem.slideDown();

          ga('send', 'event', 'login', 'login-fail', 'login');
          AVEventTracker({
            codeSource: 'core',
            eventName: 'login-fail',
            eventType: 'loginClick'
          });
        });
  });

  $loginModal.on('click', '#signup-btn', onSignupClick);

  $header.on('click', '.av-search a', function (event) {
    event.preventDefault();
    $header.find('#search-input').addClass('active').focus();
  });

  function _doSearch(keyword) {
    window.location.href = '/search?q=' + encodeURIComponent(keyword);
  }

  $header.on('keyup', '#search-input', function (event) {
    if (event.keyCode === 13) {
      _doSearch($(this).val());
    }
  });

  $header.on('blur', '#search-input', function (event) {
    $(this).removeClass('active');

    if (browser.isMobile()) {
      _doSearch($(this).val());
    }
  });

  $header.on('click', '.logout-btn', logout);

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
    fbq('trackCustom', 'facebook-login-click');
    ga('send', 'event', 'login', 'facebook-login-click', 'login');
    AVEventTracker({
      codeSource: 'core',
      eventName: 'facebook-login-click',
      eventType: 'loginClick'
    });

    FB.login(function (response) {
      if (response.status === 'connected') {
        FB.api('/me', {fields: 'name,email,gender,age_range,updated_time,is_verified,cover,about,bio,birthday,first_name,languages,last_name,link,locale,location,middle_name,timezone,verified'}, function (response) {
          var ajaxOption = {
            url: '/api/auth/facebook',
            type: 'POST',
            data: {
              accountId: response.id,
              accountData: response,
              email: response.email,
              coverPicture: response.cover ? response.cover.source : ''
            }
          };
          execSocialLogin(ajaxOption);
        });
      }
    }, {scope: 'email'});
  });

  $loginModal.on('click', '#btn-google', function() {
    fbq('trackCustom', 'google-login-click');
    ga('send', 'event', 'login', 'google-login-click', 'login');
    AVEventTracker({
      codeSource: 'core',
      eventName: 'google-login-click',
      eventType: 'loginClick'
    });

    auth2.signIn().then(function () {
      var profile = auth2.currentUser.get().getBasicProfile();
      var token = auth2.currentUser.get().getAuthResponse().id_token;
      var ajaxOption = {
        url: '/api/auth/google',
        type: 'POST',
        data: {
          accountId: profile.getId(),
          token: token
          // coverPicture - set later
        }
      };

      gapi.client.plus.people.get({
        'userId': 'me',
        fields: 'cover/coverPhoto/url,aboutMe,ageRange,birthday,braggingRights,circledByCount,currentLocation,displayName,domain,emails,etag,gender,id,image,isPlusUser,kind,language,name,nickname,objectType,occupation,organizations,placesLived,plusOneCount,relationshipStatus,skills,tagline,url,urls,verified'
      }).execute(function (response) {
        if (response.cover && response.cover.coverPhoto && response.cover.coverPhoto.url) {
          ajaxOption.data.coverPicture = response.cover.coverPhoto.url;
        }
        ajaxOption.accountData = response.result;
        execSocialLogin(ajaxOption);
      });
    })
  });

  $loginModal.on('click', '#btn-password-reset', onPasswordReset);

  $('.go-to-login').on('click', function () {
    $loginModal.modal('show');
  });

  $(document.body).on("profilePictureUpdate", function() {
    renderProfileHeader()
  });

  PubSub.subscribe('show-login-dialog', function () {
    $loginModal.modal('show');
  });

  PubSub.subscribe('logout', logout);
}

/*
 * Facebook login requirement based on url params [?login=""]
 * 1. req: require FB login/account creation
 * 2. opt: optional FB login/account creation
 * 3. no param value: default to original login/account creation
 */
function fbAuthReq() {
  var urlParam = browser.getUrlParams('login');
  var $loginModal = $('#login-modal');

  if (!identity.isAuthenticated()) {

    PubSub.subscribe('prompOptLogin', function() {
      window.sessionStorage.setItem('opened', true);

      $loginModal.find('.modal-title').hide();
      $('#modal-alt-header').show();
      $loginModal.modal('toggle');
    });

    switch (urlParam) {
      case 'opt':
        $loginModal.find('.modal-title').hide();
        $loginModal.modal('toggle');
        window.sessionStorage.setItem('opened', true);
        break;
      case 'req':
        $loginModal.find('.modal-title').hide();
        $loginModal.find('.close').hide();
        $loginModal.modal({
          backdrop: 'static',
          keyboard: false
        });
        window.sessionStorage.setItem('opened', true);
        break;
      default:
        $('#modal-alt-header').hide();
        break;
    }
  }
}

function fbRefTrack() {
  var refParam = browser.getUrlParams('ref'),
      fbRef = localStorage.getItem('fbRef') || 0;

  if (refParam === 'fb') {
    fbRef++;
    if (fbRef === 3) {
      AVEventTracker({
        codeSource: 'core',
        eventName: 'fbRef-3plus',
        eventType: 'fbRef'
      });
      fbq('trackCustom', 'fbRef-3plus');
      ga('send', 'event', 'referral', 'fbRef-3plus', 'referral');
    }

    if (fbRef < 4) {
      localStorage.setItem('fbRef', fbRef);
    }
  }
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

  // facebook login
  $.ajax({
    dataType: 'script',
    cache: true,
    url: '//connect.facebook.net/en_US/sdk.js'
  }).done(function () {
    FB.init({
      appId: appConfig.facebook.clientId,
      version: 'v2.6'
    });
  });

  // google login
  $.ajax({
    dataType: 'script',
    cache: true,
    url: '//apis.google.com/js/client:platform.js'
  }).done(function () {
    gapi.load('auth2', function initSigninV2() {
      gapi.client.load('plus', 'v1').then(function () {
        auth2 = gapi.auth2.init({
          client_id: appConfig.google.clientId,
          scope: 'profile email'
        });
      });
    });
  });

  fbAuthReq();
  fbRefTrack();
}

//////////////////////

var APP = {
  initialize: initialize
};

FacebookPixel.initialize();
GoogleAnalytic.initialize();
GoogleTagManager.initialize();
APP.initialize();

module.exports = APP;