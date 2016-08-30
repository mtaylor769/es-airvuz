try {
    var log4js = require('log4js');
    var logger = log4js.getLogger('app.persistence.crud.videos');
    var ErrorMessage = require('../../utils/errorMessage');
    var PersistenceException = require('../../utils/exceptions/PersistenceException');
    var ValidationException = require('../../utils/exceptions/ValidationException');
    var database = require('../database/database');
    var KeywordModel = null;

    KeywordModel 	= database.getModelByDotPath({modelDotPath: "app.persistence.model.keywords"});

    if(global.NODE_ENV === "production") {
        logger.setLevel("INFO");
    }

    logger.debug("import complete");
}
catch(exception) {
    logger.error(" import error:" + exception)
}

var Keyword = function() {};

function keywordValidationCheck(keyword) {
    return KeywordModel.findOne({keyword: keyword}).exec()
        .then(function(keyword) {
            if(keyword) {
                return keyword;
            } else {
                return;
            }
        })
}

Keyword.prototype.create = function(keyword) {
    return keywordValidationCheck(keyword)
        .then(function(checkReturn) {
            if(!checkReturn) {
                var keywordModel = new KeywordModel({keyword: keyword});
                 return keywordModel.save();
            }
        })
        .catch(function(error) {
            throw error;
        })
};

Keyword.prototype.search = function(keyword) {
    return KeywordModel.find({keyword: keyword}).exec()
};

module.exports = new Keyword();