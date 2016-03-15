"use strict";

var Promise                     = require('bluebird');
var mongoose                    = require('mongoose');
var log4js                      = require('log4js');
var logger                      = log4js.getLogger('persistance.crud.Users');
var ErrorMessage                = require('../../utils/errorMessage');
var ObjectValidationUtil        = require('../../utils/objectValidationUtil');
var socialModel                 = require('../model/socialMediaAccount');

var socialMediaAccount = function() {
  
  
}

socialMediaAccount.prototype.validateParams = function(params) {
  var sourceLocation = "persistence.crud.socialMediaAccount.create"
  var returnParams= {};
  if (params.accountType === null) {
    returnParams.error =  errorMessage.getErrorMessage({
        statusCode      : "400",
        errorId         : "VALIDA1000",
        templateParams  : {
          name : "social media account type"
        },
        errorMessage    : "Social media account type is null",
        sourceLocation  : sourceLocation
      });
  } else {
    returnParams.data.accountType = params.accountType;
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

module.exports = new socialMediaAccount();