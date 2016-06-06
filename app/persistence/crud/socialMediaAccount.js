"use strict";
try {
  var log4js                      = require('log4js');
  var logger                      = log4js.getLogger('app.persistence.crud.socialMediaAccount');
  var database                    = require('../database/database');
  var SocialModel                 = database.getModelByDotPath({  modelDotPath  : "app.persistence.model.socialMediaAccount" });
}
catch(exception) {
  logger.error(" import error:" + exception);
}

var socialMediaAccount = function() {};

socialMediaAccount.prototype.create = function(params) {
  return new SocialModel(params).save();
};

socialMediaAccount.prototype.findByUserId = function(userId) {
  return SocialModel.findOne({userId: userId}).exec();
};

socialMediaAccount.prototype.findAccountByIdandProvider = function(accountId, provider) {
  return SocialModel.findOne({accountId : accountId, provider : provider}).populate('userId').exec();
};

socialMediaAccount.prototype.update = function(id, userId) {
  return SocialModel.findByIdAndUpdate(id, {userId: userId}).exec();
};

socialMediaAccount.prototype.findByUserIdAndProvider = function(id, provider) {
 return SocialModel.findOne({userId: id, provider: provider}).exec();
};

module.exports = new socialMediaAccount();

