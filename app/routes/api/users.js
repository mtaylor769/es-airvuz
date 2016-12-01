var namespace = 'app.routes.api.users';

try {
    var log4js      = require('log4js');
    var logger      = log4js.getLogger(namespace);
    var users1_0_0  = require('../apiVersion/users1-0-0');
    var amazonService = require('../../services/amazon.service.server.js');
    var md5         = require('md5');
    if(global.NODE_ENV === "production") {
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

function User() {}

/*
 * If the request object param contains "apiVer" use its value to set version
 * and call corresponding version of video api object
 * if "apiVer" is not present, use default
 */
var defaultVer = "1.0.0";

function get(req, res) {

    var version = req.query.apiVer || defaultVer;

    if (version === "1.0.0") {
        users1_0_0.get(req, res);
    }
    else {
        incorrectVer(req,res);
    }
}

function createUser(req, res) {

    var version = req.query.apiVer || defaultVer;

    if (version === "1.0.0") {
        users1_0_0.createUser(req, res);
    }
    else {
        incorrectVer(req,res);
    }
}

function put(req, res) {

    var version = req.query.apiVer || defaultVer;

    if (version === "1.0.0") {
        users1_0_0.put(req, res);
    }
    else {
        incorrectVer(req,res);
    }
}

function hireMe(req, res) {

    var version = req.query.apiVer || defaultVer;

    if (version === "1.0.0") {
        users1_0_0.hireMe(req, res);
    }
    else {
        incorrectVer(req,res);
    }
}

function passwordResetRequest(req, res) {

    var version = req.query.apiVer || defaultVer;

    if (version === "1.0.0") {
        users1_0_0.passwordResetRequest(req, res);
    }
    else {
        incorrectVer(req,res);
    }
}

function passwordResetChange(req, res) {

    var version = req.query.apiVer || defaultVer;

    if (version === "1.0.0") {
        users1_0_0.passwordResetChange(req, res);
    }
    else {
        incorrectVer(req,res);
    }
}

function deleteUser(req, res) {

    var version = req.query.apiVer || defaultVer;

    if (version === "1.0.0") {
        users1_0_0.delete(req, res);
    }
    else {
        incorrectVer(req,res);
    }
}

function statusChange(req, res) {

    var version = req.query.apiVer || defaultVer;

    if (version === "1.0.0") {
        users1_0_0.statusChange(req, res);
    }
    else {
        incorrectVer(req,res);
    }
}

function contactUs(req, res) {

    var version = req.query.apiVer || defaultVer;

    if (version === "1.0.0") {
        users1_0_0.contactUs(req, res);
    }
    else {
        incorrectVer(req,res);
    }
}

function resendConfirmation(req, res) {

    var version = req.query.apiVer || defaultVer;

    if (version === "1.0.0") {
        users1_0_0.resendConfirmation(req, res);
    }
    else {
        incorrectVer(req,res);
    }
}

function addAclRole(req, res) {

    var version = req.query.apiVer || defaultVer;

    if (version === "1.0.0") {
        users1_0_0.addAclRole(req, res);
    }
    else {
        incorrectVer(req,res);
    }
}

function getUsers(req, res) {
  var version = req.query.apiVer || defaultVer;

  if (version === "1.0.0") {
    users1_0_0.getUsers(req, res);
  }
  else {
    incorrectVer(req,res);
  }
}

function updateCoverImage(req, res) {
    _updateImage(req, res, 'users/cover-pictures/', 'coverPicture');
}

function updateProfileImage(req, res) {
    _updateImage(req, res, 'users/profile-pictures/', 'profilePicture');
}

function _updateImage(req, res, path, type) {
    if (req.user._id !== req.params.id) {
        return res.sendStatus(403);
    }

    var fileName = req.file.originalname,
        hashName = md5(fileName + Date.now()) + '.' +  fileName.split('.')[1];

    amazonService.uploadToS3(amazonService.config.ASSET_BUCKET, path + hashName , req.file.buffer)
        .then(function () {
            return users1_0_0.updateImage(req.params.id, '/' + hashName, type);
        })
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function () {
            res.sendStatus(500);
        });
}

User.prototype.hireMe = hireMe;
User.prototype.get = get;
User.prototype.createUser = createUser;
User.prototype.put = put;
User.prototype.delete = deleteUser;
User.prototype.passwordResetRequest = passwordResetRequest;
User.prototype.passwordResetChange = passwordResetChange;
User.prototype.statusChange = statusChange;
User.prototype.contactUs = contactUs;
User.prototype.resendConfirmation = resendConfirmation;
User.prototype.addAclRole = addAclRole;
User.prototype.updateCoverImage = updateCoverImage;
User.prototype.updateProfileImage = updateProfileImage;
User.prototype.getUsers = getUsers;

module.exports = new User();
