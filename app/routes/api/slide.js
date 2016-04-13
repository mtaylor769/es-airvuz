var slideCrud              = require('../../persistence/crud/slide');
var log4js                 = require('log4js');
var logger                 = log4js.getLogger('app.routes.api.slide');

function Slide() {

}

function post(req, res) {
  slideCrud
    .createSlide(req.body)
    .then(function (user) {
      res.send(user);
    });
}

function getAll(req, res) {
  return slideCrud
    .getAllSlide()
    .then(function (user) {
      res.json(user);
    });
}

function get(req, res) {
  return slideCrud
    .getSlide(req.params.id)
    .then(function (user) {
      res.json(user);
    });
}

function put(req, res) {
  // TODO
}

Slide.prototype.post         = post;
Slide.prototype.get          = get;
Slide.prototype.getAll       = getAll;
Slide.prototype.put          = put;

module.exports = new Slide();
