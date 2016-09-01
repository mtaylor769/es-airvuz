/* global Page */
require('bootstrap-tagsinput');
require('../../node_modules/bootstrap-tagsinput/dist/bootstrap-tagsinput.css');

require('../styles/upload.css');

var Evaporate     = require('evaporate'),
    AmazonConfig  = require('./config/amazon.config.client'),
    identity      = require('./services/identity'),
    camera        = require('./services/camera'),
    drone         = require('./services/drone'),
    categories    = require('./services/category'),
    dialogs    = require('./services/dialogs');
    videoSocialShare     = require('./services/videoSocialShare');

/**
 * Templates
 */
var thumbnailTpl = require('../templates/upload/thumbnail.dust');
var step1Tpl = require('../templates/upload/step-1.dust');
var step2Tpl = require('../templates/upload/step-2.dust');
var step3Tpl = require('../templates/upload/step-3.dust');
var videoSocialShareTpl = require('../templates/social/videoSocialShare.dust');

var $uploadPage,
    $tags,
    currentUploadFile = {},
    intervalHandler,
    transcodeError,
    transcodeComplete,
    VIEW_MODEL = {},
    isUploading = false,
    POLLING_INTERVAL_TIME = 20000, // 20 sec
    customThumbnailName,
    isCustomThumbnail = false,
    isPublishing = false;

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


function onProgress(progress) {
  currentUploadFile.progress = Math.round(progress * 10000) / 100;

  $uploadPage.find('.progress-bar')
    .text(currentUploadFile.progress + '%')
    .width(currentUploadFile.progress + '%');
}

function onDurationReturn(duration) {
  currentUploadFile.duration = duration;
}

function onUploadComplete() {
  $uploadPage.find('#processing-message').removeClass('hidden');

  $.ajax({
    url: '/api/amazon/transcode/start',
    contentType : 'application/json',
    type: 'POST',
    data: JSON.stringify({key: currentUploadFile.hashName})
  }).done(pollVideoStatus);

  getVideoDuration();
}

/**
 * get video duration
 * - Note: * this is required to be call for local upload / youtube / and vimeo
 */
function getVideoDuration() {
  $.ajax({
    url: '/api/amazon/video-duration',
    contentType : 'application/json',
    type: 'GET',
    data: {key: currentUploadFile.hashName}
  }).done(onDurationReturn)
}

function onCustomThumbnailUploadComplete(name) {
  $uploadPage.find('#custom-thumbnail-section .fa').addClass('hidden');
  $uploadPage.find('.custom-thumbnail-display').css('background-image', 'url(//s3-us-west-2.amazonaws.com/airvuz-tmp/' + name +')');
}

/**
 * Keep checking the server to see if the process success or fail
 */
function pollVideoStatus() {
  if (intervalHandler) {
    return;
  }

  intervalHandler = setInterval(function () {
    $.ajax({
      url         : '/api/upload/' + currentUploadFile.hashName,
      contentType : 'application/json',
      type        : 'GET'
    }).done(onTranscodeComplete)
      .fail(function () {
        transcodeError = true;
        //console.log('******************** Error: transcode ********************');
        // TODO: show dialog message - Unable to upload video. Try again or contact support
      })
      .always(function () {
        if (transcodeError === true || transcodeComplete === true) {
          clearTimeout(intervalHandler);
          intervalHandler = null;
          transcodeError = false;
          transcodeComplete = false;
        }
      });
  }, POLLING_INTERVAL_TIME);
}

function onTranscodeComplete(response) {
  if (response === 'processing') {
    return;
  }

  isUploading = false;
  transcodeComplete = true;

  $uploadPage.find('#processing-message').addClass('hidden');
  $uploadPage.find('#progress-bar').addClass('hidden');
  $uploadPage.find('#video-preview').removeClass('hidden')
    .find('video')
    .attr('src', AmazonConfig.OUTPUT_URL + response.videoUrl);

  currentUploadFile.videoPath = response.videoUrl;

  renderThumbnail(response.thumbnails);
}

function renderThumbnail(thumbnails) {
  thumbnailTpl({thumbnails: thumbnails, url: AmazonConfig.OUTPUT_URL}, function (err, html) {
    $uploadPage.find('#generated-thumbnails').html(html);
  });
}

function onUploadError(message) {
  isUploading = false;
  console.log('******************** message ********************');
  console.log(message);
  console.log('************************************************');
  dialogs.error("There's an error uploading. Please contact support");
}

function renderStep(step, video) {
  switch(step) {
    case 1:
      step1Tpl({}, function (err, html) {
        $uploadPage.html(html);
      });
      break;
    case 2:
      step2Tpl(VIEW_MODEL, function (err, html) {
        $uploadPage.html(html);

        $tags = $('#tags');
        // initalize plugin
        $tags.tagsinput({
          // enter, commas, and space
          confirmKeys: [13, 188, 32]
        });
      });
      break;
    case 3:
      step3Tpl({video: video, domain: window.location.hostname}, function (err, html) {
        $uploadPage.html(html);
      });

      videoSocialShareTpl({video: video}, function (err, html) {
        $uploadPage.find('.social-icons-container').html(html);
        videoSocialShare.setIconFontSize('md');
        videoSocialShare.removeColorOnHover(false);
        videoSocialShare.initialize(video);
      });
      break;
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

  categories.getByRoles()
    .then(function (categories) {
      VIEW_MODEL.categories = categories;
    });
}

function bindEvents() {

  function onPublish(event) {
    event.preventDefault();
    if (isPublishing) {
      return false;
    }
    removeErrorMessage();
    
    var params = {
      title             : $uploadPage.find('#title').val(),
      videoLocation     : $uploadPage.find('#location').val(),
      videoPath         : currentUploadFile.videoPath,
      duration          : currentUploadFile.duration,
      cameraType        : $uploadPage.find('#camera-type').val(),
      droneType         : $uploadPage.find('#drone-type').val(),
      categories        : $uploadPage.find('#selected-category-list li').map(function (index, li) {
                            return $(li).data('id');
                          }).toArray(),
      thumbnailPath     : currentUploadFile.thumbnailPath,
      isCustomThumbnail : isCustomThumbnail,
      customThumbnail   : customThumbnailName,
      hashName          : currentUploadFile.hashName,
      description       : $uploadPage.find('#description').val().replace(/(?:\r\n|\r|\n)/g, '<br />'),
      userId            : identity._id
    };

    if ($tags.val()) {
      params.tags = $tags.val().split(',');
    }
    
    if (params.isCustomThumbnail && !params.customThumbnail) {
      dialogs.required();
      return appendErrorMessage([{
        sourceError: '#custom-image-file',
        displayMsg: 'Require custom thumbnail'
      }]);
    }
    
    isPublishing = true;
    $.ajax({
      url         : '/api/videos',
      contentType : 'application/json',
      type        : 'POST',
      data        : JSON.stringify(params)
    }).done(function (video) {
      renderStep(3, video);
    }).fail(function(response) {
      if (response.status === 400) {
        dialogs.required();
        appendErrorMessage(response.responseJSON.error);
      }
    }).always(function () {
      isPublishing = false;
    });
  }

  function onFileChange() {
    currentUploadFile = this.files[0];
    var data = {file: {type: currentUploadFile.type, size: currentUploadFile.size, name: currentUploadFile.name}};

    var evaporate = new Evaporate({
      signerUrl : '/api/amazon/sign-auth',
      aws_key   : AmazonConfig.ACCESS_KEY,
      bucket    : AmazonConfig.INPUT_BUCKET,
      aws_url   : 'https://s3-us-west-2.amazonaws.com',

      partSize  : 200 * 1024 * 1024,
      logging   : !IS_PRODUCTION
    });

    $.ajax({
      url         : '/api/upload',
      contentType : 'application/json',
      type        : 'POST',
      data        : JSON.stringify(data)
    }).done(function (hashName) {
      isUploading = true;
      currentUploadFile.hashName = hashName;

      renderStep(2);

      evaporate.add({
        // headers
        contentType: currentUploadFile.type || 'binary/octet-stream',
        headersCommon: {
          'Cache-Control': 'max-age=3600'
        },
        signHeaders: {
          Authorization: 'Bearer ' + identity.getToken()
        },
        // filename, relative to bucket
        name: currentUploadFile.hashName + '.mp4',
        // content
        file: currentUploadFile,
        // event callbacks
        complete: onUploadComplete,
        progress: onProgress,
        error: onUploadError
      });
    });
  }

  function onCustomFileChange() {
    var customThumbnailFile = this.files[0];

    $uploadPage.find('.custom-thumbnail-display').css('background-image', 'none');
    $uploadPage.find('#custom-thumbnail-section .fa').removeClass('hidden');

    var evaporate = new Evaporate({
      signerUrl : '/api/amazon/sign-auth',
      aws_key   : AmazonConfig.ACCESS_KEY,
      bucket    : AmazonConfig.TEMP_BUCKET,
      aws_url   : 'https://s3-us-west-2.amazonaws.com',
      partSize  : 200 * 1024 * 1024,
      logging   : !IS_PRODUCTION
    });

    // add Date.now() incase the user reupload again.
    // without it the image won't change or reload because it is the same name
    customThumbnailName = 'tn_custom-' + currentUploadFile.hashName + '-' + Date.now() + '.' + customThumbnailFile.name.split('.')[1];

    evaporate.add({
      // headers
      contentType: customThumbnailFile.type || 'binary/octet-stream',
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

  function onThumbnailSelect() {
    $(this)
      .addClass('active')
      .parent()
      .find('li.active')
      .not(this).removeClass('active');

    currentUploadFile.thumbnailPath = $(this).data('url');
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
    var $categoryList = $uploadPage.find('#selected-category-list');

    if ($categoryList.find('li').length < 3) {
      $categoryList.append(list);
    } else {
      $uploadPage.find('#category-message').text('Max catgories');

      setTimeout(function () {
        $uploadPage.find('#category-message').text('');
      }, 2000);
    }
  }

  function onCategoryRemove() {
    $(this).remove();
  }

  function onUploadAgain() {
    isCustomThumbnail = false;
    customThumbnailName = null;
    renderStep(1);
  }

  function onBeforeUnload() {
    if (isUploading) {
      // browser doesn't actually use this message.
      return 'You are current uploading video or transcoding. Do you want to cancel?';
    }
  }

  function onCustomThumbnailClick(event) {
    event.preventDefault();
    toggleThumbnailLayout(true);
  }

  function onCancelCustomThumbnailClick(event) {
    event.preventDefault();
    toggleThumbnailLayout(false);
  }

  /**
   * toggle thumbnail layout
   */
  function toggleThumbnailLayout(isCustom) {
    $uploadPage.find('#custom-thumbnail')[isCustom ? 'addClass' : 'removeClass']('hidden');
    $uploadPage.find('#custom-thumbnail-section')[isCustom ? 'removeClass' : 'addClass']('hidden');
    $uploadPage.find('#generated-thumbnails')[isCustom ? 'addClass' : 'removeClass']('hidden');
    isCustomThumbnail = isCustom;
  }

  function onUploadExternalUrlClick(event) {
    event.preventDefault();
    var url = $uploadPage.find('#external-url-input').val();

    // TODO: validate url to make sure it is youtube or vimeo
    // url input is empty
    if (!url) {
      return;
    }

    isUploading = true;

    renderStep(2);

    $.ajax({
      url: '/api/upload-external',
      contentType : 'application/json',
      type: 'POST',
      data: JSON.stringify({url: url})
    }).done(onStartPolling)
      .fail(onUploadError);

    // fake uploading bar
    var percentage = 0;
    var handle = setInterval(function () {
      percentage += 2;

      $uploadPage.find('.progress-bar')
        .text(percentage + '%')
        .width(percentage + '%');

      if (percentage === 100) {
        clearInterval(handle);
        $uploadPage.find('#processing-message').removeClass('hidden');
      }
    }, 100);
  }

  function onStartPolling(video) {
    currentUploadFile.hashName = video.replace('.mp4', '');
    getVideoDuration();
    pollVideoStatus();
  }

  //////////////////////////////////////////

  $uploadPage
    .on('change', '#category', onCategorySelect)
    .on('change', '#file', onFileChange)
    .on('change', '#custom-image-file', onCustomFileChange)
    .on('click', '#btn-publish', onPublish)
    .on('click', '#generated-thumbnails li', onThumbnailSelect)
    .on('click', '#selected-category-list li', onCategoryRemove)
    .on('click', '#upload-again', onUploadAgain)
    .on('click', '#btn-custom-thumbnail', onCustomThumbnailClick)
    .on('click', '#btn-cancel-custom-thumbnail', onCancelCustomThumbnailClick)
    .on('click', '#btn-external-upload', onUploadExternalUrlClick);

  $(window).on('beforeunload', onBeforeUnload);

}

function initialize() {
  // If no user then redirect to home
  if (!identity.isAuthenticated()) {
    window.location.href = '/';
  }

  $uploadPage = $('#upload-page');

  getData();
  bindEvents();

  // DEBUG
  // setTimeout(function () {
  //  renderStep(2);
  // }, 500);
  //
  //var mockThumbnail = [
  //  '0032d3a9d5b9ad6e6a3d5384e0ca6f60/tn_00001.jpg',
  //  '0032d3a9d5b9ad6e6a3d5384e0ca6f60/tn_00002.jpg',
  //  '0032d3a9d5b9ad6e6a3d5384e0ca6f60/tn_00003.jpg',
  //  '0032d3a9d5b9ad6e6a3d5384e0ca6f60/tn_00004.jpg',
  //  '0032d3a9d5b9ad6e6a3d5384e0ca6f60/tn_00005.jpg',
  //  '0032d3a9d5b9ad6e6a3d5384e0ca6f60/tn_00006.jpg'
  //];
  //
  //setTimeout(function () {
  //  renderThumbnail(mockThumbnail);
  //}, 2000);
}

module.exports = {
  initialize: initialize
};