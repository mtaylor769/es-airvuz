var namespace = 'app.routes.api.acl';
try {
    var log4js = require('log4js');
    var logger = log4js.getLogger(namespace);
    var aclUsers1_0_0 = require('../apiVersion/aclUsers1-0-0');

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


function AclUsers() {
}
/*
 * If the request object param contains "apiVer" use its value to set version
 * and call corresponding version of video api object
 * if "apiVer" is not present, use default
 */
var defaultVer = "1.0.0";

function create(req, res) {

    var version = req.query.apiVer || defaultVer;

    if (version === "1.0.0") {
        aclUsers1_0_0.create(req, res);
    }
    else {
        incorrectVer(req, res);
    }
}
function get(req, res) {

    var version = req.query.apiVer || defaultVer;

    if (version === "1.0.0") {
        aclUsers1_0_0.get(req, res);
    }
    else {
        incorrectVer(req, res);
    }
}
function search(req, res) {

    var version = req.query.apiVer || defaultVer;

    if (version === "1.0.0") {
        aclUsers1_0_0.search(req, res);
    }
    else {
        incorrectVer(req, res);
    }
}
function getAll(req, res) {

    var version = req.query.apiVer || defaultVer;

    if (version === "1.0.0") {
        aclUsers1_0_0.getAll(req, res);
    }
    else {
        incorrectVer(req, res);
    }
}
function update(req, res) {

    var version = req.query.apiVer || defaultVer;

    if (version === "1.0.0") {
        aclUsers1_0_0.update(req, res);
    }
    else {
        incorrectVer(req, res);
    }
}
function addPermissions(req, res) {

    var version = req.query.apiVer || defaultVer;

    if (version === "1.0.0") {
        aclUsers1_0_0.addPermissions(req, res);
    }
    else {
        incorrectVer(req, res);
    }
}
function remove(req, res) {

    var version = req.query.apiVer || defaultVer;

    if (version === "1.0.0") {
        aclUsers1_0_0.remove(req, res);
    }
    else {
        incorrectVer(req, res);
    }
}
function removePermissions(req, res) {

    var version = req.query.apiVer || defaultVer;

    if (version === "1.0.0") {
        aclUsers1_0_0.removePermissions(req, res);
    }
    else {
        incorrectVer(req, res);
    }
}

AclUsers.prototype.create = create;
AclUsers.prototype.get = get;
AclUsers.prototype.search = search;
AclUsers.prototype.getAll = getAll;
AclUsers.prototype.update = update;
AclUsers.prototype.addPermissions = addPermissions;
AclUsers.prototype.remove = remove;
AclUsers.prototype.removePermissions = removePermissions;

module.exports = new AclUsers();