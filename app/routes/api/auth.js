var namespace = 'app.routes.api.auth';

try {
    var log4js      = require('log4js');
    var logger      = log4js.getLogger(namespace);
    var auth1_0_0   = require('../apiVersion/auth1-0-0');

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

function Auth() {}

/*
 * If the request object param contains "apiVer" use its value to set version
 * and call corresponding version of video api object
 * if "apiVer" is not present, use default
 */
var defaultVer = "1.0.0";

function localLogin(req, res) {

    var version = req.query.apiVer || defaultVer;

    if (version === "1.0.0") {
        auth1_0_0.localLogin(req, res);
    }
    else {
        incorrectVer(req,res);
    }
}

function facebook(req, res, next) {

    var version = req.query.apiVer || defaultVer;

    if (version === "1.0.0") {
        auth1_0_0.facebook(req, res);
    }
    else {
        incorrectVer(req,res);
    }
}

function google(req, res) {

    var version = req.query.apiVer || defaultVer;

    if (version === "1.0.0") {
        auth1_0_0.google(req, res);
    }
    else {
        incorrectVer(req,res);
    }
}

Auth.prototype.localLogin          = localLogin;
Auth.prototype.facebook            = facebook;
Auth.prototype.google              = google;

module.exports = new Auth();