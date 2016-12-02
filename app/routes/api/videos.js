var namespace = 'app.routes.api.videos';

try {
    var log4js      = require('log4js');
    var logger      = log4js.getLogger(namespace);
    var videos1_0_0 = require('../apiVersion/videos1-0-0');

    if (global.NODE_ENV === "production") {
        logger.setLevel("INFO");
    }
}
catch (exception) {
    logger.error(" import error:" + exception);
}
/**
 * returns an http 400 status along with "incorrect api version requested" to requster
 * displays remote address
 * @param req
 * @param res
 */
function incorrectVer(req, res) {
    logger.info("incorrect api version requested: " + req.query.apiVer +
        ", requester IP: " + req.connection.remoteAddress);
    res.status(400).json({error: "invalid api version"});
}

function Video() {}

/*
* If the request object query contains "apiVer" use its value to set version
* and call corresponding version of video api object
* if "apiVer" is not present, use defaultVer
 */
var defaultVer = "1.0.0";


function getVideosByCategory(req, res) {

    var version = req.query.apiVer || defaultVer;

    if (version === "1.0.0") {
        videos1_0_0.getVideosByCategory(req, res);
    }
    else {
        incorrectVer(req,res);
    }
}

function search(req, res) {

    var version = req.query.apiVer || defaultVer;

    if (version === "1.0.0") {
        videos1_0_0.search(req, res);
    }
    else {
        incorrectVer(req,res);
    }
}

function post(req, res) {

    var version = req.query.apiVer || defaultVer;

    if (version === "1.0.0") {
        videos1_0_0.post(req, res);
    }
    else {
        incorrectVer(req,res);
    }
}

function get(req, res) {

    var version = req.query.apiVer || defaultVer;

    if (version === "1.0.0") {
        videos1_0_0.get(req, res);
    }
    else {
        incorrectVer(req,res);
    }
}

function updateVideo(req, res) {

    var version = req.query.apiVer || defaultVer;

    if (version === "1.0.0") {
        videos1_0_0.updateVideo(req, res);
    }
    else {
        incorrectVer(req,res);
    }
}

function deleteVideo(req, res) {

    var version = req.query.apiVer || defaultVer;

    if (version === "1.0.0") {
        videos1_0_0.deleteVideo(req, res);
    }
    else {
        incorrectVer(req,res);
    }
}

function like(req, res) {

    var version = req.query.apiVer || defaultVer;

    if (version === "1.0.0") {
        videos1_0_0.like(req, res);
    }
    else {
        incorrectVer(req,res);
    }
}

function loaded(req, res) {

    var version = req.query.apiVer || defaultVer;

    if (version === "1.0.0") {
        videos1_0_0.loaded(req, res);
    }
    else {
        incorrectVer(req,res);
    }
}

function showcaseUpdate(req, res) {

    var version = req.query.apiVer || defaultVer;

    if (version === "1.0.0") {
        videos1_0_0.showcaseUpdate(req, res);
    }
    else {
        incorrectVer(req,res);
    }
}

function reportVideo(req, res) {

    var version = req.query.apiVer || defaultVer;

    if (version === "1.0.0") {
        videos1_0_0.reportVideo(req, res);
    }
    else {
        incorrectVer(req,res);
    }
}

function videoInfoCheck(req, res) {

    var version = req.query.apiVer || defaultVer;

    if (version === "1.0.0") {
        videos1_0_0.videoInfoCheck(req, res);
    }
    else {
        incorrectVer(req,res);
    }
}

function getVideosByUser(req, res) {

    var version = req.query.apiVer || defaultVer;

    if (version === "1.0.0") {
        videos1_0_0.getVideosByUser(req, res);
    }
    else {
        incorrectVer(req,res);
    }
}

function getTopSixVideos(req, res) {

    var version = req.query.apiVer || defaultVer;

    if (version === "1.0.0") {
        videos1_0_0.getTopSixVideos(req, res);
    }
    else {
        incorrectVer(req,res);
    }
}

function getVideoCount(req, res) {

    var version = req.query.apiVer || defaultVer;

    if (version === "1.0.0") {
        videos1_0_0.getVideoCount(req, res);
    }
    else {
        incorrectVer(req,res);
    }
}

function getFollowCount(req, res) {

    var version = req.query.apiVer || defaultVer;

    if (version === "1.0.0") {
        videos1_0_0.getFollowCount(req, res);
    }
    else {
        incorrectVer(req,res);
    }
}

function getNextVideos(req, res) {

    var version = req.query.apiVer || defaultVer;

    if (version === "1.0.0") {
        videos1_0_0.getNextVideos(req, res);
    }
    else {
        incorrectVer(req,res);
    }
}

function getVideoOwnerProfile(req, res) {

    var version = req.query.apiVer || defaultVer;

    if (version === "1.0.0") {
        videos1_0_0.getVideoOwnerProfile(req, res);
    }
    else {
        incorrectVer(req,res);
    }
}

function getCommentsByVideoId(req, res) {

    var version = req.query.apiVer || defaultVer;

    if (version === "1.0.0") {
        videos1_0_0.getCommentsByVideoId(req, res);
    }
    else {
        incorrectVer(req,res);
    }
}

function querySeoKeywords(req, res) {
    var version = req.query.apiVer || defaultVer;

    if (version === "1.0.0") {
        videos1_0_0.querySeoKeywords(req, res);
    } else {
        incorrectVer(req, res);
    }
}

function renderVideoPage(req, res) {

    var version = req.query.apiVer || defaultVer;
    req.partial = true;

    if (version === "1.0.0") {
        videos1_0_0.renderVideoPage(req, res);
    } else {
        incorrectVer(req,res);
    }
}

function getVideoLocation(req, res) {
    var version = req.query.apiVer || defaultVer;

    if (version === "1.0.0") {
        videos1_0_0.getVideoLocation(req, res);
    } else {
        incorrectVer(req, res);
    }
}

Video.prototype.getVideosByCategory = getVideosByCategory;
Video.prototype.search = search;
Video.prototype.post = post;
Video.prototype.get = get;
Video.prototype.updateVideo = updateVideo;
Video.prototype.deleteVideo = deleteVideo;
Video.prototype.like = like;
Video.prototype.loaded = loaded;
Video.prototype.showcaseUpdate = showcaseUpdate;
Video.prototype.reportVideo = reportVideo;
Video.prototype.videoInfoCheck = videoInfoCheck;
Video.prototype.getVideosByUser = getVideosByUser;
Video.prototype.getTopSixVideos = getTopSixVideos;
Video.prototype.getVideoCount = getVideoCount;
Video.prototype.getFollowCount = getFollowCount;
Video.prototype.getNextVideos = getNextVideos;
Video.prototype.getVideoOwnerProfile = getVideoOwnerProfile;
Video.prototype.getCommentsByVideoId = getCommentsByVideoId;
Video.prototype.querySeoKeywords = querySeoKeywords;
Video.prototype.renderVideoPage = renderVideoPage;

Video.prototype.getVideoLocation = getVideoLocation;


module.exports = new Video();

//change crud and videos