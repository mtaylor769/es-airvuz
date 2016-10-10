var namespace = 'app.routes.api.aclRoles';

try {
    var log4js          = require('log4js');
    var logger          = log4js.getLogger(namespace);
    var aclRoles1_0_0   = require('../apiVersion/aclRoles1-0-0');

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
/*
 * If the request object query contains "apiVer" use its value to set version
 * and call corresponding version of video api object
 * if "apiVer" is not present, use defaultVer
 */
var defaultVer = "1.0.0";

function AclRoles() {}
/**
 *
 * @param req
 * @param res
 */
function addAclRoleToUser (req, res) {

    var version = req.query.apiVer || defaultVer;

    if (version === "1.0.0") {
        aclRoles1_0_0.addAclRoleToUser(req, res);
    }
    else {
        incorrectVer(req,res);
    }
}
/**
 *
 * @param req
 * @param res
 */
function removeAclRoleFromUser (req, res) {

    var version = req.query.apiVer || defaultVer;

    if (version === "1.0.0") {
        aclRoles1_0_0.removeAclRoleFromUser(req, res);
    }
    else {
        incorrectVer(req,res);
    }
}
/**
 *
 * @param req
 * @param res
 */
function getUserRoles (req, res) {

    var version = req.query.apiVer || defaultVer;

    if (version === "1.0.0") {
        aclRoles1_0_0.getUserRoles(req, res);
    }
    else {
        incorrectVer(req,res);
    }
}

AclRoles.prototype.addAclRoleToUser = addAclRoleToUser;
AclRoles.prototype.removeAclRoleFromUser = removeAclRoleFromUser;
AclRoles.prototype.getUserRoles = getUserRoles;


module.exports = new AclRoles();