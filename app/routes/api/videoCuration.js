var namespace = 'app.routes.api.videoCuration';

try {
    var log4js              = require('log4js');
    var logger              = log4js.getLogger(namespace);
    var videoCuration1_0_0  = require('../apiVersion/videoCuration1-0-0');

    if (global.NODE_ENV === "production") {
        logger.setLevel("INFO");
    }
}
catch(exception) {
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
function VideoCuration() {}
/*
 * If the request object query contains "apiVer" use its value to set version
 * and call corresponding version of video api object
 * if "apiVer" is not present, use defaultVer
 */
var defaultVer = "1.0.0";

function getNextVideo(req, res) {

    var version = req.params.apiVer || defaultVer;

    if (version === "1.0.0") {
        videoCuration1_0_0.getNextVideo(req, res);
    }
    else {
        incorrectVer(req,res);
    }
}

function updateVideo(req, res) {

    var version = req.params.apiVer || defaultVer;

    if (version === "1.0.0") {
        videoCuration1_0_0.updateVideo(req, res);
    }
    else {
        incorrectVer(req,res);
    }
}

VideoCuration.prototype.getNextVideo = getNextVideo;
VideoCuration.prototype.updateVideo = updateVideo;
module.exports = new VideoCuration();