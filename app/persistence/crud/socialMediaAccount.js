"use strict";

var Promise                     = require('bluebird');
var mongoose                    = require('mongoose');
var log4js                      = require('log4js');
var logger                      = log4js.getLogger('app.persistance.crud.socialMediaAccount');
var ErrorMessage                = require('../../utils/errorMessage');
var ObjectValidationUtil        = require('../../utils/objectValidationUtil');
var SocialModel                 = require('../model/socialMediaAccount');

var socialMediaAccount = function() {
  
}

socialMediaAccount.prototype.validateParams = function(params) {
  logger.trace('Hitting validation for creating new social media account');
  var sourceLocation = "persistence.crud.socialMediaAccount.create"
  var returnParams = {};
  returnParams.data = {};
  var errorMessage    = new ErrorMessage();
  if (params.provider === null) {
    logger.error('provider is not okay: '+ params.provider)
    returnParams.error =  errorMessage.getErrorMessage({
        statusCode      : "400",
        errorId         : "VALIDA1000",
        templateParams  : {
          name : "social media account provider"
        },
        errorMessage    : "Social media account provider is null",
        sourceLocation  : sourceLocation
      });
  } else {
    logger.info('provider is okay: '+ params.provider)
    returnParams.data.provider = params.provider;
  }

  if (params.accountData === null) {
    logger.error('account data is null');
    returnParams.error =  errorMessage.getErrorMessage({
        statusCode      : "400",
        errorId         : "VALIDA1000",
        templateParams  : {
          name : "social media account data"
        },
        errorMessage    : "Social media account data is null",
        sourceLocation  : sourceLocation
      });
  } else {
    logger.info('account data is okay: '+ params.accountData);
    returnParams.data.accountData = params.accountData;
  }

  if (params.accountId === null) {
    logger.error('accountId is null');
    returnParams.error =  errorMessage.getErrorMessage({
        statusCode      : "400",
        errorId         : "VALIDA1000",
        templateParams  : {
          name : "social media account Id"
        },
        errorMessage    : "Social media account Id is null",
        sourceLocation  : sourceLocation
      });
  } else {
    logger.info('accountId is okay: ' + params.accountId);
    returnParams.data.accountId = params.accountId;
  }
  logger.trace('returning parameters');
  return returnParams;
}

socialMediaAccount.prototype.create = function(params) {
  logger.debug('hitting socialMediaAccount.prototype.create');
  var validation = this.validateParams(params);
  return (new Promise(function(resolve, reject){
    if (validation.error) {
      logger.error('Validation errors: ' + validation.error);
      reject(validation.error);
    }

    //persist
    var newAccount = SocialModel(validation.data);
    newAccount.save(function(error) {
      if (error) {
        logger.error('error saving new social media');
        logger.error(error);
        var errorMessage    = new ErrorMessage();
        errorMessage.getErrorMessage({
          statusCode      : "500",
          errorId         : "PERS1000",
          errorMessage    : "Failed while creating new social media account for user",
          sourceError     : error,
          sourceLocation  : "persistence.crud.socialMediaAccount.create"
        });
        reject(errorMessage.getErrors());
      } else {
        logger.trace('no issues saving new social media account');
        logger.info(newAccount);
        resolve(newAccount);
      }
    });
  }));
}

socialMediaAccount.prototype.findAccountByIdandProvider = function(accountId, provider) {
  logger.debug('find account by id and provider: ' + accountId + ' ' + provider);
  var validation        = {};
  validation.error      = null;
  var errorMessage      = new ErrorMessage();
  if (accountId === null) {
    validation.accountId       = null;
    validation.error    =  errorMessage.getErrorMessage({
        statusCode      : "400",
        errorId         : "VALIDA1000",
        templateParams  : {
          name : "social media account Id"
        },
        errorMessage    : "Social media account Id is null",
        sourceLocation  : "persistence.crud.socialMediaAccount.findAccountByIdandProvider"
      });
  } else {
    validation.accountId        = accountId;
  }
  if (provider === null) {
    validation.provider = null;
    validation.error    =  errorMessage.getErrorMessage({
        statusCode      : "400",
        errorId         : "VALIDA1000",
        templateParams  : {
          name : "social media provider"
        },
        errorMessage    : "Social media provider null",
        sourceLocation  : "persistence.crud.socialMediaAccount.findAccountByIdandProvider"
      });
  } else {
    validation.provider = provider;
  }
  return (new Promise(function(resolve, reject){
    if (validation.error) {
      logger.error('validation errors: ' + validation.error);
      reject(validation.error);
    } else {
      logger.debug('no validation errors');
      SocialModel.findOne({ $or : [{accountId : validation.accountId}, { provider : validation.provider}]}, 
        function(error, account){
        if (error) {
          var errorMessage    = new ErrorMessage();
          errorMessage.getErrorMessage({
            statusCode      : "500",
            errorId         : "PERS1000",
            errorMessage    : "Failed while getting social media account by id and provider",
            sourceError     : error,
            sourceLocation  : "persistence.crud.socialMediaAccount.findAccountByIdandProvider"
          });
          reject(errorMessage.getErrors());
        } else {
          logger.debug('success in finding by account id and provider '+ account);
          resolve(account);
        }
      });
    }
  }));
}


module.exports = new socialMediaAccount();