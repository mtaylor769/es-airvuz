try{
    var log4js				  = require('log4js');
    var Promise               = require('bluebird');
    var _                     = require('lodash');
    var logger				  = log4js.getLogger('app.routes.api.videos');
    var keywords              = require('../../persistence/crud/keywords');

    if(global.NODE_ENV === "production") {
        logger.setLevel("INFO");
    }

    logger.debug("import complete");
}
catch(exception){
    logger.error(" import error:" + exception);
}

function Keyword() {}

Keyword.prototype.create = function(req, res) {
    var newKeyword = req.body.keyword;
    keywords.create(newKeyword)
        .then(function(keyword) {
            res.send(keyword);
        })
        .catch(function(error) {
            if(error === 'keyword exists') {
                res.send(error);
            } else {
                res.sendStatus(500);
            }
        })
};

Keyword.prototype.search = function(req, res) {
    var searchTerm = new RegExp(req.query.keyword, 'i');
    keywords.search(searchTerm)
        .then(function(keywords) {
            res.json(keywords)
        })
};

module.exports = new Keyword();