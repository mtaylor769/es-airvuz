"use strict";
try {
  var log4js											= require('log4js');
  var logger											= log4js.getLogger('app.persistance.crud.slider');

  var Promise											= require('bluebird');

  var ErrorMessage								= require('../../utils/errorMessage');
  var ObjectValidationUtil				= require('../../utils/objectValidationUtil');

  var database										= require('../database/database');
  var SliderModel									= database.getModelByDotPath({	modelDotPath	: "app.persistence.model.slider" });

}
catch(exception) {
  logger.error(" import error:" + exception);
}



function Slider() {

}

function getAllSlider(params) {
  return SliderModel.find().lean().exec();
}

function updateSlider(params) {
  return SliderModel.findById(params._id, params).exec();
}

function getSlider() {

}

function createSlider(params) {
  return (new SliderModel(params)).save();
}

Slider.prototype.getAllSlider = getAllSlider;
Slider.prototype.updateSlider = updateSlider;
Slider.prototype.getSlider    = getSlider;
Slider.prototype.createSlider = createSlider;

module.exports = new Slider();
