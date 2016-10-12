try {
    var log4js = require('log4js');
    var logger = log4js.getLogger('app.routes.api.videos');
    var videos1_0_0 = require('../apiVersion/videos1-0-0');

    if (global.NODE_ENV === "production") {
        logger.setLevel("INFO");
    }
    logger.debug("import complete");
}
catch (exception) {
    logger.error(" import error:" + exception);
}

function Video() {}

/*
* If the request object param contains "apiVer" use its value to set version
* and call corresponding version of video api object
* if "apiVer" is not present, use default
 */
function getVideosByCategory(req, res) {

    var version = req.params.apiVer || "1.0.0";

    if (version === "1.0.0") {
        videos1_0_0.getVideosByCategory(req, res);
    }
}

function search(req, res) {

    var version = req.params.apiVer || "1.0.0";

    if (version === "1.0.0") {
        videos1_0_0.search(req, res);
    }
}

function post(req, res) {

    var version = req.params.apiVer || "1.0.0";

    if (version === "1.0.0") {
        videos1_0_0.post(req, res);
    }
}

function get(req, res) {

    var version = req.params.apiVer || "1.0.0";

    if (version === "1.0.0") {
        videos1_0_0.get(req, res);
    }
}

function put(req, res) {

    var version = req.params.apiVer || "1.0.0";

    if (version === "1.0.0") {
        videos1_0_0.put(req, res);
    }
}

function deleteVideo(req, res) {

    var version = req.params.apiVer || "1.0.0";

    if (version === "1.0.0") {
        videos1_0_0.delete(req, res);
    }
}

function like(req, res) {

    var version = req.params.apiVer || "1.0.0";

    if (version === "1.0.0") {
        videos1_0_0.like(req, res);
    }
}

function loaded(req, res) {

    var version = req.params.apiVer || "1.0.0";

    if (version === "1.0.0") {
        videos1_0_0.loaded(req, res);
    }
}

function showcaseUpdate(req, res) {

    var version = req.params.apiVer || "1.0.0";

    if (version === "1.0.0") {
        videos1_0_0.showcaseUpdate(req, res);
    }
}

function reportVideo(req, res) {

    var version = req.params.apiVer || "1.0.0";

    if (version === "1.0.0") {
        videos1_0_0.reportVideo(req, res);
    }
}

function videoInfoCheck(req, res) {

    var version = req.params.apiVer || "1.0.0";

    if (version === "1.0.0") {
        videos1_0_0.videoInfoCheck(req, res);
    }
}

function getVideosByUser(req, res) {

    var version = req.params.apiVer || "1.0.0";

    if (version === "1.0.0") {
        videos1_0_0.getVideosByUser(req, res);
    }
}

function getShowcaseByUser(req, res) {

    var version = req.params.apiVer || "1.0.0";

    if (version === "1.0.0") {
        videos1_0_0.getShowcaseByUser(req, res);
    }
}

function getTopSixVideos(req, res) {

    var version = req.params.apiVer || "1.0.0";

    if (version === "1.0.0") {
        videos1_0_0.getTopSixVideos(req, res);
    }
}

function getVideoCount(req, res) {

    var version = req.params.apiVer || "1.0.0";

    if (version === "1.0.0") {
        videos1_0_0.getVideoCount(req, res);
    }
}

function getFollowCount(req, res) {

    var version = req.params.apiVer || "1.0.0";

    if (version === "1.0.0") {
        videos1_0_0.getFollowCount(req, res);
    }
}

function getNextVideos(req, res) {

    var version = req.params.apiVer || "1.0.0";

    if (version === "1.0.0") {
        videos1_0_0.getNextVideos(req, res);
    }
}

function getVideoOwnerProfile(req, res) {

    var version = req.params.apiVer || "1.0.0";

    if (version === "1.0.0") {
        videos1_0_0.getVideoOwnerProfile(req, res);
    }
}

function getCommentsByVideoId(req, res) {

    var version = req.params.apiVer || "1.0.0";

    if (version === "1.0.0") {
        videos1_0_0.getCommentsByVideoId(req, res);
    }
}

Video.prototype.getVideosByCategory = getVideosByCategory;
Video.prototype.search = search;
Video.prototype.post = post;
Video.prototype.get = get;
Video.prototype.put = put;
Video.prototype.delete = deleteVideo;
Video.prototype.like = like;
Video.prototype.loaded = loaded;
Video.prototype.showcaseUpdate = showcaseUpdate;
Video.prototype.reportVideo = reportVideo;
Video.prototype.videoInfoCheck = videoInfoCheck;
Video.prototype.getVideosByUser = getVideosByUser;
Video.prototype.getShowcaseByUser = getShowcaseByUser;
Video.prototype.getTopSixVideos = getTopSixVideos;
Video.prototype.getVideoCount = getVideoCount;
Video.prototype.getFollowCount = getFollowCount;
Video.prototype.getNextVideos = getNextVideos;
Video.prototype.getVideoOwnerProfile = getVideoOwnerProfile;
Video.prototype.getCommentsByVideoId = getCommentsByVideoId;

module.exports = new Video();

//change crud and videos