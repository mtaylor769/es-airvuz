var io = require('socket.io')(),
  youtubedl = require('youtube-dl'),
  md5 = require('md5'),
  uuid = require('node-uuid');

var aws = require('./app/services/amazon.service.server');

function onConnected(socket) {

  /**
   * use youtubedl native to download the best quality video
   * @param url
   * @param path
   * @returns {Promise}
   */
  function downloadVideo(url, path) {
    return new Promise(function (resolve, reject) {
      youtubedl.exec(url, ['-f', 'best', '-o', path], {}, function (err) {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  }

  function onUploadExternalVideo(url) {
    var fileName = md5(Date.now() + uuid.v1()) + '.mp4';
    var videoPath = '/tmp/' + fileName;

    downloadVideo(url, videoPath)
      .then(function () {
        // let the user know we are transcoding but actually we are uploading to S3 then transcode
        socket.emit('upload:transcoding');

        return aws.copyVideoToS3({path: videoPath, fileName: fileName});
      })
      .then(function (video) {
        // TODO: change to create new preset?
        // current using custom preset
        return aws.startTranscode('1454691097318-4731nu', video)
          .then(function () {
            return video;
          });
      })
      .then(function (video) {
        socket.emit('upload:start-polling', video);
      })
      .catch(function (err) {
        socket.emit('upload:error', err);
      });
  }

  socket.on('upload:external', onUploadExternalVideo);
}

//////////////////////////////////////////////

io.on('connection', onConnected);

module.exports = io;
