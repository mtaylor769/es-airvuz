/**
 * External library
 */
require('bootstrap-tagsinput');
require('../../node_modules/bootstrap-tagsinput/dist/bootstrap-tagsinput.css');

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
var userShowcase          = require('../templates/userProfile/showcase-user.dust');
var ownerShowcase         = require('../templates/userProfile/showcase-owner.dust');
var userAllVideosHtml     = require('../templates/userProfile/allvideos-user.dust');
var ownerAllVideosHtml    = require('../templates/userProfile/allvideos-owner.dust');
var userProfileEdit       = require('../templates/userProfile/edit-profile.dust');
var aboutMe               = require('../templates/userProfile/about.dust');
var userInfo              = require('../templates/userProfile/user-info.dust');
var videoInfo             = require('../templates/userProfile/edit-video.dust');
var thumbnailTpl          = require('../templates/upload/thumbnail.dust');

var okHtml                = '<div class="ok showcase-edit-button"><span class="glyphicon glyphicon-ok"></span></div>';
var notSelectedHtml       = '<div class="not-selected showcase-edit-button"><span class="glyphicon glyphicon-plus"></span></div>';
var removeHtml            = '<div class="removed showcase-edit-button"><span class="glyphicon glyphicon-minus"></span></div>';


function showcaseAdd(videoId) {
  console.log(videoId);
  var data = {};
  data.video = videoId;
  data.user = user._id;

  $.ajax({
    type: 'POST',
    url: '/api/video-collection/update-collection',
    data: data
  })
    .success(function(response) {
      console.log('response : ' + response);
    })
    .error(function(error) {
      console.log('error : ' + error);
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
  function onProfileImageChange() {
    var image = this.files[0],
        hashName = md5(image.name + Date.now()) + '.' +  image.name.split('.')[1],
        path = 'users/profile-pictures/';

    uploadImage({
      image: image,
      fileName: path + hashName,
      onComplete: function () {
        // do request to save hashName to database
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
      }
    });
  }

  function onUploadError() {
    $('#error-message-modal')
      .modal('show')
      .find('.error-modal-body')
      .html('Error uploading iamge');
  }

  $('#edit-showcase').on('click', editShowcase);
  $profilePage
    .on('change', '#profile-image-input', onProfileImageChange)
    .on('change', '#cover-image-input', onCoverImageChange)
    .on('click', '.showcase-edit-button', showcaseButton)
    .on('click', '#save-edit-btn', changeProfile)
    .on('click', '#change-password-btn', changePassword);

  $videoEditModal
    .on('change', '#category', onCategorySelect)
    .on('change', '#custom-image-file', onCustomFileChange)
    .on('click', '#selected-category-list li', onCategoryRemove)
    .on('click', '#btn-custom-thumbnail', onCustomThumbnailClick)
    .on('click', '#generated-thumbnails li', onThumbnailSelect)
    .on('click', '#btn-cancel-custom-thumbnail', onCancelCustomThumbnailClick)
    .on('click', '#btn-save-video-edit', onSaveVideoEdit);

    $(window).on('resize', function() {
      var windowWidth = $(window).width();
      var isActive = $('#about').hasClass('active');
      if(windowWidth >= 992 && isActive) {
        $('#showcase-tab').click();
      }
    });

  function showcaseButton() {
    console.log('running function');
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
    console.log('running function');
    var buttonDiv = $(this).parent();
    console.log(buttonDiv.attr('data-videoid'));
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
    .modal('show')
    .on('click', '#new-password-btn', confirmPasswordChange);
}

function confirmPasswordChange() {
  event.preventDefault();
  var data                  = {};
  data.oldPassword          = $("#old-password").val();
  data.newPassword          = $("#new-password").val();
  data.confirmPassword      = $("#confirm-password").val();

  if(!data.oldPassword || data.oldPassword === '') {
    console.log('Please enter in current password');
    return false;
  }
  if(data.newPassword === '' || data.newPassword !== data.confirmPassword) {
    console.log('New Password Invalid');
    return false;
  } 
  $.ajax({
    type:'PUT',
    url: '/api/users/' + user._id,
    data: data
  })
  .success(function(response) {
    if(response.status==='OK') {
      user = response.data;

    } else {
      console.log(response);
      
    }
  })
  .error(function(error) {

  });
  $('#change-password').modal('hide');

}

function changeProfile() {
  $('#save-changes').modal('show');
  $('#save-changes')
    .on('click', '#save-changes-btn', editProfile);
}

function editProfile() {
  var userName            = $("#username").val();
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

  userData = {
    firstName             : firstName,
    lastName              : lastName,
    aboutMe               : myAbout,
    allowDonation         : allowDonation,
    allowHire             : allowHire
  }

  if (userName && userName !== profileUser.userName) {
    userData.userName = userName;
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
    if (check == -1 && (typeof(paypal) !== 'undefined') && paypal !== null) {
      errorMsg = 'Invalid donation URL';
      sendData = false;
      //this means the url does not contain the word paypal
    } else if ((allowPp === true) && (typeof(paypal) == 'undefined' || paypal === null)) {
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



  if (allowDonation) {
    $('.donate-btn').show();
  } else {
    $('.donate-btn').hide();
  }

  if (allowHire) {
    $('.hire-btn').show();
  } else {
    $('.hire-btn').hide();
  }

  if (sendData) {
    $.ajax({
      type:'PUT',
      url: '/api/users/' + user._id,
      data: JSON.stringify(userData),
      contentType : 'application/json'
    })
      .done(function(response) {
        if (response.statusCode === 500) {
          //handle error
        } else {
          user = response;
          $('#save-changes').modal('hide');
          $('#confirmation-message-modal')
            .modal('show')
            .find('.confirm-modal-body')
            .html('Changes have been saved.');
        }
      })
      .error(function(error) {
        $('#save-changes').modal('hide');
        $('#error-message-modal')
          .modal('show')
          .find('.error-modal-body')
          .html(error);
      });
  } else {
    $('#save-changes').modal('hide');
    $('#error-message-modal')
      .modal('show')
      .find('.error-modal-body')
      .html(errorMsg);
  }

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
  }).success(function (video) {
    location.reload();
  })
    .error(function(error){
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
  .success(function(data) {
    if (data.status==='OK') {
      if(userNameCheck === profileUser.userName) {
        renderOwnerAllVideosHtml(data.data);
      } else {
        renderUseAllVideosHtml(data.data);
      }
    } else {
      console.log('server side error' + data.data);
    }
  })
  .error(function(error) {
    console.log('error : ' + error);
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
  .success(function(data) {
    if (data.status==='OK') {
      ownerShowcase({videos: data.data}, function(err, html) {
        $('#allvideos').html(html);
      });
    } else {
      console.log('server side error' + data.data);
    }
  })
  .error(function(error) {
    console.log('error : ' + error);
  });
}

function showcaseByVuz() {
  sortShowcase('vuz', profileUser._id);
}

function showcaseByDasc() {
  sortShowcase('dasc', profileUser._id);
}

function showcaseByDdesc() {
  sortShowcase('ddesc', profileUser._id);
}

function showcaseByLikes() {
  sortShowcase('likes', profileUser._id);
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
          .success(function(data){
            defer.resolve(data);
          })
          .error(function(error){
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

  if ($categoryList.find('li').size() < 3) {
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
  // var url = AmazonConfig.OUTPUT_URL;
  var url = '//s3-us-west-2.amazonaws.com/airvuz-drone-video/';
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
  /********************************************************/
  console.group('%cError :', 'color:red;font:strait');
  console.log(message);
  console.groupEnd();
  /********************************************************/
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

function renderOwnerAllVideosHtml(videos) {
  ownerAllVideosHtml({videos: videos}, function(err, html) {
    renderAllVideos(html);
  });
}

function renderUseAllVideosHtml(videos) {
  userAllVideosHtml({videos: videos}, function(err, html) {
    renderAllVideos(html);
  });
}

function renderOwnerShowcase(videos) {
  ownerShowcase({videos: videos}, function(err, html) {
    $('#allvideos').html(html);
  });
  // $('.sort-showcase')
  //   .on('click', '.sort-showcase-vuz', sortShowcase('vuz', profileUser._id))
  //   .on('click', '.sort-showcase-dasc', sortShowcase('dasc', profileUser._id))
  //   .on('click', '.sort-showcase-ddesc', sortShowcase('ddesc', profileUser._id))
  //   .on('click', '.sort-showcase-likes', sortShowcase('likes', profileUser._id));
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
      //TODO display input for donate url
      $('#donateUrl').show();
    } else {
      $('#donateUrl').hide();
    }
  });
  renderSocialMediaLinks();
}

function renderSocialMediaLinks() {
  var $socialMedia = $('.user-social-media');
  var $editProfile = $('.edit-profile');
  if (profileUser.socialMediaLinks.length===0) {
    $('.user-social-media').find('a').hide();
  }
  profileUser.socialMediaLinks.forEach(function(account){
    switch (account.socialType) {
      case "FACEBOOK" :
        if (account.url && account.url !== '') {
          $socialMedia.find('.facebook')
            .show()
            .attr('href', account.url);
          $editProfile.find('#facebook').val(account.url)
        } else {
          $socialMedia.find('.facebook').hide();
        }
        break;
      case 'GOOGLE+' :
        if (account.url && account.url !== '') {
          $socialMedia.find('.google').show()
            .show()
            .attr('href', account.url);
          $editProfile.find('#googleplus').val(account.url);
        } else {
          $socialMedia.find('.google').hide();
        }
        break;
      case 'INSTAGRAM' :
        if (account.url && account.url !== '') {
          $socialMedia.find('.instagram').show()
            .show()
            .attr('href', account.url);
          $editProfile.find('#instagram').val(account.url);
        } else {
          $socialMedia.find('.instagram').hide();
        }
        break;
      case 'TWITTER' :
        if (account.url && account.url !== '') {
          $socialMedia.find('.twitter').show()
            .show()
            .attr('href', account.url);
          $editProfile.find('#twitter').val(account.url);
        } else {
          $socialMedia.find('.twitter').hide();
        }
        break;
      default : console.log('nothing happens');
    };
  });
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

function updateFollow() {
  var followData = {
    follow : {
      userId : user._id,
      followingUserId : profileUser._id
    },
    notification : {
      notificationType : 'FOLLOW',
      notificationMessage : 'started following you',
      actionUserId : user._id,
      notifiedUserId : profileUser._id
    }
  };

  $.ajax({
    type:'POST',
    url: '/api/follow',
    data: {data: JSON.stringify(followData)}
  })
    .done(function(response){
      if(response.status === 'followed') {
        swapFollowBtn(true);
        AVEventTracker({
          codeSource	: "videoPlayer",
          eventName		: "followedUser",
          eventType		: "click"
        });
        $('#follow').text('-');
      } else if(response.status === 'unfollowed'){
        swapFollowBtn(false);
          AVEventTracker({
            codeSource	: "videoPlayer",
            eventName		: "unfollowedUser",
            eventType		: "click"
          });
      //TODO Update current profile page with new amount of followers
    }})
    .error(function(error){
      $('#error-message-modal')
        .modal('show')
        .find('.error-modal-body')
        .html('Error ' + errorMsg);
    });
}

function swapFollowBtn(bool) {
  if (bool) {
    $('.profile-options')
      .find('.follow-btn')
      .html('UNFOLLOW');
  } else {
    $('.profile-options')
      .find('.follow-btn')
      .html('FOLLOW');
  }
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
    //TODO set user.following to true or false depending if following profileUser or not
      if (response.status === 'followed') {
        swapFollowBtn(true);
      } else if (response.status === 'unfollowed') {
        swapFollowBtn(false);
      }
      console.log(response);
    })
    .error(function(error){
    //TODO server side error, pop modal
      console.log(error);
    });

}

function initialize() {
  /*
  *Null check on page dependent variables:
  *profileVideos
  *user
  */
  if (user) {
    userNameCheck = user.userName;
  }
  if (!profileVideos) {
    profileVideos = [];
  } else {
    allOwnerVideos = profileVideos;
    showcaseOwnerVideos = profileVideos;
  }

  $profilePage = $('#user-profile');
  $videoEditModal = $('#edit-video-modal');
  // userInfo({user: profileUser}, function(err, html){
  //   $("#userInfoData").html(html);
  // });
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

  $('.profile-options')
    .on('click', '.follow-btn', updateFollow);
  
  if(userNameCheck === profileUser.userName) {
    renderOwnerShowcase(showcaseOwnerVideos);
    ownerShowcase({videos: showcaseOwnerVideos}, function (err, html) {
      $('#showcase').html(html);
    });
    renderOwnerAllVideosHtml(allOwnerVideos);
    aboutMe({user: profileUser}, function(err, html){
      $("#about-me-section").html(html);
    });
    renderUserProfileEdit(profileUser);
    $('.edit-tab').show();

    $('.profile-options')
      .find('.follow-btn')
      .hide();
    
  } else {
    $('.edit-tab').hide();
    //TODO check to see if following

    checkFollowStatus();
  }
  renderSocialMediaLinks();
  $("[name='showcase-default']").bootstrapSwitch({
    size: 'mini'
  });
  console.log('initalize');
  bindEvents();
  getData();
}

module.exports = {
  initialize: initialize
}