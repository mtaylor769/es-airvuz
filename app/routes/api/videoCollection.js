var namespace = 'app.routes.api.videoCollection';
try {
    var log4js          = require('log4js');
    var logger          = log4js.getLogger(namespace);
    var videoColl1_0_0  = require('../apiVersion/videoCollection1-0-0');

    if(global.NODE_ENV === "production") {
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

function VideoCollection() {
}
/*
 * If the request object query contains "apiVer" use its value to set version
 * and call corresponding version of video api object
 * if "apiVer" is not present, use defaultVer
 */
var defaultVer = "1.0.0";

function getFeaturedVideos(req, res) {

    var version = req.query.apiVer || defaultVer;

    if (version === "1.0.0") {
        videoColl1_0_0.getFeaturedVideos(req, res);
    }
    else {
        incorrectVer(req,res);
    }
}

function updateFeaturedVideos(req, res) {

    var version = req.query.apiVer || defaultVer;

    if (version === "1.0.0") {
        videoColl1_0_0.updateFeaturedVideos(req, res);
    }
    else {
        incorrectVer(req,res);
    }
}

function getStaffPickVideos(req, res) {

    var version = req.query.apiVer || defaultVer;

    if (version === "1.0.0") {
        videoColl1_0_0.getStaffPickVideos(req, res);
    }
    else {
        incorrectVer(req,res);
    }
}

function updateStaffPickVideos(req, res) {

    var version = req.query.apiVer || defaultVer;

    if (version === "1.0.0") {
        videoColl1_0_0.updateStaffPickVideos(req, res);
    }
    else {
        incorrectVer(req,res);
    }
}

function updateCollectionVideos(req, res) {

    var version = req.query.apiVer || defaultVer;

    if (version === "1.0.0") {
        videoColl1_0_0.updateCollectionVideos(req, res);
    }
    else {
        incorrectVer(req,res);
    }
}

VideoCollection.prototype.getFeaturedVideos = getFeaturedVideos;
VideoCollection.prototype.updateFeaturedVideos = updateFeaturedVideos;
VideoCollection.prototype.getStaffPickVideos = getStaffPickVideos;
VideoCollection.prototype.updateStaffPickVideos = updateStaffPickVideos;
VideoCollection.prototype.updateCollectionVideos = updateCollectionVideos;

module.exports = new VideoCollection();
