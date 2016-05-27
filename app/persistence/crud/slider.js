"use strict";
try {
  var log4js											= require('log4js');
  var logger											= log4js.getLogger('app.persistence.crud.slider');

  var Promise											= require('bluebird');

  var ErrorMessage								= require('../../utils/errorMessage');
  var ObjectValidationUtil				= require('../../utils/objectValidationUtil');

  var database										= require('../database/database');
  var mongoose                    = require('mongoose');
  var SliderModel									= database.getModelByDotPath({	modelDotPath	: "app.persistence.model.slider" });

}
catch(exception) {
  logger.error(" import error:" + exception);
}



function Slider() {

}

function getAllSlider(params) {
  return SliderModel.find().populate('slides').lean().exec();
}

function updateSlider(params) {
  return SliderModel.findById(params._id, params).exec();
}

function getSlider() {
  return SliderModel.findById(params._id, params).populate('slides').exec();
}

function createSlider(params) {
  return (new SliderModel(params)).save();
}

function removeSlider(id) {
  return SliderModel.findOneAndRemove({_id: id}).exec();
}

/**
 * Get current slide now between startDate and endDate
 * @returns {Promise}
 * @private
 */
function _getCurrentSlider() {
  return SliderModel.findOne({
    startDate: {$lte: new Date()},
    endDate: {$gte: new Date()}
  }).populate('slides').lean().exec()
    .then(function (slider) {
      if (slider) {
        return SliderModel.populate(slider, {path: 'slides.video', model: 'Video'}).then(function (slider) {
          return SliderModel.populate(slider, {path: 'slides.video.userId', model: 'Users'});
        });
      }
      return {};
    });
}

/**
 * Get slider for home page
 * @param id {string} [optional] - id of slider set to show
 * @returns {Promise}
 */
function getHomeSlider(id) {
  if (id && mongoose.Types.ObjectId.isValid(id)) {
    return SliderModel.findOne({_id: id}).populate('slides').lean().exec()
      .then(function (slider) {
        if (slider) {
          return SliderModel.populate(slider, {path: 'slides.video', model: 'Video'});
        }
        return _getCurrentSlider();
      })
  }
  return _getCurrentSlider();
}

Slider.prototype.getAllSlider = getAllSlider;
Slider.prototype.updateSlider = updateSlider;
Slider.prototype.getSlider    = getSlider;
Slider.prototype.createSlider = createSlider;
Slider.prototype.removeSlider = removeSlider;
Slider.prototype.getHomeSlider = getHomeSlider;

module.exports = new Slider();
