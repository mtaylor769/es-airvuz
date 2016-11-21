var namespace = 'app.routes.api.follow';

try {
    var log4js      = require('log4js');
    var logger      = log4js.getLogger(namespace);
    var follow1_0_0 = require('../apiVersion/follow1-0-0');

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

function Follow() {
}

/*
 * If the request object param contains "apiVer" use its value to set version
 * and call corresponding version of video api object
 * if "apiVer" is not present, use default
 */
var defaultVer = "1.0.0";

function getCheckFollowing(req, res) {

    var version = req.query.apiVer || defaultVer;

    if (version === "1.0.0") {
        follow1_0_0.getCheckFollowing(req, res);
    }
    else {
        incorrectVer(req,res);
    }
}

function post(req, res) {

    var version = req.query.apiVer || defaultVer;

    if (version === "1.0.0") {
        follow1_0_0.post(req, res);
    }
    else {
        incorrectVer(req,res);
    }
}

function getFollowers(req, res) {

    var version = req.query.apiVer || defaultVer;

    if (version === "1.0.0") {
        follow1_0_0.getFollowers(req, res);
    }
    else {
        incorrectVer(req,res);
    }
}

function getFollowing(req, res) {

    var version = req.query.apiVer || defaultVer;

    if (version === "1.0.0") {
        follow1_0_0.getFollowing(req, res);
    }
    else {
        incorrectVer(req,res);
    }
}

function getFollowersCount(req, res) {
    var version = req.query.apiVer || defaultVer;

    if (version === "1.0.0") {
        follow1_0_0.getFollowersCount(req, res);
    }
    else {
        incorrectVer(req,res);
    }
}

function getFollowingCount(req, res) {
    var version = req.query.apiVer || defaultVer;

    if (version === "1.0.0") {
        follow1_0_0.getFollowingCount(req, res);
    }
    else {
        incorrectVer(req,res);
    }
}

Follow.prototype.getCheckFollowing = getCheckFollowing;
Follow.prototype.post = post;
Follow.prototype.getFollowers = getFollowers;
Follow.prototype.getFollowing = getFollowing;
Follow.prototype.getFollowingCount = getFollowingCount;
Follow.prototype.getFollowersCount = getFollowersCount;

module.exports = new Follow();