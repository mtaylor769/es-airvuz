var namespace = 'app.routes.api.cameraType';

try {
    var log4js      = require('log4js');
    var logger      = log4js.getLogger(namespace);
    var cameraType1_0_0 = require('../apiVersion/cameraType1-0-0');

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

function CameraType() {}

/*
 * If the request object query contains "apiVer" use its value to set version
 * and call corresponding version of video api object
 * if "apiVer" is not present, use defaultVer
 */
var defaultVer = "1.0.0";

function post(req, res) {

    var version = req.query.apiVer || defaultVer;

    if (version === "1.0.0") {
        cameraType1_0_0.post(req, res);
    }
    else {
        incorrectVer(req,res);
    }
}

function get(req, res) {

    var version = req.query.apiVer || defaultVer;

    if (version === "1.0.0") {
        cameraType1_0_0.get(req, res);
    }
    else {
        incorrectVer(req,res);
    }
}

function getById(req, res) {

    var version = req.query.apiVer || defaultVer;

    if (version === "1.0.0") {
        cameraType1_0_0.getById(req, res);
    }
    else {
        incorrectVer(req,res);
    }
}

function put(req, res) {

    var version = req.query.apiVer || defaultVer;

    if (version === "1.0.0") {
        cameraType1_0_0.put(req, res);
    }
    else {
        incorrectVer(req,res);
    }
}

function deleteCamType(req, res) {

    var version = req.query.apiVer || defaultVer;

    if (version === "1.0.0") {
        cameraType1_0_0.deleteCamType(req, res);
    }
    else {
        incorrectVer(req,res);
    }
}

CameraType.prototype.post = post;
CameraType.prototype.get = get;
CameraType.prototype.getById = getById;
CameraType.prototype.put = put;
CameraType.prototype.delete = deleteCamType;

module.exports = new CameraType();