var namespace = 'app.routes.api.amazon';

try {
    var log4js          = require('log4js');
    var logger          = log4js.getLogger(namespace);
    var amazon1_0_0     = require('../apiVersion/amazon1-0-0');
    var amazonService   = require('../../services/amazon.service.server.js');

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

function Amazon() {}
/*
 * If the request object query contains "apiVer" use its value to set version
 * and call corresponding version of video api object
 * if "apiVer" is not present, use defaultVer
 */
var defaultVer = "1.0.0";

function signAuth(req, res) {

    var version = req.query.apiVer || defaultVer;

    if (version === "1.0.0") {
        amazon1_0_0.signAuth(req, res);
    }
    else {
        incorrectVer(req,res);
    }
}

function getVideoInfo(req, res) {

    var version = req.query.apiVer || defaultVer;

    if (version === "1.0.0") {
        amazon1_0_0.getVideoInfo(req, res);
    }
    else {
        incorrectVer(req,res);
    }
}

function startTranscode(req, res) {

    var version = req.query.apiVer || defaultVer;

    if (version === "1.0.0") {
        amazon1_0_0.startTranscode(req, res);
    }
    else {
        incorrectVer(req,res);
    }
}

function getVideoDuration(req, res) {

    var version = req.query.apiVer || defaultVer;

    if (version === "1.0.0") {
        amazon1_0_0.getVideoDuration(req, res);
    }
    else {
        incorrectVer(req,res);
    }
}

function moveFile(req, res) {

    var version = req.query.apiVer || defaultVer;

    if (version === "1.0.0") {
        amazon1_0_0.moveFile(req, res);
    }
    else {
        incorrectVer(req,res);
    }
}

function getVideo(req, res) {

    var version = req.query.apiVer || defaultVer;

    if (version === "1.0.0") {
        amazon1_0_0.getVideo(req, res);
    }
    else {
        incorrectVer(req,res);
    }
}


Amazon.prototype.signAuth               = signAuth;
Amazon.prototype.getVideoInfo           = getVideoInfo;
Amazon.prototype.confirmSubscription    = amazonService.confirmSubscription;
Amazon.prototype.startTranscode         = startTranscode;
Amazon.prototype.getVideoDuration       = getVideoDuration;
Amazon.prototype.moveFile               = moveFile;
Amazon.prototype.getVideo               = getVideo;

module.exports = new Amazon();

