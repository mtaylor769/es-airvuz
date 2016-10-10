var namespace = 'app.routes.api.image';

try {
    var log4js      = require('log4js');
    var logger      = log4js.getLogger(namespace);
    var image1_0_0  = require('../apiVersion/image1-0-0');

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
function Image() {
}

/*
 * If the request object param contains "apiVer" use its value to set version
 * and call corresponding version of video api object
 * if "apiVer" is not present, use default
 */
var defaultVer = "1.0.0";

function getProfilePicture(req, res) {

    var version = req.query.apiVer || defaultVer;

    if (version === "1.0.0") {
        image1_0_0.getProfilePicture(req, res);
    }
    else {
        incorrectVer(req,res);
    }
}

function proxyThumbnail(req, res) {

    var version = req.query.apiVer || defaultVer;

    if (version === "1.0.0") {
        image1_0_0.proxyThumbnail(req, res);
    }
    else {
        incorrectVer(req,res);
    }
}

function getVideoThumbnail(req, res) {

    var version = req.query.apiVer || defaultVer;

    if (version === "1.0.0") {
        image1_0_0.getVideoThumbnail(req, res);
    }
    else {
        incorrectVer(req,res);
    }
}

function getSlide(req, res) {

    var version = req.query.apiVer || defaultVer;

    if (version === "1.0.0") {
        image1_0_0.getSlide(req, res);
    }
    else {
        incorrectVer(req,res);
    }
}

Image.prototype.getProfilePicture = getProfilePicture;
Image.prototype.getVideoThumbnail = getVideoThumbnail;
Image.prototype.getSlide = getSlide;
Image.prototype.proxyThumbnail = proxyThumbnail;

module.exports = new Image();
