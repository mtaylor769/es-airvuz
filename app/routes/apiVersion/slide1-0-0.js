var namespace = 'app.routes.apiVersion.slide1-0-0';

try {
    var log4js                 = require('log4js');
    var logger                 = log4js.getLogger(namespace);
    var Promise                = require('bluebird');
    var _                      = require('lodash');

    var slideCrud1_0_0         = require('../../persistence/crud/slide1-0-0');
    var sliderCrud1_0_0        = require('../../persistence/crud/slider1-0-0');

    if (global.NODE_ENV === "production") {
        logger.setLevel("INFO");
    }
}
catch(exception) {
    logger.error(" import error:" + exception);
}

function Slide() {}
/**
 *
 * @param req
 * @param res
 */
function post(req, res) {
  slideCrud1_0_0
    .createSlide(req.body)
    .then(function (slide) {
      res.send(slide);
    });
}
/**
 *
 * @param req
 * @param res
 * @returns {*}
 */
function getAll(req, res) {
  return slideCrud1_0_0
    .getAllSlide()
    .then(function(slides) {
      res.json(slides);
    });
}
/**
 *
 * @param req
 * @param res
 * @returns {*}
 */
function get(req, res) {
  return slideCrud1_0_0
    .getSlide(req.params.id)
    .then(function (slide) {
      res.json(slide);
    });
}
/**
 *
 * @param req
 * @param res
 * @returns {*}
 */
function put(req, res) {
  return slideCrud1_0_0
      .updateSlide(req.body)
      .then(function() {
          res.sendStatus(200);
      })
}
/**
 *
 * @param req
 * @param res
 * @returns {*}
 */
function remove(req, res) {
    return sliderCrud1_0_0
        .getAllSlidersForDelete()
        .then(function(sliders) {
          return Promise.map(sliders, function(slider) {
              if(slider.slides.indexOf(req.params.id)) {
                  var removeIndex = slider.slides.indexOf(req.params.id);
                  slider.slides.splice(removeIndex, 1);
                  return slider.save();
              } else {
              return;
              }
          })
        })
        .then(function() {
            return slideCrud1_0_0.removeSlide(req.params.id)
        })
        .then(function() {
            res.sendStatus(200);
        })
        .catch(function(error) {
          res.sendStatus(500);
        })
}

Slide.prototype.post         = post;
Slide.prototype.get          = get;
Slide.prototype.getAll       = getAll;
Slide.prototype.put          = put;
Slide.prototype.remove       = remove;

module.exports = new Slide();
