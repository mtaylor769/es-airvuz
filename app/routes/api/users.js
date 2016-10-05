try {
    var log4js = require('log4js');
    var logger = log4js.getLogger('app.routes.api.users');
    var users1_0_0 = require('../apiVersion/users1-0-0');
    var viewManager = require('../../views/manager/viewManager');
    var confirmationView = require('../../views/view/confirmationView');

    // add dust template
    viewManager.addView({view: confirmationView});
} catch (exception) {
    logger.error(" import error:" + exception);
}

function User() {}

/*
 * If the request object param contains "apiVer" use its value to set version
 * and call corresponding version of video api object
 * if "apiVer" is not present, use default
 */

function search(req, res) {

    var version = req.params.apiVer || "1.0.0";

    if (version === "1.0.0") {
        users1_0_0.search(req, res);
    }
}

function get(req, res) {

    var version = req.params.apiVer || "1.0.0";

    if (version === "1.0.0") {
        users1_0_0.get(req, res);
    }
}

function createUser(req, res) {

    var version = req.params.apiVer || "1.0.0";

    if (version === "1.0.0") {
        users1_0_0.createUser(req, res);
    }
}

function put(req, res) {

    var version = req.params.apiVer || "1.0.0";

    if (version === "1.0.0") {
        users1_0_0.put(req, res);
    }
}

function hireMe(req, res) {

    var version = req.params.apiVer || "1.0.0";

    if (version === "1.0.0") {
        users1_0_0.hireMe(req, res);
    }
}

function passwordResetRequest(req, res) {

    var version = req.params.apiVer || "1.0.0";

    if (version === "1.0.0") {
        users1_0_0.passwordResetRequest(req, res);
    }
}

function passwordResetChange(req, res) {

    var version = req.params.apiVer || "1.0.0";

    if (version === "1.0.0") {
        users1_0_0.passwordResetChange(req, res);
    }
}

function deleteUser(req, res) {

    var version = req.params.apiVer || "1.0.0";

    if (version === "1.0.0") {
        users1_0_0.deleteUser(req, res);
    }
}

function statusChange(req, res) {

    var version = req.params.apiVer || "1.0.0";

    if (version === "1.0.0") {
        users1_0_0.statusChange(req, res);
    }
}

function contactUs(req, res) {

    var version = req.params.apiVer || "1.0.0";

    if (version === "1.0.0") {
        users1_0_0.contactUs(req, res);
    }
}

function resendConfirmation(req, res) {

    var version = req.params.apiVer || "1.0.0";

    if (version === "1.0.0") {
        users1_0_0.resendConfirmation(req, res);
    }
}

function addAclRole(req, res) {

    var version = req.params.apiVer || "1.0.0";

    if (version === "1.0.0") {
        users1_0_0.addAclRole(req, res);
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
