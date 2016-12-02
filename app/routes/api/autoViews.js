try {
  var autoViews1_0_0 = require('../../routes/apiVersion/autoViews1-0-0')
}

catch(exception) {
  logger.error(exception);
}

var AutoViews = function() {};

var defaultVer = "1.0.0";

function incorrectVer(req, res) {
  logger.info("incorrect api version requested: " + req.query.apiVer +
    ", requester IP: " + req.connection.remoteAddress);
  res.status(400).json({error: "invalid api version"});
}

AutoViews.prototype.create = function(req, res) {
  var version = req.query.apiVer || defaultVer;

  if (version === "1.0.0") {
    autoViews1_0_0.create(req, res);
  }
  else {
    incorrectVer(req,res);
  }
};

AutoViews.prototype.getByVideoId = function(req, res) {
  var version = req.query.apiVer || defaultVer;

  if (version === "1.0.0") {
    autoViews1_0_0.getByVideoId(req, res);
  }
  else {
    incorrectVer(req,res);
  }
};

AutoViews.prototype.getAll = function(req, res) {
  var version = req.query.apiVer || defaultVer;

  if (version === "1.0.0") {
    autoViews1_0_0.getAll(req, res);
  }
  else {
    incorrectVer(req,res);
  }
};

AutoViews.prototype.setComplete = function(req, res) {
  var version = req.query.apiVer || defaultVer;

  if (version === "1.0.0") {
    autoViews1_0_0.setComplete(req, res);
  }
  else {
    incorrectVer(req,res);
  }
};

module.exports = new AutoViews();