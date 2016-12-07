var namespace = 'app.routes.apiVersion.videoCollection1-0-0';
try {
    var log4js = require('log4js');
    var logger = log4js.getLogger(namespace);
    var videoCollCrud1_0_0 = require('../../persistence/crud/videoCollection1-0-0');
    var videoCrud1_0_0 = require('../../persistence/crud/videos1-0-0');

    if (global.NODE_ENV === "production") {
        logger.setLevel("INFO");
    }
}
catch (exception) {
    logger.error(" import error:" + exception);
}

function VideoCollection() {}

/**
 * Get all the featured videos as a json object
 * route: GET /api/featured-videos
 * @param res
 * @param req
 */
function getFeaturedVideos(req, res) {
    videoCollCrud1_0_0
        .getFeaturedVideos()
        .then(function (videos) {
            res.json(videos);
        });
}

/**
 * Update the featured video collection
 * route: PROTECTED PUT /api/featured-videos
 * @param res
 * @param req
 */
function updateFeaturedVideos (req, res) {
    videoCollCrud1_0_0
        .updateVideos('Featured Videos', req.body.videos)
        .then(function () {
            res.json({});
        });
}
/**
 * get all the videos in the staff pick video collection
 * route: GET /api/staff-pick-videos
 * @param req
 * @param res
 */
function getStaffPickVideos (req, res) {
    videoCollCrud1_0_0
        .getStaffPickVideos()
        .then(function (videos) {
            res.json(videos);
        });
}
/**
 * update staff pick videos
 * route: PROTECTED PUT /api/staff-pick-videos
 * @param req
 * @param res
 */
function updateStaffPickVideos (req, res) {
    videoCollCrud1_0_0
        .updateVideos('Staff Pick Videos', req.body.videos)
        .then(function () {
            res.json({});
        });
}

/**
 * check to see if the login user own the video that is being update
 * - currently admin can not update a user showcase
 * @param req
 * @private
 */
function _canUpdateShowcase(req) {
  var currentLoginUserId = req.user._id.toString();

  return videoCrud1_0_0.getById(req.params.videoId)
    .then(function (video) {
      // req.user._id = current login user
      // video.userId = owner
      return video.userId.toString() === currentLoginUserId && req.params.id === currentLoginUserId;
    });
}

function addVideoToUserShowcase(req, res, next) {
  var params = {
    user: req.params.id,
    video: req.params.videoId
  };

  _canUpdateShowcase(req)
    .then(function (canUpdate) {
      if (canUpdate) {
        return videoCollCrud1_0_0.addVideoToUserShowcase(params);
      }
      res.sendStatus(403);
    })
    .then(function () {
      res.sendStatus(200);
    })
    .catch(next);
}

function removeVideoFromUserShowcase(req, res, next) {
  var params = {
    user: req.params.id,
    video: req.params.videoId
  };

  _canUpdateShowcase(req)
    .then(function (canUpdate) {
      if (canUpdate) {
        return videoCollCrud1_0_0.removeVideoFromUserShowcase(params);
      }
      res.sendStatus(403);
    })
    .then(function () {
      res.sendStatus(200);
    })
    .catch(next);
}

function getUserShowcase(req, res) {
  var dataStatus = {};

  videoCollCrud1_0_0
    .getCollectionVideos(req.params.id, 'showcase')
    .then(function(videos) {
      dataStatus.status     = 'OK';
      dataStatus.code       = 200;
      dataStatus.data       = videos;
      res.send(dataStatus);
    })
    .catch(function (error) {
      dataStatus.status     = 'Fail';
      dataStatus.code       = 500;
      dataStatus.data       = error;
      res.send(dataStatus);
    });
}

VideoCollection.prototype.getFeaturedVideos         = getFeaturedVideos;
VideoCollection.prototype.updateFeaturedVideos      = updateFeaturedVideos;
VideoCollection.prototype.getStaffPickVideos        = getStaffPickVideos;
VideoCollection.prototype.updateStaffPickVideos     = updateStaffPickVideos;
VideoCollection.prototype.addVideoToUserShowcase    = addVideoToUserShowcase;
VideoCollection.prototype.removeVideoFromUserShowcase = removeVideoFromUserShowcase;
VideoCollection.prototype.getUserShowcase           = getUserShowcase;

module.exports = new VideoCollection();
