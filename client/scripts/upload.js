/* global Page */
require('../styles/upload.css');

var Evaporate     = require('evaporate'),
    AmazonConfig  = require('./config/amazon.config.client'),
    identity      = require('./services/identity'),
    camera        = require('./services/camera'),
    drone         = require('./services/drone'),
    category      = require('./services/category');

/**
 * Templates
 */
var thumbnailTpl = require('../templates/upload/thumbnail.dust');
var step1Tpl = require('../templates/upload/step-1.dust');
var step2Tpl = require('../templates/upload/step-2.dust');
var step3Tpl = require('../templates/upload/step-3.dust');

var $uploadPage,
    currentUploadFile = {},
    intervalHandler,
    transcodeError,
    transcodeComplete,
    VIEW_MODEL = {},
    evaporate,
    VIDEO_MODEL = {},
    POLLING_INTERVAL_TIME = 20000; // 20 sec

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

  $.ajax({
    url: '/api/amazon/video-duration',
    contentType : 'application/json',
    type: 'GET',
    data: {key: currentUploadFile.hashName}
  }).done(onDurationReturn)
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
        console.log('******************** Error: transcode ********************');
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
    $uploadPage.find('#thumbnails').html(html);
  });
}

function onError(message) {
  /********************************************************/
  console.group('%cError :', 'color:red;font:strait');
  console.log(message);
  console.groupEnd();
  /********************************************************/
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
      });
      break;
    case 3:
      step3Tpl({video: video, domain: window.location.hostname}, function (err, html) {
        $uploadPage.html(html);
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

  VIEW_MODEL.categories = Page.categories;
}

function bindEvents() {

  function onPublish(event) {
    event.preventDefault();

    //return renderStep(3); // DEBUG

    var params = {
      title           : $uploadPage.find('#title').val(),
      videoPath       : currentUploadFile.videoPath,
      tags            : ['drone', 'flying'],
      duration        : currentUploadFile.duration,
      cameraType      : $uploadPage.find('#camera-type').val(),
      droneType       : $uploadPage.find('#drone-type').val(),
      //categories      : currentUploadFile.thumbnailPath,
      thumbnailPath   : currentUploadFile.thumbnailPath,
      description     : $uploadPage.find('#description').val(),
      userId          : identity._id
    };

    $.ajax({
      url         : '/api/videos',
      contentType : 'application/json',
      type        : 'POST',
      data        : JSON.stringify(params)
    }).done(function (video) {
      renderStep(3, video);
    });

  }

  function onFileChange() {
    //return renderStep(2); // DEBUG

    currentUploadFile = this.files[0];
    var data = {file: {type: currentUploadFile.type, size: currentUploadFile.size, name: currentUploadFile.name}};

    $.ajax({
      url         : '/api/upload',
      contentType : 'application/json',
      type        : 'POST',
      data        : JSON.stringify(data)
    }).done(function (hashName) {

      currentUploadFile.hashName = hashName;

      renderStep(2);

      evaporate.add({
        // headers
        contentType: currentUploadFile.type || 'binary/octet-stream',
        headersCommon: {
          'Cache-Control': 'max-age=3600'
        },
        headersSigned: {
          'x-amz-acl': 'public-read'
        },
        // filename, relative to bucket
        name: currentUploadFile.hashName + '.mp4',
        // content
        file: currentUploadFile,
        // event callbacks
        complete: onUploadComplete,
        progress: onProgress,
        error: onError
      });
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
    var list = '<li>' + category.name + '</li>';
    var $categoryList = $uploadPage.find('#category-list');

    if ($categoryList.find('li').size() < 3) {
      $categoryList.append(list);
      if (VIDEO_MODEL.categories) {
        VIDEO_MODEL.categories.push(category._id);
      } else {
        VIDEO_MODEL.categories = [category._id];
      }
    } else {
      $uploadPage.find('#category-message').text('Max catgories').delay(500).text('');
    }
  }

  function onCategoryRemove() {
    $(this).remove();
  }

  function onUploadAgain() {
    renderStep(1);
  }

  //////////////////////////////////////////

  $uploadPage
    .on('click', '#publish-btn', onPublish)
    .on('change', '#file', onFileChange)
    .on('click', '#thumbnails li', onThumbnailSelect)
    .on('change', '#category', onCategorySelect)
    .on('click', '#category-list li', onCategoryRemove)
    .on('click', '#upload-again', onUploadAgain);

}

function initialize() {
  // If no user then redirect to home
  if (!identity.isAuthenticated()) {
    window.location.href = '/';
  }

  $uploadPage = $('#upload-page');

  evaporate = new Evaporate({
    signerUrl : '/api/amazon/sign-auth',
    aws_key   : AmazonConfig.ACCESS_KEY,
    bucket    : AmazonConfig.INPUT_BUCKET,
    aws_url   : 'https://s3-us-west-2.amazonaws.com'
  });

  getData();
  bindEvents();
}

module.exports = {
  initialize: initialize
};