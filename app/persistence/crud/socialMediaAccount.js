"use strict";
try {
  var log4js                      = require('log4js');
  var logger                      = log4js.getLogger('app.persistence.crud.socialMediaAccount');
  var database                    = require('../database/database');
  var SocialModel                 = database.getModelByDotPath({  modelDotPath  : "app.persistence.model.socialMediaAccount" });
  var amazonConfig                = require('../../config/amazon.config');
}
catch(exception) {
  logger.error(" import error:" + exception);
}

var socialMediaAccount = function() {};

/**
 * set social profile picture
 * - only set picture to be small not large
 * - Mutability function
 * @param social
 * @param user
 */
function setProfilePicture(social, user) {
  if (social && user.profilePicture === '') {
    user.profilePicture = '//graph.facebook.com/' + social.accountId + '/picture?type=small';
  } else if (!social && user.profilePicture === '') {
    user.profilePicture = amazonConfig.CDN_URL + '/client/images/default.png';
  } else if (social && user.profilePicture.indexOf('facebook') > -1) {
    user.profilePicture = '//graph.facebook.com/' + social.accountId + '/picture?type=small';
  } else if (user.profilePicture.indexOf('http') === -1 && user.profilePicture.indexOf('image/profile-picture') === -1 && user.profilePicture.indexOf('images/default.png') === -1) {
    user.profilePicture = amazonConfig.CDN_URL + '/image/profile-picture' + user.profilePicture + '?size=50';
  }
}

socialMediaAccount.prototype.create = function(params) {
  return new SocialModel(params).save();
};

socialMediaAccount.prototype.findByUserId = function(userId) {
  return SocialModel.findOne({userId: userId}).exec();
};

socialMediaAccount.prototype.findAllSocialById = function(userId) {
  return SocialModel.find({userId: userId}).exec();
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

socialMediaAccount.prototype.remove = function(id) {
  return SocialModel.findByIdAndRemove(id).exec();
};

socialMediaAccount.prototype.setProfilePicture = setProfilePicture;

module.exports = new socialMediaAccount();

