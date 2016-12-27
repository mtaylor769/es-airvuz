require('bootstrap-tagsinput');
require('../../node_modules/bootstrap-tagsinput/dist/bootstrap-tagsinput.css');
var AmazonConfig  = require('./config/amazon.config.client'),
    identity      = require('./services/identity'),
    categories    = require('./services/category'),
    dialogs       = require('./services/dialogs'),
    utils         = require('./services/utils'),
    identity      = require('./services/identity'),
    categories    = require('./services/category'),
    dialogs       = require('./services/dialogs'),
    utils         = require('./services/utils'),
    AVEventTracker = require('./avEventTracker'),
    GoogleMap = require('../scripts/services/map');

var $uploadPage,
    $tags,
    currentUploadFile = {},
    intervalHandler,
    transcodeError,
    transcodeComplete,
    VIEW_MODEL = {},
    isUploadingVideo = false,
    isUploadingCustomThumbnail = false,
    POLLING_INTERVAL_TIME = 20000, // 20 sec
    customThumbnailName,
    isCustomThumbnail = false,
    uploadSource; // use to determine if upload is local, youtube, or vimeo

var mapMarkers = [];



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
  }).done(onDurationReturn);
}

function onCustomThumbnailUploadComplete(name) {
  $uploadPage.find('#custom-thumbnail-section .icon').addClass('hidden');
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
        dialogs.error("There's an error uploading. Please contact support");
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

  isUploadingVideo = false;
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
  require(['../templates/upload/thumbnail.dust'], function (thumbnailTpl) {
    thumbnailTpl({thumbnails: thumbnails, url: AmazonConfig.OUTPUT_URL}, function (err, html) {
      $uploadPage.find('#generated-thumbnails').html(html);
    });
  });
}

function onUploadError(params) {
  isUploadingVideo = false;

  var eventName = 'video-upload-failed:' + uploadSource;
  var eventNameAny = 'video-upload-failed:any';
  var eventParams = {
    codeSource: 'upload',
    eventName: eventName,
    eventType: 'uploadClick'
  };

  // * for external fail video
  // show url the user trying to upload
  if (params && params.url) {
    eventParams.data = {
      url: params.url
    }
  }

  if (uploadSource === 'local') {
    eventParams.data = {
      size: currentUploadFile.size // bytes
    }
  }

  _trackUploadEvent(eventName, eventNameAny, eventParams);

  dialogs.error("There's an error uploading. Please contact support");
}

function renderStep(step, video) {
  switch(step) {
    case 1:
      require(['../templates/upload/step-1.dust'], function (step1Tpl) {
        step1Tpl({}, function (err, html) {
          $uploadPage.html(html);
        });
      });

      break;
    case 2:
      require(['../templates/upload/step-2.dust', 'bootstrap-tagsinput'], function (step2Tpl) {
        step2Tpl(VIEW_MODEL, function (err, html) {
          $uploadPage.html(html);

          $tags = $('#tags');
          // initalize plugin
          $tags.tagsinput({
            // enter, commas, and space
            confirmKeys: [13, 188, 32]
          });

          initMap(document.getElementById('map'));

          // turn publish button disable back to false in case user want to upload another video
          $uploadPage.find('#btn-publish').prop('disabled', false);
        });
      });
      break;
    case 3:
      require(['./services/videoSocialShare', '../templates/social/videoSocialShare.dust', '../templates/upload/step-3.dust'], function (videoSocialShare, videoSocialShareTpl, step3Tpl) {
        step3Tpl({video: video, domain: window.location.hostname}, function (err, html) {
          $uploadPage.html(html);
        });

        videoSocialShareTpl({video: video}, function (err, html) {
          $uploadPage.find('.social-icons-container').html(html);
          videoSocialShare.setIconFontSize('md');
          videoSocialShare.removeColorOnHover(false);
          videoSocialShare.initialize(video);
          videoSocialShare.loadTwitterScript();
        });
      });
      break;
  }
}

function bindEvents() {
  function _isVimeo(url) {
    return url.indexOf('vimeo.com') > -1;
  }
  function onPublish(event) {
    event.preventDefault();
    var $btn = $(this);
    // isUploadVideo will prevent validation
    if (isUploadingCustomThumbnail /*|| isUploadingVideo*/) {
      return false;
    }
    $btn.prop('disabled', true);
    removeErrorMessage();

    var videoCoordsObj = {
      type: 'Point',
      name: $uploadPage.find('#location').val(),
      address: GoogleMap.getMarkerCoordinates().address || '',
      googlePlaceId: GoogleMap.getMarkerCoordinates().placeId || ''
    };

    // [-150, 0] - [lng, lt] : this is the default coordinates when user has no GPS turned on & there is no marker on the map
    var coords = GoogleMap.hasMarkerOnMap() ? [GoogleMap.getMarkerCoordinates().lng, GoogleMap.getMarkerCoordinates().lat] : [-150, 0];

    $.extend(videoCoordsObj, {coordinates: coords});
    
    var params = {
      title             : $uploadPage.find('#title').val(),
      videoLocation     : $uploadPage.find('#location').val(),
      videoPath         : currentUploadFile.videoPath,
      duration          : currentUploadFile.duration,
      categories        : $uploadPage.find('#selected-category-list li').map(function (index, li) {
                            return $(li).data('id');
                          }).toArray(),
      thumbnailPath     : currentUploadFile.thumbnailPath,
      isCustomThumbnail : isCustomThumbnail,
      customThumbnail   : customThumbnailName,
      hashName          : currentUploadFile.hashName,
      description       : $uploadPage.find('#description').val().replace(/(?:\r\n|\r|\n)/g, '<br />'),
      userId            : identity._id,
      loc               : videoCoordsObj
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

    $.ajax({
      url         : '/api/videos',
      contentType : 'application/json',
      type        : 'POST',
      data        : JSON.stringify(params)
    }).done(function (video) {
      renderStep(3, video);
      var eventName = 'video-upload-published:' + uploadSource;
      var eventNameAny = 'video-upload-published:any';
      var eventParams = {
        codeSource: 'upload',
        eventName: eventName,
        eventType: 'uploadClick',
        videoId: video._id
      };

      _trackUploadEvent(eventName, eventNameAny, eventParams);

    }).fail(function(response) {
      if (response.status === 400) {
        dialogs.required();
        appendErrorMessage(response.responseJSON.error);
      }
      $btn.prop('disabled', false);
    });
  }

  function onFileChange() {
    currentUploadFile = this.files[0];
    uploadSource = 'local';
    var data = {file: {type: currentUploadFile.type, size: currentUploadFile.size, name: currentUploadFile.name}};

    require(['./services/evaporate'], function (evaporate) {
      $.ajax({
        url         : '/api/upload',
        contentType : 'application/json',
        type        : 'POST',
        data        : JSON.stringify(data)
      }).done(function (hashName) {
        isUploadingVideo = true;
        currentUploadFile.hashName = hashName;
        var eventName = 'video-upload-started:' + uploadSource;
        var eventNameAny = 'video-upload-started:any';
        var eventParams = {
          codeSource: 'upload',
          eventName: eventName,
          eventType: 'uploadFileDrop'
        };
        _trackUploadEvent(eventName, eventNameAny, eventParams);

        renderStep(2);

        evaporate.upload({
          // headers
          contentType: currentUploadFile.type || 'binary/octet-stream',
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
    });
  }

  function onCustomFileChange() {
    var customThumbnailFile = this.files[0];

    if (customThumbnailFile.size === 0) {
      AVEventTracker({
        codeSource: 'upload',
        eventName: 'video-upload-custom-thumbnail-invalid-file-size',
        imgFileType: customThumbnailFile.type,
        eventType: 'uploadClick'
      });
      ga('send', 'event', 'upload', 'video-upload-custom-thumbnail-invalid-file-size', 'upload');
      fbq('trackCustom', 'video-upload-custom-thumbnail-invalid-file-size');
    }

    if (!utils.isImage(customThumbnailFile)) {
      AVEventTracker({
        codeSource: 'upload',
        eventName: 'video-upload-custom-thumbnail-invalid-file-type',
        imgFileType: customThumbnailFile.type,
        eventType: 'uploadClick'
      });
      ga('send', 'event', 'upload', 'video-upload-custom-thumbnail-invalid-file-type', 'upload');
      fbq('trackCustom', 'video-upload-custom-thumbnail-invalid-file-type');

      return dialogs.error('Invalid file type. Please select a jpg or gif file.');
    }

    $uploadPage.find('.custom-thumbnail-display').css('background-image', 'none');
    $uploadPage.find('#custom-thumbnail-section .icon').removeClass('hidden');

    isUploadingCustomThumbnail = true;

    require(['./services/evaporate'], function (evaporate) {
      // add Date.now() incase the user reupload again.
      // without it the image won't change or reload because it is the same name
      customThumbnailName = 'tn_custom-' + currentUploadFile.hashName + '-' + Date.now() + '.' + customThumbnailFile.name.split('.')[1].toLowerCase();

      evaporate.upload({
        // headers
        contentType: customThumbnailFile.type || 'binary/octet-stream',
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
          isUploadingCustomThumbnail = false;
        },
        error: function () {
          onUploadError();
          isUploadingCustomThumbnail = false;
        }
      }, 'temp');
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
    if (isUploadingVideo) {
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

    uploadSource = _isVimeo(url) ? 'vimeo' : 'youtube';

    var eventName = 'video-upload-started:' + uploadSource;
    var eventNameAny = 'video-upload-started:any';
    var eventParams = {
      codeSource: 'upload',
      eventName: eventName,
      eventType: 'uploadClick'
    };
    _trackUploadEvent(eventName, eventNameAny, eventParams);

    isUploadingVideo = true;

    renderStep(2);

    $.ajax({
      url: '/api/upload-external',
      contentType : 'application/json',
      type: 'POST',
      data: JSON.stringify({url: url})
    }).done(onStartPolling)
      .fail(function () {
        onUploadError({url: url});
      });

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

/**
 * track upload event
 * @param eventName
 * @param eventNameAny
 * @param eventParams
 * @private
 */
function _trackUploadEvent(eventName, eventNameAny, eventParams) {
  AVEventTracker(eventParams);
  ga('send', 'event', 'upload', eventName, 'upload');
  ga('send', 'event', 'upload', eventNameAny, 'upload');
  eventParams.eventName = eventNameAny;
  AVEventTracker(eventParams);
  fbq('trackCustom', eventName);
}

function initMap(dom) {
  GoogleMap.init({
    dom: dom,
    editMode: false
  });
}

function initialize() {
  // If no user then redirect to home
  if (!identity.isAuthenticated()) {
    window.location.href = '/';
  }

  $uploadPage = $('#upload-page');

  categories.getByRoles()
    .then(function (categories) {
      VIEW_MODEL.categories = categories;
    });

  bindEvents();
}

module.exports = {
  initialize: initialize
};