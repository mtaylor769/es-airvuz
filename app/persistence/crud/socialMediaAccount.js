"use strict";

var Promise                     = require('bluebird');
var mongoose                    = require('mongoose');
var log4js                      = require('log4js');
var logger                      = log4js.getLogger('persistance.crud.Users');
var ErrorMessage                = require('../../utils/errorMessage');
var ObjectValidationUtil        = require('../../utils/objectValidationUtil');
var SocialModel                 = require('../model/socialMediaAccount');

var socialMediaAccount = function() {
  
  
}

socialMediaAccount.prototype.validateParams = function(params) {
  var sourceLocation = "persistence.crud.socialMediaAccount.create"
  var returnParams= {};
  if (params.provider === null) {
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
    returnParams.data.provider = params.provider;
  }

  if (params.accountData === null) {
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
    returnParams.data.accountData = params.accountData;
  }

  if (params.accountId === null) {
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
    returnParams.data.accountId = params.accountId;
  }
  return returnParams;
}

socialMediaAccount.prototype.create = function(params) {
  var validation = this.validateParams(params);
  return (new Promise(function(resolve, reject){
    if (validation.error !== null) {
      reject(validation.error);
    }

    //persist
    var newAccount = socialModel(validation.data)
    newAccount.save(function(error) {
      if (error) {
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
        resolve(newAccount);
      }
    });
  }));
}

socialMediaAccount.prototype.findAccountByIdandProvider = function(accountId, provider) {
  var validation = {};
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
    valdation.accountId        = accountId;
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
    if (validation.error !== null) {
      reject(validation.error);
    } else {
      SocialModel.findOne({
        $or : [
          {accountId : validation.accountId},
          { provider : validation.provider}
        ]
      })
      .exec(function(error, account){
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
          resolve(account);
        }
      });
    }
  }));

}


module.exports = new socialMediaAccount();