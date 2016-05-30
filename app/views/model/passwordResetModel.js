var namespace				= 'app.views.model.resetPasswordModel';
var log4js					= require('log4js');
var logger					= log4js.getLogger(namespace);

try {
  var BaseModel	          = require('./baseModel');
  var util			          = require('util');
  var CategoryType        = require('../../persistence/crud/categoryType');
  var Promise             = require('bluebird');

  if(global.NODE_ENV === "production") {
    logger.setLevel("WARN");
  }
}
catch(exception) {
  logger.error(" import error:" + exception);
}
// IMPORT: END

var PasswordResetModel = function(params) {
  BaseModel.apply(this, arguments);
};

util.inherits(PasswordResetModel, BaseModel);

PasswordResetModel.prototype.getData = function(params) {

  var code            = params.request.params.code;
  var sourceManifest	= params.sourceManifest;
  params.data													= {};
  params.data.airvuz 									= {};
  params.data.vendor 									= {};
  params.data.airvuz.js 							= sourceManifest["airvuz.js"];
  params.data.airvuz.css 							= sourceManifest["airvuz.css"];
  params.data.vendor.js 							= sourceManifest["vendor.js"];

  params.data.code                    = code;

  var promise = CategoryType.get()
    .then(function (categories) {
      params.data.categories = categories;
      return params;
    });

  return Promise.resolve(promise);


};

module.exports = PasswordResetModel;