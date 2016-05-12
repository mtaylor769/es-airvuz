try {
	var log4js								= require('log4js');
  var nodemailer            = require('nodemailer');
	var logger								= log4js.getLogger('persistance.crud.Videos');

	var VideoCrud							= require('../../persistence/crud/videos');
  var VideoLikeCrud         = require('../../persistence/crud/videoLike');
  var FollowCrud            = require('../../persistence/crud/follow');
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

Video.prototype.reportVideo = function(req, res) {
  var params = req.body;
  var transport = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user:'support@airvuz.com',
      pass:'b5&YGG6n'
    }
  });

  var mailOptions = {
    from:'noreply <noreply@airvuz.com>',
    to: 'support@airvuz.com',
    subject: 'video reported : '+params.videoId,
    html:'<p>A report has been submitted for video Id : '+params.videoId+ '.<br> Issue : ' +params.message+'<br><a href="beta2.airvuz.com/videoPlayer/' + params.videoId+'"> Click here to go to video</a></p>'
  };

  transport.sendMail(mailOptions, function(error, message) {
    if(error) {
      res.sendStatus(400);
    } else {
      res.sendStatus(200);
    }
  })

};

Video.prototype.videoInfoCheck = function(req, res) {
  var returnObject = {};
  var userId = req.query.userId;
  var videoId = req.query.videoId;
  var videoUserId = req.query.videoUserId;
  var likeObject = {};
  likeObject.videoId = videoId;
  likeObject.userId = userId;
  var followObject = {};
  followObject.userId = userId;
  followObject.followingUserId = videoUserId;

  console.log('1');

  VideoLikeCrud
    .videoLikeCheck(likeObject)
    .then(function(like) {
      returnObject.like = !!like;

      return FollowCrud.followCheck(followObject);
    })
    .then(function(follow) {
      returnObject.follow = !!follow;

      res.json(returnObject);
    })
    .catch(function(error) {
      res.sendStatus(500);
    });
};

module.exports = new Video();

//change crud and videos