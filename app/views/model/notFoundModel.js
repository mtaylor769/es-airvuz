var namespace			  = 'app.views.model.notFoundModel';
var log4js				  = require('log4js');
var logger				  = log4js.getLogger(namespace);

try {
  var BaseModel	          = require('./baseModel');
  var util			      = require('util');
  var catTypeCrud1_0_0    = require('../../persistence/crud/categoryType1-0-0');
  var Promise             = require('bluebird');

  if(global.NODE_ENV === "production") {
    logger.setLevel("WARN");
  }
}
catch(exception) {
  logger.error(" import error:" + exception);
}
// IMPORT: END

var NotFoundModel = function(params) {
  BaseModel.apply(this, arguments);
};

util.inherits(NotFoundModel, BaseModel);

NotFoundModel.prototype.getData = function(params) {
  var code            = params.request.params.code;

  params.data													= {};
  params.data.code                    = code;

  var promise = catTypeCrud1_0_0.get()
    .then(function (categories) {
      params.data.categories = categories;
      return params;
    });

  return Promise.resolve(promise);
};

module.exports = NotFoundModel;