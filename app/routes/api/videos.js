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
    .catch(function (error) {
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
    .catch(function (error) {
      res.sendStatus(500);
    });
};

Video.prototype.put = function(req, res) {
  VideoCrud
    .update({id: req.body._id, update: req.body})
    .then(function(video) {
      res.send(video);
    })
    .catch(function (error) {
      res.sendStatus(500);
    });
};

Video.prototype.delete = function(req, res) {
  VideoCrud
    .remove(req.params.id)
    .then(function(video) {
      res.sendStatus(200);
    })
    .catch(function (error) {
      res.sendStatus(500);
    });
};

Video.prototype.like = function(req, res) {
  VideoCrud
    .getById(req.body.id)
    .then(function(video) {
      VideoCrud
        .like(video, req.body.like)
        .then(function(comment) {
          res.sendStatus(200);
        })
        .catch(function (error) {
          res.sendStatus(500);
        });
    })
    .catch(function (error) {
      res.sendStatus(500);
    });
};

Video.prototype.loaded = function(req, res) {
  console.log(req.body);
  VideoCrud
    .getById(req.body.videoId)
    .then(function(video) {
      video.viewCount = video.viewCount + 1;
      VideoCrud
        .upCount(video)
        .then(function() {
          res.sendStatus(200);
        })
        .catch(function(error) {
        res.send(error);
      })
    })
    .catch(function(error) {
      res.send(error);
    })
};

Video.prototype.showcaseUpdate = function(req, res) {
  var params = req.body;
  VideoCrud
    .update({id: params.id, update: params})
    .then(function(video) {
      console.log('post update : ' + video);
      res.sendStatus(200);
    })
    .catch(function(error) {
      res.send(error)
    })

};

module.exports = new Video();

//change crud and videos