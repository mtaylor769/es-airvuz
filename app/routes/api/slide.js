var slideCrud              = require('../../persistence/crud/slide');
var sliderCrud             = require('../../persistence/crud/slider');
var log4js                 = require('log4js');
var logger                 = log4js.getLogger('app.routes.api.slide');
var Promise                = require('bluebird');
var _                      = require('lodash');

function Slide() {

}

function post(req, res) {
  slideCrud
    .createSlide(req.body)
    .then(function (slide) {
      res.send(slide);
    });
}

function getAll(req, res) {
  return slideCrud
    .getAllSlide()
    .then(function(slides) {
      res.json(slides);
    });
}

function get(req, res) {
  return slideCrud
    .getSlide(req.params.id)
    .then(function (slide) {
      res.json(slide);
    });
}

function put(req, res) {
  return slideCrud
      .updateSlide(req.body)
      .then(function() {
          res.sendStatus(200);
      })
}

function remove(req, res) {
    return sliderCrud
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
            return slideCrud.removeSlide(req.params.id)
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
