var namespace				= 'app.views.model.confirmationModel';
var log4js					= require('log4js');
var logger					= log4js.getLogger(namespace);

try {
    var BaseModel	        = require('./baseModel');
    var util			    = require('util');
    var Promise             = require('bluebird');
    var userCrud            = require('../../persistence/crud/users');

    if(global.NODE_ENV === "production") {
        logger.setLevel("WARN");
    }
}
catch(exception) {
    logger.error(" import error:" + exception);
}
// IMPORT: END

var ConfirmationModel = function(params) {
    BaseModel.apply(this, arguments);
};

util.inherits(ConfirmationModel, BaseModel);

ConfirmationModel.prototype.getData = function(params) {
    params.data = {
        host: params.request.hostname
    };

    return userCrud.getUserByEmail(params.request.body.emailAddress)
        .then(function (user) {
            params.data._id = user._id;
            return params;
        });
};

module.exports = ConfirmationModel;