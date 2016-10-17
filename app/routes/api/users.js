var namespace = 'app.routes.api.users';

try {
    var log4js      = require('log4js');
    var logger      = log4js.getLogger(namespace);
    var users1_0_0 = require('../apiVersion/users1-0-0');

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

function search(req, res) {

    var version = req.query.apiVer || defaultVer;

    if (version === "1.0.0") {
        users1_0_0.search(req, res);
    }
    else {
        incorrectVer(req,res);
    }
}

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

User.prototype.hireMe = hireMe;
User.prototype.search = search;
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

module.exports = new User();
