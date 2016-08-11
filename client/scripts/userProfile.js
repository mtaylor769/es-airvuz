/* global fbq, ga */
/**
 * External library
 */
require('bootstrap-tagsinput');
require('bootstrap-switch');
require('../../node_modules/bootstrap-tagsinput/dist/bootstrap-tagsinput.css');
require('../../node_modules/bootstrap-switch/dist/css/bootstrap3/bootstrap-switch.min.css');


var Evaporate                 = require('evaporate');
var AmazonConfig              = require('./config/amazon.config.client');
var identity                  = require('./services/identity');
var camera                    = require('./services/camera');
var drone                     = require('./services/drone');
var category                  = require('./services/category');
var AVEventTracker			      = require('./avEventTracker');
var user                      = identity.currentUser || null;
var userNameCheck             = '';
var amazonConfig              = require('./config/amazon.config.client');
var md5                       = require('md5');
var $editVideo                = null;
var userData                  = {};
var allOwnerVideos            = [];
var showcaseOwnerVideos       = [];
var skip                      = 0;
var fUserId                   = null;
var modalFollowBtnClicked     = false;
var modalFollowBtnSelected    = null;


/*
Edit Video Variables
 */
var $videoEditModal,
  $tags,
  $profilePage,
  VIEW_MODEL = {},
  customThumbnailName,
  currentEditVideo = {},
  isCustomThumbnail = false;

/*
* Templates
*/
var ownerShowcase         = require('../templates/userProfile/showcase-owner.dust');
var userAllVideosHtml     = require('../templates/userProfile/allvideos-user.dust');
var ownerAllVideosHtml    = require('../templates/userProfile/allvideos-owner.dust');
var userProfileEdit       = require('../templates/userProfile/edit-profile.dust');
var aboutMe               = require('../templates/userProfile/about.dust');
var videoInfo             = require('../templates/userProfile/edit-video.dust');
var thumbnailTpl          = require('../templates/upload/thumbnail.dust');
var followTpl             = require('../templates/userProfile/follow.dust');

var okHtml                = '<div class="ok showcase-edit-button"><span class="glyphicon glyphicon-ok"></span></div>';
var notSelectedHtml       = '<div class="not-selected showcase-edit-button"><span class="glyphicon glyphicon-plus"></span></div>';
var removeHtml            = '<div class="removed showcase-edit-button"><span class="glyphicon glyphicon-minus"></span></div>';


function showcaseAdd(videoId) {
  var data = {};
  data.video = videoId;
  data.user = user._id;

  $.ajax({
    type: 'POST',
    url: '/api/video-collection/update-collection',
    data: data
  })
    .done(function(response) {
    })
    .fail(function(error) {
    });
}

function bindEvents() {

  function uploadImage(params) {
    var evaporate = new Evaporate({
      signerUrl : '/api/amazon/sign-auth',
      aws_key   : amazonConfig.ACCESS_KEY,
      bucket    : amazonConfig.ASSET_BUCKET,
      aws_url   : 'https://s3-us-west-2.amazonaws.com'
    });

    evaporate.add({
      // headers
      contentType: params.image.type || 'binary/octet-stream',
      headersCommon: {
        'Cache-Control': 'max-age=3600'
      },
      signHeaders: {
        Authorization: 'Bearer ' + identity.getToken()
      },
      xAmzHeadersAtInitiate: {
        'x-amz-acl': 'public-read'
      },
      // filename, relative to bucket
      name: params.fileName,
      // content
      file: params.image,
      // event callbacks
      complete: params.onComplete,
      error: onUploadError
    });
  }

  function updateUserPicture(hashName, type) {
    var data = {};
    data[type] = '/' + hashName;

    var ajaxOptions = {
        type        : 'PUT',
        url         : '/api/users/' + identity._id,
        contentType : 'application/json',
        data        : JSON.stringify(data)
      };

    $.ajax(ajaxOptions)
      .then(function (response) {
        var $userInfoData = $('#userInfoData');

        if (type === 'profilePicture') {
          $userInfoData
            .find('.profile-picture img')
            .attr('src', amazonConfig.ASSET_URL + 'users/profile-pictures/' + hashName);
          identity.getUserInfo();
          $(this.body).trigger("profilePictureUpdate");
          $('body')
            .find('.profile-img-wrap img')
            .attr('src', amazonConfig.ASSET_URL + 'users/profile-pictures/' + hashName)
        } else {
          $userInfoData
            .find('> section')
            .css({
              background: '#fff url(' + amazonConfig.ASSET_URL + 'users/cover-pictures/' + hashName + ') no-repeat center',
              backgroundSize: "cover",
              minHeight: '300px'
            })
        }
      });
  }

  function onProfileImageChange() {
    var image = this.files[0],
        hashName = md5(image.name + Date.now()) + '.' +  image.name.split('.')[1],
        path = 'users/profile-pictures/';

    uploadImage({
      image: image,
      fileName: path + hashName,
      onComplete: function () {
        updateUserPicture(hashName, 'profilePicture');
      }
    });
  }

  function onCoverImageChange() {
    var image = this.files[0],
        hashName = md5(image.name + Date.now()) + '.' +  image.name.split('.')[1],
        path = 'users/cover-pictures/';

    uploadImage({
      image: image,
      fileName: path + hashName,
      onComplete: function () {
        // do request to save hashName to database
        updateUserPicture(hashName, 'coverPicture');
      }
    });
  }

  function onUploadError() {
    $('#error-message-modal')
      .modal('show')
      .find('.error-modal-body')
      .html('Error uploading image');
  }

  $('#edit-showcase').on('click', editShowcase);
  $profilePage
    .on('change', '#profile-image-input', onProfileImageChange)
    .on('change', '#cover-image-input', onCoverImageChange)
    .on('click', '.showcase-edit-button', showcaseButton)
    .on('click', '#save-edit-btn', changeProfile)
    .on('click', '#change-password-btn', changePassword)
    .on('click', '.follower', openFollowers)
    .on('click', '.following', openFollowing);
    
  $('#followers-modal')
    .on('click', '.follower-btn', getMoreFollowers);
  $('#following-modal')
    .on('click', '.following-btn', getMoreFollowing);

  $videoEditModal
    .on('change', '#category', onCategorySelect)
    .on('change', '#custom-image-file', onCustomFileChange)
    .on('click', '#selected-category-list li', onCategoryRemove)
    .on('click', '#btn-custom-thumbnail', onCustomThumbnailClick)
    .on('click', '#generated-thumbnails li', onThumbnailSelect)
    .on('click', '#btn-cancel-custom-thumbnail', onCancelCustomThumbnailClick)
    .on('click', '#btn-save-video-edit', onSaveVideoEdit);

  function showcaseButton() {
    var buttonDiv = $(this).parent();
    var videoId = buttonDiv.attr('data-videoid');
    var status = buttonDiv.attr('data-showcase');
    $(this).remove();
    if(status === 'true') {
      $(buttonDiv).append(removeHtml);
      $(buttonDiv).attr('data-showcase', 'false');
      showcaseAdd(videoId)
    } else {
      $(buttonDiv).append(okHtml);
      $(buttonDiv).attr('data-showcase', 'true');
      showcaseAdd(videoId)
    }
  }

  function onVideoEditClick() {
    editVideo($(this).data('videoId'));
  }

  function onVideoDeleteClick() {
    var video = $(this).parents('.col-md-3');

    deleteVideo($(this).data('videoId'))
      .then(function () {
        video.remove();
      })
      .fail(function () {
        $('#error-message-modal')
          .modal('show')
          .find('.error-modal-body')
          .html(error);
      })
  }

  $profilePage.find('#allvideos')
    .on('click', '.btn-edit-video', onVideoEditClick)
    .on('click', '.btn-delete-video', onVideoDeleteClick);
}

function doneEditShowcase(){
  $('.showcase-edit-button').hide();
  $('.edit-showcase-btn').toggle();
  $('.edit-done-btn').toggle();
  $('#edit-showcase').on('click', editShowcase);
  location.reload();
}

function editShowcase() {
  $('.edit-showcase-btn').toggle();
  $('.edit-done-btn').toggle();
  $('.showcase').each(function(i, link) {
    var isShowcase = $(link).attr('data-showcase');
    if(isShowcase === 'true') {
      $(link).append(okHtml);
    } else {
      $(link).append(notSelectedHtml);
    }
  });
  var showcase = ($('.showcase')).children();
  $(showcase).on('click', function() {
    var buttonDiv = $(this).parent();
    var videoId = buttonDiv.attr('data-videoid');
    var status = buttonDiv.attr('data-showcase');
    $(this).remove();
    if(status === 'true') {
      $(buttonDiv).append(removeHtml);
      $(buttonDiv).attr('data-showcase', 'false');
      showcaseAdd(videoId);
    } else {
      $(buttonDiv).append(okHtml);
      $(buttonDiv).attr('data-showcase', 'true');
      showcaseAdd(videoId);
    }
  });

  $('.edit-done-btn').on('click', doneEditShowcase);
}

function changePassword() {
  $('#change-password')
    .modal('show');
}

function bindChangePassword() {
  $('#change-password')
    .on('click', '#new-password-btn', confirmPasswordChange);
}

function confirmPasswordChange() {
  var data                  = {};
  var $changePasswordModal  = $('#change-password');
  data.oldPassword          = $changePasswordModal.find("#old-password").val();
  data.newPassword          = $changePasswordModal.find("#new-password").val();
  data.confirmPassword      = $changePasswordModal.find("#confirm-password").val();

  if(!data.oldPassword || data.oldPassword === '') {
    $('#error-message-modal')
      .modal('show')
      .find('.error-modal-body')
      .html('Please enter in current password');
    return false;
  }
  if(data.newPassword !== data.confirmPassword) {
    $('#error-message-modal')
      .modal('show')
      .find('.error-modal-body')
      .html('New Password Invalid');
    return false;
  } 
  $.ajax({
    type:'PUT',
    url: '/api/users/' + user._id,
    data: data
  })
  .done(function(response) {
    if(response.status==='OK') {
     //Do nothing, password has been changed
    } else {
      var strBuilder = '';
      response.data.forEach(function(item){
        if (item.displayMsg) {
          strBuilder += item.displayMsg;
        }
      });
    }
  })
  .fail(function(error) {
    $('#error-message-modal')
      .modal('show')
      .find('.error-modal-body')
      .html('Error. ' + error);
  });
  $('#change-password').modal('hide');

}

function changeProfile() {
  $('#save-changes').modal('show');
  $('#save-changes')
    .on('click', '#save-changes-btn', editProfile);
}

function renderUserInfo() {
  if (profileUser.allowDonation) {
    $('.donate-btn').show();
  } else {
    $('.donate-btn').hide();
  }

  if (profileUser.allowHire) {
    $('.hire-btn').show();
  } else {
    $('.hire-btn').hide();
  }
}

function editProfile() {
var userNameDisplay       = $("#username").val();
  var emailAddress        = $("#email").val();
  var myAbout             = $("#aboutme").val();
  var facebook            = $("#facebook").val();
  var googleplus          = $("#googleplus").val();
  var twitter             = $("#twitter").val();
  var instagram           = $("#instagram").val();
  var lastName            = $("#lastname").val();
  var firstName           = $("#firstname").val();
  var allowHire           = $("#hire").prop('checked');
  var allowDonation       = $("#donate").prop('checked');
  var donateUrl           = $("#donateUrl").val();
  var sendData            = true;
  var errorMsg            = '';
  var regSpaceTest        = new RegExp("\\s");

  userData = {
    firstName             : firstName,
    lastName              : lastName,
    aboutMe               : myAbout,
    allowDonation         : allowDonation,
    allowHire             : allowHire
  }

  if (userNameDisplay && userNameDisplay !== profileUser.userNameDisplay) {
      userData.userNameDisplay = userNameDisplay;
  }
  if (emailAddress && emailAddress !== profileUser.emailAddress) {
    userData.emailAddress = emailAddress;
  }

  if (donateUrl && donateUrl !== '') {

    var paypal = donateUrl;
    var allowPp = allowDonation;
    var check = -1;
    if ((typeof(paypal) !== 'undefined') && (paypal !== null) && (paypal.length !== 0)) {
      check = paypal.indexOf('paypal');
    }
    if (check === -1 && (typeof(paypal) !== 'undefined') && paypal !== null) {
      errorMsg = 'Invalid donation URL';
      sendData = false;
      //this means the url does not contain the word paypal
    } else if ((allowPp === true) && (typeof(paypal) === 'undefined' || paypal === null)) {
      errorMsg = 'Invalid donation URL';
      sendData = false;
      //this means the url is not valid
    } else {
      if (typeof(paypal) !== 'undefined' && paypal !== null) {
        var check2 = paypal.indexOf('http://');
        var check3 = paypal.indexOf('https://');
        if (check2 && check3 < 0) {
          paypal = 'https://' + paypal;
          userData.donationUrl = paypal;
        } else {
          userData.donationUrl = paypal;
        }
      } else {
        errorMsg = 'Invalid donation URL';
        sendData = false;
      }
    }
  }

  userData.socialMediaLinks = [
    {
      socialType      : 'FACEBOOK',
      url             : facebook
    },
    {
      socialType      : 'GOOGLE+',
      url             : googleplus
    },{
      socialType      : 'INSTAGRAM',
      url             : instagram
    },{
      socialType      : 'TWITTER',
      url             : twitter
    }
  ]

  if (sendData) {
    $.ajax({
      type:'PUT',
      url: '/api/users/' + user._id,
      data: JSON.stringify(userData),
      contentType : 'application/json'
    })
      .done(function(response) {
        if (response.statusCode === 500) {
          var strBuilder = '';
          if (!!response.data.length) {
            response.data.forEach(function(item){
              if (item.displayMsg) {
                strBuilder += item.displayMsg;
              }
            });
          }
          $('#save-changes').modal('hide');
          $('#error-message-modal')
            .modal('show')
            .find('.error-modal-body')
            .html('Error. ' + strBuilder);
        } else {

          if (userData.userNameDisplay) {
            // if user change the user name then redirect them to the new url
            identity.getUserInfo()
              .then(function () {
                window.location.href = '/user/' + response.data.userNameUrl;
              });
          }

          profileUser = response.data;
          renderUserInfo();
          renderSocialMediaLinks();
        }
      })
      .fail(function(error) {
        $('#save-changes').modal('hide');
        $('#error-message-modal')
          .modal('show')
          .find('.error-modal-body')
          .html('Error ' +error);
      });
  } else {
    $('#error-message-modal')
      .modal('show')
      .find('.error-modal-body')
      .html('Error, unable to save data. ' + errorMsg);
  }
  $('#save-changes').modal('hide');
}

function onSaveVideoEdit() {

  var params = {
    _id                   : currentEditVideo._id,
    title                 : $('#title').val(),
    videoLocation         : $('#location').val(),
    tags                  : $tags.val(),
    description           : $('#description').val().replace(/(?:\r\n|\r|\n)/g, '<br />'),
    categories            : $('#selected-category-list li').map(function (index, li) {
                              return $(li).data('id');
                            }).toArray(),
    droneType             : $('#drone-type').val(),
    cameraType            : $('#camera-type').val(),
    thumbnailPath         : currentEditVideo.thumbnailPath,
    isCustomThumbnail     : isCustomThumbnail,
    hashName              : currentEditVideo.videoPath.split('/')[0],
    customThumbnail       : customThumbnailName
  };

  if ($('#tags').val()) {
    params.tags = $('#tags').val().split(',');
  }

  $.ajax({
    url         : '/api/videos/' + params._id,
    contentType : 'application/json',
    type        : 'PUT',
    data        : JSON.stringify(params)
  }).done(function (video) {
    location.reload();
  })
    .fail(function(error){
      $('#error-message-modal')
        .modal('show')
        .find('.error-modal-body')
        .html(error);
    });
}

function requestVideoSort(sortBy, id) {
  var params = {
    sortBy : sortBy
  };
  $.ajax({
    type: 'GET',
    url: '/api/videos/user/'+id,
    data: params
  })
  .done(function(data) {
    if (data.status==='OK') {
      if(userNameCheck === profileUser.userName) {
        renderOwnerAllVideosHtml(data.data);
      } else {
        renderUseAllVideosHtml(data.data);
      }
    } else {
    }
  })
  .fail(function(error) {
  });
}

function sortShowcase(sortBy, id) {
  var params = {
    sortBy : sortBy
  };
  $.ajax({
    type: 'GET',
    url: '/api/videos/user/'+id,
    data: params
  })
  .done(function(data) {
    if (data.status==='OK') {
      renderOwnerShowcase(data.data)
      // ownerShowcase({videos: data.data, s3Bucket: AmazonConfig.OUTPUT_URL}, function(err, html) {
      //   $('#allvideos').html(html);
      // });
    } else {
    }
  })
  .fail(function(error) {
  });
}

function deleteVideo(videoId) {
  return $.Deferred(function (defer) {
    $('#delete-video-modal')
      .modal('show')
      .on('click', '#confirm-delete-video-btn', function(){
        event.preventDefault();
        $.ajax({
          type: 'DELETE',
          url: '/api/videos/' + videoId
        })
          .done(function(data){
            defer.resolve(data);
          })
          .fail(function(error){
            defer.reject(error);
          })
      });
  });
}

function editVideo(videoId) {
  var video = $.grep(profileVideos, function (video) {
    return video._id === videoId;
  });
  renderEditVideoHtml(video[0]);
}

function getCategoryById(id) {
  var found = null;
  $.each(VIEW_MODEL.categories, function (index, category) {
    if (category._id === id) {
      found = category;
    }
  });
  return found;
}

function onCategorySelect() {
  var categoryId = $(this).val();
  if (!categoryId) {
    return;
  }

  var category = getCategoryById(categoryId);
  var list = '<li data-id="' + category._id + '">' + category.name + '</li>';
  var $categoryList = $videoEditModal.find('#selected-category-list');

  if ($categoryList.find('li').length < 3) {
    $categoryList.append(list);
  } else {
    $videoEditModal.find('#category-message').text('Max catgories');

    setTimeout(function () {
      $videoEditModal.find('#category-message').text('');
    }, 2000);
  }
}

function onCategoryRemove() {
  $(this).remove();
}

function renderThumbnail(thumbnails, selectedThumbnail) {
  var url = AmazonConfig.OUTPUT_URL;
  thumbnailTpl({thumbnails: thumbnails, url: url, selectedThumbnail: selectedThumbnail}, function (err, html) {
    $videoEditModal.find('#generated-thumbnails').html(html);
  });
}

function renderEditVideoHtml(video) {
  var selectedCategory = [];

  // reset
  currentEditVideo = video;
  isCustomThumbnail = video.thumbnailPath.indexOf('custom') > 0;

  video.categories.forEach(function (video) {
    selectedCategory.push(getCategoryById(video));
  });

  // convert br to new line
  video.description = video.description.replace(/<br\s*\/?>/mg, '\n');

  var viewData = {
    video: video,
    categoryType: VIEW_MODEL.categories,
    drones: VIEW_MODEL.drones,
    cameras: VIEW_MODEL.cameras,
    selectedCategory: selectedCategory
  };

  // generated thumbnail
  var thumbnails = [1,2,3,4,5,6],
      videoHash = video.thumbnailPath.split('/')[0];

  thumbnails.forEach(function (value, index) {
    thumbnails[index] = videoHash + '/' + 'tn_0000' + value + '.jpg';
  });

  videoInfo(viewData, function(err, html) {
    $videoEditModal.find('#edit-video-content')
      .html(html);

    $tags = $('#tags');
    // initalize plugin
    $tags.tagsinput({
      // enter, commas, and space
      confirmKeys: [13, 188, 32]
    });

    renderThumbnail(thumbnails, video.thumbnailPath);

    if (isCustomThumbnail) {
      toggleThumbnailLayout(true);
      $videoEditModal
        .find('.custom-thumbnail-display')
        .css('background-image', 'url(' + AmazonConfig.OUTPUT_URL + currentEditVideo.thumbnailPath +')');
    }

    $videoEditModal
      .modal('show');
  });
}

function onCustomFileChange() {
  var customThumbnailFile = this.files[0];

  $videoEditModal.find('.custom-thumbnail-display').css('background-image', 'none');
  $videoEditModal.find('#custom-thumbnail-section .fa').removeClass('hidden');

  var evaporate = new Evaporate({
    signerUrl : '/api/amazon/sign-auth',
    aws_key   : AmazonConfig.ACCESS_KEY,
    bucket    : AmazonConfig.TEMP_BUCKET,
    aws_url   : 'https://s3-us-west-2.amazonaws.com'
  });

  // add Date.now() incase the user reupload again.
  // without it the image won't change or reload because it is the same name
  customThumbnailName = 'tn_custom-' + Date.now() + '.' + customThumbnailFile.name.split('.')[1];

  evaporate.add({
    // headers
    contentType: customThumbnailFile.type || 'binary/octet-stream',
    headersCommon: {
      'Cache-Control': 'max-age=3600'
    },
    xAmzHeadersAtInitiate: {
      'x-amz-acl': 'public-read'
    },
    signHeaders: {
      Authorization: 'Bearer ' + identity.getToken()
    },
    // filename, relative to bucket
    name: customThumbnailName,
    // content
    file: customThumbnailFile,
    // event callbacks
    complete: function () {
      onCustomThumbnailUploadComplete(customThumbnailName);
    },
    error: onUploadError
  });
}
function onUploadError(message) {
  // isUploading = false;
}
function onCustomThumbnailUploadComplete(name) {
  $videoEditModal.find('#custom-thumbnail-section .fa').addClass('hidden');
  $videoEditModal.find('.custom-thumbnail-display').css('background-image', 'url(//s3-us-west-2.amazonaws.com/airvuz-tmp/' + name +')');
}

/**
 * toggle thumbnail layout
 */
function toggleThumbnailLayout(isCustom) {
  $videoEditModal.find('#custom-thumbnail')[isCustom ? 'addClass' : 'removeClass']('hidden');
  $videoEditModal.find('#custom-thumbnail-section')[isCustom ? 'removeClass' : 'addClass']('hidden');
  $videoEditModal.find('#generated-thumbnails')[isCustom ? 'addClass' : 'removeClass']('hidden');
  isCustomThumbnail = isCustom;
}

function onCustomThumbnailClick(event) {
  event.preventDefault();
  toggleThumbnailLayout(true);
}

function onCancelCustomThumbnailClick(event) {
  event.preventDefault();
  toggleThumbnailLayout(false);
}

function onThumbnailSelect() {
  $(this)
    .addClass('active')
    .parent()
    .find('li.active')
    .not(this).removeClass('active');

  currentEditVideo.thumbnailPath = $(this).data('url');
}

function renderAllVideos(html) {
  $('#allvideos').html(html);
  bindSortAllVideos();
}

function renderOwnerAllVideosHtml(videos) {
  ownerAllVideosHtml({videos: videos, s3Bucket: AmazonConfig.OUTPUT_URL}, function(err, html) {
    renderAllVideos(html);
  });
}

function renderUseAllVideosHtml(videos) {
  userAllVideosHtml({videos: videos, s3Bucket: AmazonConfig.OUTPUT_URL}, function(err, html) {
    renderAllVideos(html);
  });
}

function renderOwnerShowcase(videos) {
  ownerShowcase({videos: videos, s3Bucket: AmazonConfig.OUTPUT_URL}, function(err, html) {
    $('#allvideos').html(html);
  });
  $('.sort-showcase')
    .on('click', '.sort-showcase-vuz', function(){
      sortShowcase('vuz', profileUser._id);
    })
    .on('click', '.sort-showcase-dasc', function(){
      sortShowcase('dasc', profileUser._id);
    })
    .on('click', '.sort-showcase-ddesc', function(){
      sortShowcase('ddesc', profileUser._id);
    })
    .on('click', '.sort-showcase-likes', function(){
      sortShowcase('likes', profileUser._id);
    });
}

function renderUserProfileEdit(profileData) {
  userProfileEdit({user: profileData}, function (err, html) {
    $('#edit-profile').html(html);
    if ($('#donate').prop('checked')) {
      $('#donateUrl').show();
    } else {
      $('#donateUrl').hide();
    }
  });
  $('#donate').on('click', function(){
    if ($('#donate').prop('checked')) {
      $('#donateUrl').show();
    } else {
      $('#donateUrl').hide();
    }
  });
  renderSocialMediaLinks();
  bindChangePassword();
}

function renderSocialMediaLinks() {
  var $socialMedia = $('.user-social-media');
  var $aboutMe     = $('#about-me-section').find('.aboutme-socialmedia');
  var $editProfile = $('.edit-profile');
  if (profileUser.socialMediaLinks) {
    //test for existence of socialMediaLinks attribute
    if (profileUser.socialMediaLinks.length > 0) {
      //socialMediaLinks could still exist but have nothing in array
      profileUser.socialMediaLinks.forEach(function(account){
        switch (account.socialType) {
          case "FACEBOOK" :
            if (account.url && account.url !== '') {
              $socialMedia.find('.facebook').parent().removeClass('hidden');
              $('.follow-info').css({"marginBottom": "-7px"});
              $socialMedia.find('.facebook')
                .attr('href', '//'+account.url);
              $aboutMe.find('.facebook').show();
              $aboutMe.find('.facebook-link')
                .attr('href', '//'+account.url);
              $editProfile.find('#facebook').val(account.url)
            } else {
              $socialMedia.find('.facebook').parent().hide();
              $aboutMe.find('.facebook').hide();
            }
            break;
          case 'GOOGLE+' :
            if (account.url && account.url !== '') {
              $socialMedia.find('.google').parent().removeClass('hidden');
              $('.follow-info').css({"marginBottom": "-7px"});
              $socialMedia.find('.google')
                .attr('href', '//'+account.url);
              $aboutMe.find('.google').show();
              $aboutMe.find('.google-link')
                .attr('href', '//'+account.url);
              $editProfile.find('#googleplus').val(account.url);
            } else {
              $socialMedia.find('.google').parent().hide();
              $aboutMe.find('.google').hide();
            }
            break;
          case 'INSTAGRAM' :
            if (account.url && account.url !== '') {
              $socialMedia.find('.instagram').parent().removeClass('hidden');
              $('.follow-info').css({"marginBottom": "-7px"});
              $socialMedia.find('.instagram')
                .attr('href', '//'+account.url);
              $aboutMe.find('.instagram').show();
              $aboutMe.find('.instagram-link')
                .attr('href', '//'+account.url);
              $editProfile.find('#instagram').val(account.url);
            } else {
              $socialMedia.find('.instagram').parent().hide();
              $aboutMe.find('.instagram').hide();
            }
            break;
          case 'TWITTER' :
            if (account.url && account.url !== '') {
              $socialMedia.find('.twitter').parent().removeClass('hidden');
              $('.follow-info').css({"marginBottom": "-7px"});
              $socialMedia.find('.twitter')
                .attr('href', '//'+account.url);
              $aboutMe.find('.twitter').show();
              $aboutMe.find('.twitter-link')
                .attr('href', '//'+account.url);
              $editProfile.find('#twitter').val(account.url);
            } else {
              $socialMedia.find('.twitter').parent().hide();
              $aboutMe.find('.twitter').hide();
            }
            break;
          default : null; //Nothing happens
        };
      });
    }
  }
}

function getData() {
  camera.getAll()
    .then(function (cameras) {
      VIEW_MODEL.cameras = cameras;
    });

  drone.getAll()
    .then(function (drones) {
      VIEW_MODEL.drones = drones;
    });

  VIEW_MODEL.categories = Page.categories;
}


////// follow block

function updateFollow() {
  var userToFollowId = fUserId !== null ? fUserId : profileUser._id;

  var followData = {
    follow : {
      userId : user._id,
      followingUserId : userToFollowId
    },
    notification : {
      notificationType : 'FOLLOW',
      notificationMessage : 'started following you',
      actionUserId : user._id,
      notifiedUserId : userToFollowId
    }
  };

  $.ajax({
    type:'POST',
    url: '/api/follow',
    data: {data: JSON.stringify(followData)}
  })
    .done(function(response){
      if(response.status === 'followed') {
        if (modalFollowBtnClicked) {
          updateModalFollowBtn(true);
        } else {
          swapFollowBtn(true);
        }
        AVEventTracker({
          codeSource	: "userPage",
          eventName		: "followedUser",
          eventType		: "click"
        });
        $('#follow').text('-');
        fbq('trackCustom', 'follow');
      } else if(response.status === 'unfollowed'){
        if (modalFollowBtnClicked) {
          updateModalFollowBtn(false);
        } else {
          swapFollowBtn(false);
        }
          AVEventTracker({
            codeSource	: "userPage",
            eventName		: "unfollowedUser",
            eventType		: "click"
          });
        //TODO Update current profile page with new amount of followers
        fbq('trackCustom', '-follow');
      }

      modalFollowBtnClicked = false;
      fUserId = null;

      ga('send', 'event', 'user page', 'following', 'following user');
    })
    .fail(function(error){
      $('#error-message-modal')
        .modal('show')
        .find('.error-modal-body')
        .html('Error ' + errorMsg);
    });
}
function checkFollowStatus(){
  var data = {
    followingUserId     : profileUser._id,
    userId              : user._id
  }
  $.ajax({
    type:'POST',
    url: '/api/follow/check',
    data: JSON.stringify(data),
    contentType : 'application/json'
  })
    .done(function(response){
      if (response.status === 'followed') {
        swapFollowBtn(true);
      } else if (response.status === 'unfollowed') {
        swapFollowBtn(false);
      }
    })
    .fail(function(error){
    //TODO server side error, pop modal
    });

}

function swapFollowBtn(bool) {
  if (bool) {
    $('.profile-button')
      .find('.follow-btn')
      .html('UNFOLLOW')
      .removeClass('hidden');
    $('.profile-button')
      .siblings()
      .css('margin-bottom', '0px')

  } else {
    $('.profile-button')
      .find('.follow-btn')
      .html('FOLLOW')
      .removeClass('hidden');
    $('.profile-button')
      .siblings()
      .css('margin-bottom', '0px')
  }
}

function updateModalFollowBtn(isFollowing) {
  if (isFollowing) {
    $(modalFollowBtnSelected).html('UNFOLLOW');
  } else {
    $(modalFollowBtnSelected).html('FOLLOW');
  }
}

//end follow block

function goToDonation() {
  if(profileUser.donationUrl){
    var newTab = window.open(profileUser.donationUrl, '_blank');
    newTab.focus();
  }
}

function displayHireMeModal() {
  $('#hire-me-modal')
    .modal('show');
}

function sendHireMeEmail() {
  var $hireMeModal = $('#hire-me-modal');
  var hireData = {
    profileUser       : profileUser,
    name              : $($hireMeModal).find('#hire-name').val(),
    email             : $($hireMeModal).find('#hire-email').val(),
    message           : $($hireMeModal).find('#project-description').val()
  };

  $hireMeModal
    .modal('hide');

  $.ajax({
    type: 'POST',
    url: '/api/users/hireme',
    data: JSON.stringify(hireData),
    contentType : 'application/json'
  })
    .done(function(response){
      // open dialog that says message has been sent or show message
    })
    .fail(function(error){
      $('#error-message-modal')
        .modal('show')
        .find('.error-modal-body')
        .html('Unable to send email. Please contact support');
    });
}

function bindSortAllVideos() {
  $('.sort-owner-all-list')
    .on('click', '.sort-owner-all-vuz', function(){
      requestVideoSort('vuz', profileUser._id);
    })
    .on('click', '.sort-owner-all-dasc', function(){
      requestVideoSort('dasc', profileUser._id);
    })
    .on('click', '.sort-owner-all-ddesc', function(){
      requestVideoSort('ddesc', profileUser._id);
    })
    .on('click', '.sort-owner-all-likes', function(){
      requestVideoSort('likes', profileUser._id);
    });
}

function bindHireMeFunction() {
  $('#hire-me-modal')
    .on('click', '#send-hire-me', sendHireMeEmail);
}

function openFollowing() {
  $('#following').children().remove();
  skip = 0;
  getMoreFollowing();
  //run ajax function to get following then
  $('#following-modal').modal('show');
}

function openFollowers() {
  $('#follower').children().remove();
  skip = 0;
  getMoreFollowers();
  //run ajax function to get following then
  $('#followers-modal').modal('show');
}

function getMoreFollowers() {
  var userId = profileUser._id;
  $.ajax({
    type:'GET',
    url:'/api/follow/get-followers',
    data:{userId: userId, skip: skip}
  })
  .done(function(followers) {
    followers.map(function(follower) {
      follower.userType = 'follower';
    });

    renderFollowers($('#follower'), followers, false);

    if(followers.length < 10) {
      $('.follower-btn-wrapper').hide();
    } else {
      $('.follower-btn-wrapper').show();
    }
    skip ++;

  })
  .fail(function(error) {
  })
}

function getMoreFollowing() {
  var userId = profileUser._id;
  $.ajax({
    type:'GET',
    url:'/api/follow/get-following',
    data:{userId: userId, skip: skip}
  })
    .done(function(followers) {
      followers.map(function(follower) {
        follower.userType = 'following';
      });

      renderFollowers($('#following'), followers, true);

      skip ++;
      if(followers.length < 10) {
        $('.following-btn-wrapper').remove();
      }
    })
    .fail(function(error) {
    })
}

/*
 * render the followers in the modal
 * @params{Element, Object, Boolean}
 */
function renderFollowers(el, data, showFollowBtn) {
  followTpl({
    follow: data
  }, function (err, html) {
    el.append(html);
  });

  if (user !== null) {
    if (user._id !== profileUser._id) {
      $('.follow-modal-button').remove();
    } else {
      if (!showFollowBtn) {
        $('.follow-modal-button').remove();
      }

      $('.follow-modal-button').on('click', function() {
        fUserId = this.getAttribute('data-id');
        modalFollowBtnClicked = true;
        modalFollowBtnSelected = this;
        updateFollow();
      });
    }
  } else {
    $('.follow-modal-button').remove();
  }
}

function initialize() {
  if (!profileVideos) {
    profileVideos = [];
  } else {
    allOwnerVideos = profileVideos;
    showcaseOwnerVideos = profileVideos;
  }
  
  $profilePage = $('#user-profile');
  $videoEditModal = $('#edit-video-modal');


  $('.profile-button')
    .on('click', '.follow-btn', updateFollow)
    .on('click', '.hire-btn', displayHireMeModal)
    .on('click', '.donate-btn', goToDonation);
  if (user) {
    //Logic for when viewing self
    userNameCheck = user._id;
    //check profile user
    if (userNameCheck === profileUser._id) {
      //render showcase in owner mode if user profile belongs to user
      renderOwnerShowcase(showcaseOwnerVideos);
      ownerShowcase({videos: showcaseOwnerVideos, s3Bucket: AmazonConfig.OUTPUT_URL}, function (err, html) {
        $('#showcase').html(html);
      });
      //render videos in owner mode if user profile belongs to user
      renderOwnerAllVideosHtml(allOwnerVideos);
      //allow profile edit if user profile belongs to user
      renderUserProfileEdit(profileUser);
      $('.edit-tab').removeClass('hidden');
    } else {
      //Logic for when viewing other profile
      if (profileUser.allowDonation) {
        $('.donate-btn').removeClass('hidden');
      }
      if (profileUser.allowHire) {
        $('.hire-btn').removeClass('hidden');
        bindHireMeFunction();
      }
      checkFollowStatus();
      bindSortAllVideos();
    }
  }

  renderSocialMediaLinks();
  $("[name='showcase-default']").bootstrapSwitch({
    size: 'mini'
  });
  bindEvents();
  getData();

  ga('send', 'event', 'profile page', 'viewing', 'viewing profile');
}

module.exports = {
  initialize: initialize
};