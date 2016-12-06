try {
  var autoViewsCrud1_0_0 = require('../../persistence/crud/autoView1-0-0')
}

catch(exception) {
  logger.error(exception);
}

var AutoViews = function() {};

AutoViews.prototype.create = function(req, res) {
  var viewData = req.body;
  return autoViewsCrud1_0_0.create(viewData)
    .then(function() {
      res.sendStatus(200);
    })
    .catch(function(error) {
      logger.error(error);
      res.sendStatus(500);
    });
};

AutoViews.prototype.getByVideoId = function(req, res) {
  var videoId = req.params.id;
  return autoViewsCrud1_0_0.getByVideoId(videoId)
    .then(function(autoViews) {
      res.send(autoViews);
    })
    .error(function(error) {
      logger.error(error);
      res.sendStatus(500);
    })
};

AutoViews.prototype.getAll = function(req, res) {
  return autoViewsCrud1_0_0.getAll()
    .then(function(autoViews) {
      res.send(autoViews);
    })
    .catch(function(error) {
      logger.error(error);
      res.sendStatus(500);
    })
};

AutoViews.prototype.setComplete = function(req, res) {
  var autoViewId = req.params.id;
  return autoViewsCrud1_0_0.setComplete(autoViewId)
    .then(function() {
      res.sendStatus(200);
    })
    .catch(function(error) {
      logger.error(error);
      res.sendStatus(500);
    });
};

module.exports = new AutoViews();