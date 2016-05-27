"use strict";
try {
  var log4js                      = require('log4js');
  var logger                      = log4js.getLogger('app.persistence.crud.slide');

  var Promise                     = require('bluebird');

  var ErrorMessage                = require('../../utils/errorMessage');
  var ObjectValidationUtil        = require('../../utils/objectValidationUtil');

  var database                    = require('../database/database');
  var SlideModel                  = database.getModelByDotPath({  modelDotPath  : "app.persistence.model.slide" });

}
catch(exception) {
  logger.error(" import error:" + exception);
}

function Slide() {

}

function getAllSlide(params) {
  return SlideModel.find().lean().exec();
}

function createSlide(params) {
  return (new SlideModel(params)).save();
}

function getSlide(id) {
  return SlideModel.findById(id).lean().exec();
}

function removeSlide(id) {
  return SlideModel.findOneAndRemove({_id: id}).exec();
}

Slide.prototype.getAllSlide = getAllSlide;
Slide.prototype.createSlide = createSlide;
Slide.prototype.getSlide    = getSlide;
Slide.prototype.removeSlide = removeSlide;

module.exports = new Slide();
