var namespace = 'app.routes.aliVersion.slider1-0-0';
try {
    var log4js              = require('log4js');
    var logger              = log4js.getLogger(namespace);
    var sliderCrud1_0_0     = require('../../persistence/crud/slider1-0-0');

    if (global.NODE_ENV === "production") {
        logger.setLevel("INFO");
    }
}
catch(exception) {
    logger.error(" import error:" + exception);
}


function Slider() {

}
/**
 * route: PROTECTED POST /api/slider
 * @param req
 * @param res
 */
function post(req, res) {
  sliderCrud1_0_0
    .createSlider(req.body)
    .then(function (slider) {
      res.send(slider);
    });
}
/**
 * route: GET /api/slider
 * @param req
 * @param res
 * @returns {*}
 */
function getAll(req, res) {
  return sliderCrud1_0_0
    .getAllSlider()
    .then(function (sliders) {
      res.json(sliders);
    });
}
/**
 * route: GET /api/slider/:id
 * @param req
 * @param res
 * @returns {*}
 */
function get(req, res) {
  return sliderCrud1_0_0
    .getSlider(req.params.id)
    .then(function (slider) {
      res.json(slider);
    })
    .catch(function(error) {
        res.sendStatus(500);
    })
}
/**
 * route: PROTECTED PUT /api/slider/:id
 * @param req
 * @param res
 * @returns {*}
 */
function put(req, res) {
  return sliderCrud1_0_0
    .updateSlider(req.body)
    .then(function (slider) {
      res.json(slider);
    });
1}
/**
 * route: PROTECTED DELETE /api/slider/:id
 * @param req
 * @param res
 * @returns {*}
 */
function remove(req, res) {
  return sliderCrud1_0_0
    .removeSlider(req.params.id)
    .then(function () {
      res.sendStatus(200);
    })
    .catch(function () {
      res.sendStatus(500);
    })
}
/**
 * route: GET /api/home-slider/:id
 * @param req
 * @param res
 * @returns {*}
 */
function getHomeSlider(req, res) {
  return sliderCrud1_0_0.getHomeSlider(req.params.id)
    .then(function (slider) {
      res.json(slider);
    })
    .catch(function () {
      res.sendStatus(500);
    });
}

Slider.prototype.post           = post;
Slider.prototype.get            = get;
Slider.prototype.getAll         = getAll;
Slider.prototype.put            = put;
Slider.prototype.remove         = remove;
Slider.prototype.getHomeSlider  = getHomeSlider;

module.exports = new Slider();
