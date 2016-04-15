var Evaporate     = require('evaporate'),
    AmazonConfig  = require('./config/amazon.config.client');

var evaporate = new Evaporate({
  signerUrl : '/api/amazon/sign-auth',
  aws_key   : AmazonConfig.ACCESS_KEY,
  bucket    : AmazonConfig.INPUT_BUCKET,
  aws_url   : 'https://s3-us-west-2.amazonaws.com'
});


var $progressbar,
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

  updateThumbnail(response.thumbnails);
}

function updateThumbnail(thumbnails) {
  var html = '';
  thumbnails.forEach(function (thumbnail, index) {
    html += '<li><input type="checkbox" id="tn'+ index +'"><label style="background-image: url('+ AmazonConfig.OUTPUT_URL + thumbnail +')" for="tn'+ index +'"></label></li>'
  });

  $thumbnails.find('ul').html(html);
  $thumbnails.removeClass('hidden');
}

function onError(message) {
  /********************************************************/
  console.group('%cError :', 'color:red;font:strait');
  console.log(message);
  console.groupEnd();
  /********************************************************/
}

function goToStep(step) {
  $('#step-1, #step-2, #step-3').addClass('hidden');
  $('#step-' + step).removeClass('hidden');
}

function initialize() {
  $progressbar        = $('#progress-bar');
  $processingMessage  = $('#processing-message');
  $videoPreview       = $('#video-preview');
  $thumbnails         = $('#thumbnails');

  $('#publish-btn').on('click', function (event) {
    event.preventDefault();

    return goToStep(3);

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
  $('#file').on('change', function () {
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
}

module.exports = {
  initialize: initialize
};