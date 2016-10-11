var namespace = 'app.routes.apiVersion.keywords1-0-0';
try {
    var log4js              = require('log4js');
    var Promise             = require('bluebird');
    var _                   = require('lodash');
    var logger              = log4js.getLogger(namespace);
    var keywordsCrud1_0_0   = require('../../persistence/crud/keywords1-0-0');

    if (global.NODE_ENV === "production") {
        logger.setLevel("INFO");
    }
}
catch (exception) {
    logger.error(" import error:" + exception);
}
/**
 *
 * @constructor
 */
function Keyword() {}
/**
 * route: POST /api/keyword
 * @param req
 * @param res
 */
function create(req, res) {
    var newKeyword = req.body.keyword;
    keywordsCrud1_0_0.create(newKeyword)
        .then(function (keyword) {
            res.send(keyword);
        })
        .catch(function (error) {
            if (error === 'keyword exists') {
                res.send(error);
            } else {
                res.sendStatus(500);
            }
        })
}
/**
 * route: GET /api/keyword
 * @param req
 * @param res
 */
function search(req, res) {
    var searchTerm = new RegExp(req.query.keyword, 'i');
    keywordsCrud1_0_0.search(searchTerm)
        .then(function (keywords) {
            res.json(keywords)
        })
}

Keyword.prototype.create = create;
Keyword.prototype.search = search;

module.exports = new Keyword();