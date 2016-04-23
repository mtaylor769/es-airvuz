try {
	var log4js								= require('log4js');
	var logger								= log4js.getLogger('persistance.crud.Videos');

	var VideoCrud							= require('../../persistence/crud/videos');
	var EventTrackingCrud			= require('../../persistence/crud/events/eventTracking');

	if(global.NODE_ENV === "production") {
		logger.setLevel("INFO");
	}

	logger.debug("import complete");
}
catch(exception) {
	logger.error(" import error:" + exception);
}

function Video() {

}

Video.prototype.post = function(req, res) {
  VideoCrud
    .create(req.body)
    .then(function(video) {
      res.json(video);
    })
    .catch(function (err) {
      res.sendStatus(500);
    });
};

Video.prototype.get = function(req, res) {
	logger.debug(".get: BEG");
	EventTrackingCrud.create({
		codeSource	: "app.persistence.crud.videos.get",
		eventSource : "nodejs",
		eventType		: "get"		
	});
  VideoCrud
    .getById(req.params.id)
    .then(function(video) {
      res.send(video);
    })
};

Video.prototype.put = function(req, res) {
  VideoCrud
    .update({id: req.body._id, update: req.body})
    .then(function(video) {
      res.send(video);
    })
};

Video.prototype.delete = function(req, res) {
  VideoCrud
    .remove(req.params.id)
    .then(function(video) {
      res.sendStatus(200);
    })
};

module.exports = new Video();

//change crud and videos