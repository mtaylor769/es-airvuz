var sliderCrud              = require('../../persistence/crud/slider');
var log4js                 = require('log4js');
var logger                 = log4js.getLogger('app.routes.api.slider');

function Slider() {

}

function post(req, res) {
  sliderCrud
    .createSlider(req.params)
    .then(function (user) {
      res.send(user);
    });
}

function getAll(req, res) {
  return sliderCrud
    .getAllSlider()
    .then(function (user) {
      res.json(user);
    });
}

function get(req, res) {
  return sliderCrud
    .getSlider(req.params.id)
    .then(function (user) {
      res.json(user);
    });
}

function put(req, res) {
  return sliderCrud
    .updateSlider(req.params.id)
    .then(function (user) {
      res.json(user);
    });
}

Slider.prototype.post         = post;
Slider.prototype.get          = get;
Slider.prototype.getAll       = getAll;
Slider.prototype.put          = put;

module.exports = new Slider();
