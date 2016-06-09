"use strict";
try {
  var log4js                      = require('log4js');
  var logger                      = log4js.getLogger('app.persistence.crud.forms');

  var database                    = require('../database/database');
  var FormsModel                  = database.getModelByDotPath({  modelDotPath  : "app.persistence.model.forms" });

}
catch(exception) {
  logger.error(" import error:" + exception);
}

function Forms() {}

function createForms(params) {
  return (new FormsModel(params)).save();
}

/**
 * get total count
 * @param params
 * @returns {Promise}
 */
function getCount(params) {
  return FormsModel.count(params).exec();
}


Forms.prototype.createForms = createForms;
Forms.prototype.getCount    = getCount;

module.exports = new Forms();
