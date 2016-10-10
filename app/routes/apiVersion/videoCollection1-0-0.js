var namespace = 'app.routes.apiVersion.videoCollection1-0-0';
try {
    var log4js = require('log4js');
    var logger = log4js.getLogger(namespace);
    var videoCollCrud1_0_0 = require('../../persistence/crud/videoCollection1-0-0');

    if (global.NODE_ENV === "production") {
        logger.setLevel("INFO");
    }
}
catch (exception) {
    logger.error(" import error:" + exception);
}

function VideoCollection() {
}
// function getVideos(req, res, type) {
//     return function (req, res) {
//         videoCollCrud1_0_0
//             .getVideo(type)
//             .then(function (videos) {
//                 res.json(videos);
//             });
//     }
// }
/**
 * Get all the featured videos as a json object
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

// function updateVideo(type) {
//     return function (req, res) {
//         return videoCollCrud1_0_0
//             .updateVideos(type, req.body.videos)
//             .then(function () {
//                 res.json({});
//             });
//     }
// }
/**
 * Update the featured video collection
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
 * update a video collection indicated in params.name
 * @param req
 * @param res
 */
function updateCollectionVideos(req, res) {
    var params = {};
    params.user = req.body.user;
    params.video = req.body.video;
    params.name = 'showcase';
    videoCollCrud1_0_0
        .updateCollection(params)
        .then(function (video) {
            res.json({status: 'OK'});
        })
}

VideoCollection.prototype.getFeaturedVideos = getFeaturedVideos;
VideoCollection.prototype.updateFeaturedVideos = updateFeaturedVideos;
VideoCollection.prototype.getStaffPickVideos = getStaffPickVideos;
VideoCollection.prototype.updateStaffPickVideos = updateStaffPickVideos;
VideoCollection.prototype.updateCollectionVideos = updateCollectionVideos;

module.exports = new VideoCollection();
