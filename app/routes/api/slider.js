var sliderCrud              = require('../../persistence/crud/slider');
var log4js                 = require('log4js');
var logger                 = log4js.getLogger('app.routes.api.slider');

function Slider() {

}

function post(req, res) {
  sliderCrud
    .createSlider(req.body)
    .then(function (slider) {
      res.send(slider);
    });
}

function getAll(req, res) {
  return sliderCrud
    .getAllSlider()
    .then(function (sliders) {
      res.json(sliders);
    });
}

function get(req, res) {
  return sliderCrud
    .getSlider(req.params.id)
    .then(function (slider) {
      res.json(slider);
    })
    .catch(function(error) {
        res.sendStatus(500);
    })
}

function put(req, res) {
  return sliderCrud
    .updateSlider(req.body)
    .then(function (slider) {
      res.json(slider);
    });
}

function remove(req, res) {
  return sliderCrud
    .removeSlider(req.params.id)
    .then(function () {
      res.sendStatus(200);
    })
    .catch(function () {
      res.sendStatus(500);
    })
}

function getHomeSlider(req, res) {
  return sliderCrud.getHomeSlider(req.params.id)
    .then(function (slider) {
      res.json(slider);
    })
    .catch(function () {
      res.sendStatus(500);
    });
}

Slider.prototype.post         = post;
Slider.prototype.get          = get;
Slider.prototype.getAll       = getAll;
Slider.prototype.put          = put;
Slider.prototype.remove       = remove;
Slider.prototype.getHomeSlider= getHomeSlider;

module.exports = new Slider();
