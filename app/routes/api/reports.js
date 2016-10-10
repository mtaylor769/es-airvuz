var namespace = 'app.routes.api.reports';

try {
    var log4js          = require('log4js');
    var logger          = log4js.getLogger(namespace);
    var reports1_0_0    = require('../apiVersion/reports1-0-0');

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

function Reports() {

}
/*
 * If the request object query contains "apiVer" use its value to set version
 * and call corresponding version of video api object
 * if "apiVer" is not present, use defaultVer
 */
var defaultVer = "1.0.0";

function getVideos(req, res) {

    var version = req.query.apiVer || defaultVer;

    if (version === "1.0.0") {
        reports1_0_0.getVideos(req, res);
    }
    else {
        incorrectVer(req,res);
    }
}

function getComments(req, res) {

    var version = req.query.apiVer || defaultVer;

    if (version === "1.0.0") {
        reports1_0_0.getComments(req, res);
    }
    else {
        incorrectVer(req,res);
    }
}

function employeeContributor(req, res) {

    var version = req.query.apiVer || defaultVer;

    if (version === "1.0.0") {
        reports1_0_0.employeeContributor(req, res);
    }
    else {
        incorrectVer(req,res);
    }
}

function hashtag(req, res) {

    var version = req.query.apiVer || defaultVer;

    if (version === "1.0.0") {
        reports1_0_0.hashTag(req, res);
    }
    else {
        incorrectVer(req,res);
    }
}

function userHashtag(req, res) {

    var version = req.query.apiVer || defaultVer;

    if (version === "1.0.0") {
        reports1_0_0.userHashtag(req, res);
    }
    else {
        incorrectVer(req,res);
    }
}

function siteInfo(req, res) {

    var version = req.query.apiVer || defaultVer;

    if (version === "1.0.0") {
        reports1_0_0.siteInfo(req, res);
    }
    else {
        incorrectVer(req,res);
    }
}

function top100Views(req, res) {

    var version = req.query.apiVer || defaultVer;

    if (version === "1.0.0") {
        reports1_0_0.top100Views(req, res);
    }
    else {
        incorrectVer(req,res);
    }
}

function videoPercentage(req, res) {

    var version = req.query.apiVer || defaultVer;

    if (version === "1.0.0") {
        reports1_0_0.videoPercentage(req, res);
    }
    else {
        incorrectVer(req,res);
    }
}

Reports.prototype.getVideos = getVideos;
Reports.prototype.getComments = getComments;
Reports.prototype.employeeContributor = employeeContributor;
Reports.prototype.hashTag = hashtag;
Reports.prototype.userHashtag = userHashtag;
Reports.prototype.siteInfo = siteInfo;
Reports.prototype.top100Views = top100Views;
Reports.prototype.videoPercentage = videoPercentage;
module.exports = new Reports();