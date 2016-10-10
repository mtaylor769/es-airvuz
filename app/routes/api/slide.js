var namespace = 'app.routes.api.slide';

try {
    var log4js      = require('log4js');
    var logger      = log4js.getLogger(namespace);
    var slide1_0_0  = require('../apiVersion/slide1-0-0');

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

function Slide() {}

/*
 * If the request object query contains "apiVer" use its value to set version
 * and call corresponding version of video api object
 * if "apiVer" is not present, use defaultVer
 */
var defaultVer = "1.0.0";

function post(req, res) {

    var version = req.query.apiVer || defaultVer;

    if (version === "1.0.0") {
        slide1_0_0.post(req, res);
    }
    else {
        incorrectVer(req,res);
    }
}

function getAll(req, res) {

    var version = req.query.apiVer || defaultVer;

    if (version === "1.0.0") {
        slide1_0_0.getAll(req, res);
    }
    else {
        incorrectVer(req,res);
    }
}

function get(req, res) {

    var version = req.query.apiVer || defaultVer;

    if (version === "1.0.0") {
        slide1_0_0.get(req, res);
    }
    else {
        incorrectVer(req,res);
    }
}

function put(req, res) {

    var version = req.query.apiVer || defaultVer;

    if (version === "1.0.0") {
        slide1_0_0.put(req, res);
    }
    else {
        incorrectVer(req,res);
    }
}

function remove(req, res) {

    var version = req.query.apiVer || defaultVer;

    if (version === "1.0.0") {
        slide1_0_0.remove(req, res);
    }
    else {
        incorrectVer(req,res);
    }
}

Slide.prototype.post         = post;
Slide.prototype.get          = get;
Slide.prototype.getAll       = getAll;
Slide.prototype.put          = put;
Slide.prototype.remove       = remove;

module.exports = new Slide();
