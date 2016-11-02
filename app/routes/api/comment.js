var namespace = 'app.routes.api.comment';
try {
    var log4js       = require('log4js');
    var logger       = log4js.getLogger(namespace);
    var comment1_0_0 = require('../apiVersion/comment1-0-0');

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

function Comment() {}

/*
 * If the request object param contains "apiVer" use its value to set version
 * and call corresponding version of video api object
 * if "apiVer" is not present, use default
 */
var defaultVer = "1.0.0";

function post(req, res) {

    var version = req.query.apiVer || defaultVer;

    if (version === "1.0.0") {
        comment1_0_0.post(req, res);
    }
    else {
        incorrectVer(req,res);
    }
}

function get(req, res) {

    var version = req.query.apiVer || defaultVer;

    if (version === "1.0.0") {
        comment1_0_0.get(req, res);
    }
    else {
        incorrectVer(req,res);
    }
}

function getByParentCommentId(req, res) {

    var version = req.query.apiVer || defaultVer;

    if (version === "1.0.0") {
        comment1_0_0.getByParentCommentId(req, res);
    }
    else {
        incorrectVer(req,res);
    }
}

function getByVideoId(req, res) {

    var version = req.query.apiVer || defaultVer;

    if (version === "1.0.0") {
        comment1_0_0.getByVideoId(req, res);
    }
    else {
        incorrectVer(req,res);
    }
}

function getById(req, res) {

    var version = req.query.apiVer || defaultVer;

    if (version === "1.0.0") {
        comment1_0_0.getById(req, res);
    }
    else {
        incorrectVer(req,res);
    }
}

function put(req, res) {

    var version = req.query.apiVer || defaultVer;

    if (version === "1.0.0") {
        comment1_0_0.put(req, res);
    }
    else {
        incorrectVer(req,res);
    }
}

function deleteComment (req, res)
{

    var version = req.query.apiVer || defaultVer;

    if (version === "1.0.0") {
        comment1_0_0.delete(req, res);
    }
    else {
        incorrectVer(req,res);
    }
}

function adminGetComments(req, res) {

    var version = req.query.apiVer || defaultVer;

    if (version === "1.0.0") {
        comment1_0_0.adminGetComments(req, res);
    }
    else {
        incorrectVer(req,res);
    }
}

function reportComment(req, res) {

    var version = req.query.apiVer || defaultVer;

    if (version === "1.0.0") {
        comment1_0_0.reportComment(req, res);
    }
    else {
        incorrectVer(req,res);
    }
}

Comment.prototype.post = post;
Comment.prototype.get = get;
Comment.prototype.getByParentCommentId = getByParentCommentId;
Comment.prototype.getByVideoId = getByVideoId;
Comment.prototype.getById = getById;
Comment.prototype.put = put;
Comment.prototype.delete = deleteComment;
Comment.prototype.adminGetComments = adminGetComments;
Comment.prototype.reportComment = reportComment;

module.exports = new Comment();