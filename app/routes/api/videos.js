try {
	var log4js								= require('log4js');
  var nodemailer            = require('nodemailer');
	var logger								= log4js.getLogger('app.routes.api.videos');

	var VideoCrud							= require('../../persistence/crud/videos');
	var VideoCollection				= require('../../persistence/crud/videoCollection');
  var CategoryType	        = require('../../persistence/crud/categoryType');
  var VideoLikeCrud         = require('../../persistence/crud/videoLike');
  var VideoViewCrud         = require('../../persistence/crud/videoViews');
  var FollowCrud            = require('../../persistence/crud/follow');
	var EventTrackingCrud			= require('../../persistence/crud/events/eventTracking');
  var amazonService         = require('../../services/amazon.service.server.js');

	if(global.NODE_ENV === "production") {
		logger.setLevel("INFO");
	}

	logger.debug("import complete");
}
catch(exception) {
	logger.error(" import error:" + exception);
}

function Video() {}

function getVideosByCategory(req, res) {
  var TOTAL_PER_PAGE  = 20,
      PAGE            = req.params.page,
      CATEGORY_TYPE   = req.params.category,
      videoPromise;

  videoPromise = CategoryType.getByUrl(CATEGORY_TYPE)
    .then(function (category) {
      switch(CATEGORY_TYPE) {
        case 'Featured Videos':
          return VideoCollection.getFeaturedVideos(TOTAL_PER_PAGE, PAGE);
        case 'Staff Pick Videos':
          return VideoCollection.getStaffPickVideos(TOTAL_PER_PAGE, PAGE);
        case 'Recent Videos':
          return VideoCrud.getRecentVideos(TOTAL_PER_PAGE, PAGE);
        case 'Trending Videos':
          return VideoCrud.getTrendingVideos(TOTAL_PER_PAGE, PAGE);
        case 'Follower Videos':
          // follow should only be call if user is login
          return FollowCrud.getFollow(req.user._id)
            .then(function (users) {
              return VideoCrud.getVideosByFollow(TOTAL_PER_PAGE, PAGE, users.map(function (user) {return user.followingUserId}));
            });
        default:
          return VideoCrud.getVideoByCategory(TOTAL_PER_PAGE, PAGE, category._id);
      }
    });

  Promise.resolve(videoPromise).then(function (videos) {
    res.json(videos);
  });
}

Video.prototype.post = function(req, res) {
  if (req.body.isCustomThumbnail) {
    // move custom thumbnail to the correct directory
    // TODO: resize to 392x220
    var newName = 'tn-custom.' + req.body.customThumbnail.split('.')[1];
    req.body.thumbnailPath = req.body.hashName + '/' + newName;

    amazonService.moveFile({key: req.body.customThumbnail, dir: amazonService.config.OUTPUT_BUCKET + '/' + req.body.hashName, newName: newName})
      .then(function () {
        return VideoCrud.create(req.body);
      })
      .then(function (video) {
        res.json(video);
      })
      .catch(function () {
        res.sendStatus(500);
      })
  } else {
    VideoCrud
      .create(req.body)
      .then(function(video) {
        res.json(video);
      })
      .catch(function (error) {
        res.sendStatus(500);
      });
  }
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
  if (req.body.isCustomThumbnail) {
    // move custom thumbnail to the correct directory
    // TODO: resize to 392x220
    var newName = 'tn-custom.' + req.body.customThumbnail.split('.')[1];
    req.body.thumbnailPath = req.body.hashName + '/' + newName;

    amazonService.moveFile({key: req.body.customThumbnail, dir: amazonService.config.OUTPUT_BUCKET + '/' + req.body.hashName, newName: newName})
      .then(function () {
        return VideoCrud.update({id: req.body._id, update: req.body})
      })
      .then(function (video) {
        res.json(video);
      })
      .catch(function () {
        res.sendStatus(500);
      })
  } else {
    VideoCrud
      .update({id: req.body._id, update: req.body})
      .then(function(video) {
        res.send(video);
      })
      .catch(function (error) {
        res.sendStatus(500);
      });
  }
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
      return VideoCrud.like(video, req.body.like)
    })
    .then(function(comment) {
      res.sendStatus(200);
    })
    .catch(function (error) {
      res.sendStatus(500);
    });
};

Video.prototype.loaded = function(req, res) {
  var params = req.body;
  console.log(params);
  VideoCrud
    .getById(params.videoId)
    .then(function(video) {
      video.viewCount = video.viewCount + 1;
      return VideoCrud.upCount(video);
    })
    .then(function(video) {
      return VideoViewCrud.create(params);
    })
    .then(function(videoView) {
      console.log('videoView');
      console.log(videoView);
      res.sendStatus(200);
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
    html:'<p>A report has been submitted for video Id : '+params.videoId+ '.<br> Issue : ' +params.message+'<br><a href="www.airvuz.com/videoPlayer/' + params.videoId+'"> Click here to go to video</a></p>'
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
      console.log(follow);
      returnObject.follow = !!follow;
      res.json(returnObject);
    })
    .catch(function(error) {
      res.sendStatus(500);
    });
};

Video.prototype.getVideosByUser = function(req, res) {
  var dataStatus = {};
  EventTrackingCrud.create({
    codeSource  : "app.persistence.crud.videos.user.get",
    eventSource : "nodejs",
    eventType   : "get"   
  });
  VideoCrud
    .getByUser(req.params.id, req.query.sortBy)
    .then(function(videos) {
      dataStatus.status     = 'OK';
      dataStatus.code       = 200;
      dataStatus.data       = videos;
      res.send(dataStatus);
    })
    .catch(function (error) {
      dataStatus.status     = 'Fail';
      dataStatus.code       = 500;
      dataStatus.data       = error;
      res.send(dataStatus);
    });
};

Video.prototype.getShowcaseByUser = function(req, res) {
  var dataStatus = {};
  EventTrackingCrud.create({
    codeSource  : "app.persistence.crud.videos.user.get",
    eventSource : "nodejs",
    eventType   : "get"   
  });
  VideoCrud
  .getByUser(req.params.id, req.query.sortBy)
  .then(function(videos) {
    dataStatus.status     = 'OK';
    dataStatus.code       = 200;
    dataStatus.data       = videos;
    res.send(dataStatus);
  })
  .catch(function (error) {
    dataStatus.status     = 'Fail';
    dataStatus.code       = 500;
    dataStatus.data       = error;
    res.send(dataStatus);
  });
};

Video.prototype.getVideosByCategory = getVideosByCategory;

module.exports = new Video();

//change crud and videos