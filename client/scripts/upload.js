require('../styles/upload.css');

var Evaporate     = require('evaporate'),
    AmazonConfig  = require('./config/amazon.config.client'),
    identity      = require('./services/identity'),
    camera        = require('./services/camera'),
    drone         = require('./services/drone');

var thumbnailTpl = require('../templates/upload/thumbnail.dust');


var evaporate = new Evaporate({
  signerUrl : '/api/amazon/sign-auth',
  aws_key   : AmazonConfig.ACCESS_KEY,
  bucket    : AmazonConfig.INPUT_BUCKET,
  aws_url   : 'https://s3-us-west-2.amazonaws.com'
});


var $uploadPage,
    $progressbar,
    $processingMessage,
    $videoPreview,
    $thumbnails,
    currentUploadFile = {},
    intervalHandler,
    processingError,
    POLLING_INTERVAL_TIME = 20000; // 20 sec

function onProgress(progress) {
  currentUploadFile.progress = Math.round(progress * 10000) / 100;

  $progressbar.find('.progress-bar').text(currentUploadFile.progress + '%');
  $progressbar.find('.progress-bar').width(currentUploadFile.progress + '%');
}

function onUploadComplete() {
  $processingMessage.removeClass('hidden');

  $.ajax({
    url: '/api/amazon/transcode/start',
    contentType : 'application/json',
    type: 'POST',
    data: JSON.stringify({key: currentUploadFile.hashName})
  }).done(pollVideoStatus);
}

/**
 * Keep checking the server to see if the process success or fail
 */
function pollVideoStatus() {
  if (intervalHandler) {
    return;
  }

  intervalHandler = setTimeout(function () {
    $.ajax({
      url         : '/api/upload/' + currentUploadFile.hashName,
      contentType : 'application/json',
      type        : 'GET',
      data        : JSON.stringify({key: currentUploadFile.hashName})
    }).done(onTranscodeComplete)
      .fail(function () {
        processingError = true;
        // TODO: show dialog message - Unable to upload video. Try again or contact support
      })
      .always(function () {
        if (processingError === true) {
          clearTimeout(intervalHandler);
        }
      });
  }, POLLING_INTERVAL_TIME);
}

function onTranscodeComplete(response) {
  if (response === 'processing') {
    return;
  }

  $processingMessage.addClass('hidden');
  $progressbar.addClass('hidden');
  $videoPreview.removeClass('hidden');
  $videoPreview.find('video').attr('src', AmazonConfig.OUTPUT_URL + response.videoUrl);

  renderThumbnail(response.thumbnails);
}

function renderThumbnail(thumbnails) {
  thumbnailTpl({thumbnails: thumbnails, url: AmazonConfig.OUTPUT_URL}, function (err, html) {
    $thumbnails.html(html);
  });
}

function onError(message) {
  /********************************************************/
  console.group('%cError :', 'color:red;font:strait');
  console.log(message);
  console.groupEnd();
  /********************************************************/
}

function goToStep(step) {
  switch(step) {
    case 1:
      break;
    case 2:
      break;
    case 3:
      break;
  }
}

function getData() {
  camera.getAll()
    .then(function (cameras) {
      /********************************************************/
      console.group('%ccameras :', 'color:red;font:strait');
      console.log(cameras);
      console.groupEnd();
      /********************************************************/
    });

  drone.getAll()
    .then(function (drones) {
      /********************************************************/
      console.group('%cdrones :', 'color:red;font:strait');
      console.log(drones);
      console.groupEnd();
      /********************************************************/
    });
}

function initialize() {
  // If no user then redirect to home
  if (!identity.isAuthenticated()) {
    window.location.href = '/';
  }

  getData();

  $progressbar        = $('#progress-bar');
  $processingMessage  = $('#processing-message');
  $videoPreview       = $('#video-preview');
  $thumbnails         = $('#thumbnails');
  $uploadPage         = $('#upload-page');

  $uploadPage.on('click', '#publish-btn', function (event) {
    event.preventDefault();

    //return goToStep(3);

    var params = {
      title       : 'Title',
      videoPath   : 'VideoPath',
      tags        : ['drone', 'flying'],
      cameraType  : 'GoPro',
      droneType   : 'Phantom',
      categories  : 'News',
      description : 'Descriptions'
    };

    $.ajax({
      url         : '/api/videos',
      contentType : 'application/json',
      type        : 'POST',
      data        : params
    }).done(function () {
      goToStep(3);
    });

  });

  $uploadPage.on('click', '#file', function () {
    currentUploadFile = this.files[0];
    var data = JSON.stringify({file: {type: currentUploadFile.type, size: currentUploadFile.size, name: currentUploadFile.name}});

    $.ajax({
      url         : '/api/upload',
      contentType : 'application/json',
      type        : 'POST',
      data        : data
    }).done(function (hashName) {

      currentUploadFile.hashName = hashName;

      goToStep(2);

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
  });

  $uploadPage.on('click', '#thumbnail li', function () {

  });
}

module.exports = {
  initialize: initialize
};