var namespace = 'app.routes.apiVersion.videos1-0-0';

try {
    var log4js				        = require('log4js');
    var nodemailer                  = require('nodemailer');
    var request                     = require('request');
    var Promise                     = require('bluebird');
    var _                           = require('lodash');
    var image                       = require('../../services/image.service.server');
    var logger				        = log4js.getLogger(namespace);
    var moment				        = require('moment');

    var videoCrud1_0_0			    = require('../../persistence/crud/videos1-0-0');
    var videoCollCrud1_0_0		    = require('../../persistence/crud/videoCollection1-0-0');
    var catTypeCrud1_0_0	        = require('../../persistence/crud/categoryType1-0-0');
    var videoLikeCrud1_0_0          = require('../../persistence/crud/videoLike1-0-0');
    var VideoViewCrud               = require('../../persistence/crud/videoViews');
    var followCrud1_0_0             = require('../../persistence/crud/follow1-0-0');
    var EventTrackingCrud		    = require('../../persistence/crud/events/eventTracking');
    var TrendingvideoCrud1_0_0	    = require('../../persistence/crud/trendingVideos');
    var amazonService               = require('../../services/amazon.service.server.js');
    var usersCrud1_0_0              = require('../../persistence/crud/users1-0-0');
    var SocialCrud                  = require('../../persistence/crud/socialMediaAccount');
    var commentCrud1_0_0            = require('../../persistence/crud/comment1-0-0');

    var autoView                    = require('../../persistence/crud/autoView1-0-0');

    var md5                         = require('md5');
    var viewManager                 = require('../../views/manager/viewManager');

    if(global.NODE_ENV === "production") {
        logger.setLevel("INFO");
    }
}
catch(exception) {
    logger.error(" import error:" + exception);
}

function Video() {}
/**
 * route: GET /api/videos/category/NAME
 * @param req
 * @param res
 * @returns
 *   {
    "_id": "57f94166f7ed1b028465f43b",
    "userId": {
      "_id": "57f3eff096190c114272aa8a",
      "userNameDisplay": "bluemagma-at-gmail",
      "userNameUrl": "bluemagma-at-gmail"
    },
    "title": "video title2",
    "duration": "1",
    "thumbnailPath": "/images",
    "viewCount": 0,
    "uploadDate": "6 minutes ago",
    "categories": [
      {
        "_id": "574f91b3b55602296def65be",
        "categoryTypeUrl": "action-extreme-sports",
        "name": "Action/Extreme Sports"
      }
    ]
  }
 */
function getVideosByCategory(req, res) {
    var TOTAL_PER_PAGE  = 20,
        CATEGORY_TYPE   = req.params.category,
        videoPromise;

    var videosParam = {
        total: TOTAL_PER_PAGE,
        page: req.query.page || 1,
        sort: req.query.sort || 'uploadDate'
    };

    videoPromise = catTypeCrud1_0_0.getByUrl(CATEGORY_TYPE)
        .then(function (category) {
            switch(CATEGORY_TYPE) {
                case 'featured-drone-videos':
                    return videoCollCrud1_0_0.getFeaturedVideos();
                case 'staff-picks-drone-videos':
                    return videoCollCrud1_0_0.getStaffPickVideos();
                case 'latest-drone-videos':
                    return videoCrud1_0_0.getRecentVideos(videosParam);
                case 'trending-drone-videos':
                    var promises = [
                        videoCollCrud1_0_0.getFeaturedVideos(),
                        videoCollCrud1_0_0.getStaffPickVideos(),
                        TrendingvideoCrud1_0_0.getVideos({total: 50, page: videosParam.page})
                    ];

                    return Promise.all(promises)
                        .spread(function (featureVideos, staffPickVideos, trendingVideos) {
                            var videoToOmit = [];

                            featureVideos.concat(staffPickVideos).forEach(function toOmit(video) {
                                videoToOmit.push(video._id.toString());
                            });

                            return _.chain(trendingVideos).reject(function (video) {
                                return videoToOmit.indexOf(video._id.toString()) > -1;
                            }).take(20).value();
                        });
                case 'following-drone-videos':
                    // follow should only be call if user is login
                    return followCrud1_0_0.getFollow(req.user._id)
.then(function (users) {
    videosParam.users = users.map(function (user) {
        return user.followingUserId
    });

    return videoCrud1_0_0.getVideosByFollow(videosParam);
});
default:
videosParam.categoryId = category._id;
return videoCrud1_0_0.getVideoByCategory(videosParam);
}
});

Promise.resolve(videoPromise).then(function (videos) {
    res.json(videos);
}).catch(function (error) {
    logger.error(error);
    res.sendStatus(500);
});
}
/**
 * route: GET /api/videos/search/?q=USERID, DESCRIPTION, TITLE, VIDEOLOCATION, TAGS
 * @param req
 * @param res
 * @returns
 * {
      "_id": "57f51a6edd80c202616dedf8",
      "userId": {
        "_id": "57e96a719ddd2b02f44f3367",
        "userNameDisplay": "bryceb",
        "userNameUrl": "bryceb"
      },
      "title": "my video has a first name",
      "duration": "00:33",
      "thumbnailPath": "e7da06ba1ec331ea368b58068228d5ae/tn_00003.jpg",
      "viewCount": 6,
      "uploadDate": "3 days ago",
      "categories": [
        {
          "_id": "574f91b3b55602296def65a2",
          "categoryTypeUrl": "air-to-air",
          "name": "Air-To-Air/Formation Flying"
        },
        {
          "_id": "57f2ad221f8de106812daba1",
          "name": "AirVus News"
        }
      ]
    }
 */
function search(req, res) {
    var currentPage = parseInt(req.query.page, 10) || 1;
    videoCrud1_0_0.search(req.query.q, currentPage)
      .then(function (result) {
          res.json(result);
      })
      .catch(function (err) {
          res.sendStatus(500);
      });
}
/**
 * upload custom thumbnail if exists
 * - this function change body.thumbnailPath (req)
 * @param body
 * @returns {*}
 * @private
 */
function _uploadCustomThumbnail(body) {
    if (body.isCustomThumbnail && body.customThumbnail) {
        // resize and upload custom thumbnail to the correct directory
        var newName = md5('tn_custom-' + Date.now()) + '.' + body.customThumbnail.split('.')[1];
        body.thumbnailPath = body.hashName + '/' + newName;

        var readStream = request('https:' + amazonService.config.TEMP_URL + body.customThumbnail);
        var stream = image.resize(readStream, {width: 392, height: 220});

        return amazonService.uploadToS3(amazonService.config.OUTPUT_BUCKET, body.thumbnailPath, stream)
          .then(function () {
              return body;
          });
    }
    return body;
}
/**
 *
 * @param body
 * @returns {*}
 * @private
 */
function _cleanUpReupload(body) {
    if (body.reupload && body.reupload === true) {
        // cleanup old path
        return body;
    }
    return body;
}
/**
 * route: PROTECTED POST /api/videos
 * @param req
 * @param res
 * @returns
 * {
  "__v": 0,
  "userId": "57f3eff096190c114272aa8a",
  "title": "video title2",
  "description": "description",
  "duration": "1",
  "videoPath": "/video",
  "thumbnailPath": "/images",
  "videoLocation": "earth",
  "droneType": null,
  "cameraType": null,
  "_id": "57f94166f7ed1b028465f43b",
  "seoTags": [],
  "internalTags": [],
  "viewCount": 0,
  "uploadDate": "2016-10-08T18:56:38.155Z",
  "tags": null,
  "recordDate": "2016-10-08T18:56:38.155Z",
  "openGraphCacheDate": "2016-10-08T15:41:59.462Z",
  "likeCount": 0,
  "isActive": true,
  "commentCount": 0,
  "categories": [
    "574f91b3b55602296def65be"
  ],
  "allowRatings": true,
  "allowComments": true
}
 */
function post (req, res) {
    Promise.resolve(req.body)

        .then(_uploadCustomThumbnail)
        .then(function () {
            return videoCrud1_0_0.create(req.body);
        })
        .then(function (video) {
            autoView.autoCreate( { videoId: video._id } );
            res.json(video);
        })
        .catch(function (error) {
            if (error.length) {
                return res.status(400).json({error: error});
            }
            res.sendStatus(500);
        });
}
/**
 * route: GET /api/video/:id
 * @param req
 * @param res
 * @returns
 * {
    "_id": "5786b2650dcf2c261b0ee241",
    "userId": "5786b04d12c8c30d1bd5dc9f",
    "title": "Waimea Bay by Drone",
    "description": "Short video of some clips I captured at Waimea Bay on Oahu's North Shore.",
    "duration": "00:52",
    "videoPath": "ea3c0df4f0e0e96875697fc55e2a53fa/ea3c0df4f0e0e96875697fc55e2a53fa.mp4",
    "thumbnailPath": "ea3c0df4f0e0e96875697fc55e2a53fa/tn-custom.28",
    "droneType": "574f91b3b55602296def65c5",
    "cameraType": "574f91b3b55602296def6598",
    "videoLocation": "Waimea Bay, Oahu's North Shore ",
    "viewCount": 115169,
    "uploadDate": "2016-07-13T21:28:05.290Z",
    "tags": [
        "Oahu",
        "hawaii",
        "aloha",
        "dji",
        "djiglobal",
        "travel",
        "film"
    ],
    "recordDate": "2016-07-13T21:28:05.290Z",
    "openGraphCacheDate": "2016-07-13T18:36:03.995Z",
    "likeCount": 30,
    "isActive": true,
    "commentCount": 32,
    "categories": [
        {
            "_id": "574f91b3b55602296def65bf",
            "categoryTypeUrl": "aerial-reels-and-compilations",
            "name": "Aerial Reels and Compilations",
            "nameV1": "Compilations",
            "isVisible": true
        },
        {
            "_id": "574f91b3b55602296def65aa",
            "categoryTypeUrl": "nature-and-wildlife",
            "name": "Nature and Wildlife",
            "nameV1": "Nature & Wildlife",
            "isVisible": true
        },
        {
            "_id": "574f91b3b55602296def65af",
            "categoryTypeUrl": "travel",
            "name": "Travel",
            "nameV1": "Travel",
            "isVisible": true
        }
    ],
    "allowRatings": true,
    "allowComments": true,
    "__v": 1,
    "internalTags": [
        "something"
    ],
    "seoTags": [
        "someont"
    ],
    "internalRanking": 2,
    "curation": {
        "isSeoTagged": true,
        "isTagged": true,
        "isRanked": true
    }
}
 */
function get (req, res) {
    logger.debug(".get: BEG");
    EventTrackingCrud.create({
        codeSource	: "app.persistence.crud.videos.get",
        eventSource : "nodejs",
        eventType		: "get"
    });
    videoCrud1_0_0
      .getById(req.params.id)
      .then(function(video) {
          res.send(video);
      })
      .catch(function (error) {
          res.sendStatus(500);
      });
}

/**
 * check if user is the owner of the video
 * @param video
 * @param user
 * @returns {boolean}
 */
function isVideoOwner(video, user) {
  return video.userId.toString() === user._id.toString();
}

/**
 * check if user have the allow role
 * @param user
 * @returns {boolean}
 */
function hasAllowedRole(user) {
  return user.aclRoles.indexOf('root') > -1 || user.aclRoles.indexOf('video-root') > -1 || user.aclRoles.indexOf('video-admin') > -1;
}

/**
 * route: PROTECTED PUT /api/videos/:id
 * @param req note: req.body needs to contain all fields not just the one to update
 * @param res
 */
function updateVideo(req, res) {
  videoCrud1_0_0.getById(req.params.id)
    .then(function (currentVideo) {
      return isVideoOwner(currentVideo, req.user) || hasAllowedRole(req.user);
    })
    .then(function (isAllowed) {
      if (!isAllowed) {
        return Promise.reject('Not allowed to update video');
      }
      return Promise.resolve(req.body)
        .then(_uploadCustomThumbnail)
        .then(_cleanUpReupload)
        .then(function () {
          return videoCrud1_0_0.update({id: req.params.id, update: req.body});
        });
    })
    .then(function (video) {
      res.json(video);
    })
    .catch(function (err) {
      if (err.length) {
        return res.status(400).json({error: err});
      }
      if (err === 'Not allowed to update video') {
        return res.sendStatus(403);
      }
      res.sendStatus(500);
    });
}

/**
 * route: PROTECTED DELETE /api/videos/:id
 * @param req
 * @param res
 * @returns "OK"
 */
function deleteVideo(req, res) {
  videoCrud1_0_0.getById(req.params.id)
    .then(function (currentVideo) {
      return isVideoOwner(currentVideo, req.user) || hasAllowedRole(req.user);
    })
    .then(function (isAllowed) {
      if (!isAllowed) {
        return Promise.reject('Not allowed to delete video');
      }
      return videoCrud1_0_0.remove(req.params.id);
    })
    .then(function () {
      res.sendStatus(200);
    })
    .catch(function (err) {
      if (err === 'Not allowed to delete video') {
        return res.sendStatus(403);
      }
      res.sendStatus(500);
    });
}

/**
 * route: POST /api/videos/loaded
 * @param req
 * @param res
 */
function loaded (req, res) {
    var params = req.body;
    logger.debug(params);

    EventTrackingCrud.create({
        codeSource  : "app.persistence.crud.videos.loaded.post",
        eventSource : "nodejs",
        eventType   : "post",
        eventName   : "server-side-referrer",
        referrer    :  req.header('Referrer'),
        userId      : req.body.userId || null,
        videoId     : req.body.videoId,
        clientIp    : req.ip
    });

    videoCrud1_0_0
      .getById(params.videoId)
      .then(videoCrud1_0_0.upCount)
      .then(function() {
          return VideoViewCrud.create(params);
      })
      .then(function(videoView) {
          logger.debug('videoView');
          logger.debug(videoView);
          res.sendStatus(200);
      })
      .catch(function(error) {
          res.send(error);
      })
}
/**
 * route: POST /api/videos/showcase-update
 * @param req
 * @param res
 */
function showcaseUpdate (req, res) {
    var params = req.body;
    videoCrud1_0_0
      .update({id: params.id, update: params})
      .then(function(video) {
          res.sendStatus(200);
      })
      .catch(function(error) {
          res.send(error)
      })

}
/**
 * route: POST /api/videos/report-video
 * @param req
 * @param res "OK"
 */
function reportVideo (req, res) {
    var params = req.body;
    var transport = nodemailer.createTransport({
        service: "Gmail",
        auth: {
            user:'support@airvuz.com',
            pass:'b5&YGG6n'
        }
    });

    // TODO: make domain dynamic
    var mailOptions = {
        from:'noreply <noreply@airvuz.com>',
        to: 'support@airvuz.com',
        subject: 'video reported : '+params.videoId,
        html:'<p>A report has been submitted for video Id : '+params.videoId+ ', by User Id : ' + params.userId + '.<br> Issue : ' +params.message+'<br><a href="www.airvuz.com/video/' + params.videoId+'"> Click here to go to video</a></p>'
    };

    transport.sendMail(mailOptions, function(error, message) {
        if(error) {
            res.sendStatus(400);
        } else {
            res.sendStatus(200);
        }
    })

}
/**
 * route: GET /api/videos/videoInfoCheck?userId=, videoId=, videoUserId
 * @param req
 * @param res
 * @returns
 * {
  "like": false,
  "follow": false
}
 */
function videoInfoCheck(req, res) {
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

    logger.debug('1');

    videoLikeCrud1_0_0
      .videoLikeCheck(likeObject)
      .then(function(like) {
          returnObject.like = !!like;
          return followCrud1_0_0.followCheck(followObject);
      })
      .then(function(follow) {
          logger.debug(follow);
          returnObject.follow = !!follow;
          res.json(returnObject);
      })
      .catch(function(error) {
          res.sendStatus(500);
      });
}
/**
 * route: GET /api/videos/user/:id
 * @param req
 * @param res
 * @returns
 * "status": "OK",
 "code": 200,
 "data": [
 {
   "_id": "57f94fdcab61a80344376865",
   "userId": {
     "_id": "57e96a719ddd2b02f44f3367",
     "userNameDisplay": "bryceb",
     "userNameUrl": "bryceb"
   },
   "title": "title_xxxxx",
   "description": "description_xxxxxx",
   "duration": "1",
   "thumbnailPath": "4ff2fcce6b32cf6ccf9fa4190ee58d5f/tn_00006.jpg",
   "viewCount": 0,
   "uploadDate": "2016-10-08T19:58:20.445Z",
   "categories": [
     "574f91b3b55602296def65be"
   ]
*/
function getVideosByUser (req, res) {
    var dataStatus = {};
    EventTrackingCrud.create({
        codeSource  : "app.persistence.crud.videos.user.get",
        eventSource : "nodejs",
        eventType   : "get"
    });
    videoCrud1_0_0
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
}

/**
 * route: GET /api/videos/topSixVideos/:id
 * @param req id = userId
 * @param res
 * @returns
 * {
    "_id": "57f51a6edd80c202616dedf8",
    "userId": "57e96a719ddd2b02f44f3367",
    "title": "my video has a first name",
    "description": "I bet this works, huh.",
    "duration": "00:33",
    "videoPath": "e7da06ba1ec331ea368b58068228d5ae/e7da06ba1ec331ea368b58068228d5ae.mp4",
    "thumbnailPath": "e7da06ba1ec331ea368b58068228d5ae/tn_00003.jpg",
    "videoLocation": "moon landingss",
    "droneType": null,
    "cameraType": null,
    "__v": 0,
    "seoTags": [],
    "internalTags": [],
    "viewCount": 6,
    "uploadDate": "2016-10-05T15:21:18.906Z",
    "tags": [
      "tagged"
    ],
    "recordDate": "2016-10-05T15:21:18.906Z",
    "openGraphCacheDate": "2016-10-05T15:18:12.790Z",
    "likeCount": 0,
    "isActive": true,
    "commentCount": 2,
    "categories": [
      "574f91b3b55602296def65a2",
      "57f2ad221f8de106812daba1"
    ],
    "allowRatings": true,
    "allowComments": true
  }
 */
function getTopSixVideos (req, res) {
    var userId = req.params.id;

    videoCrud1_0_0
      .getTopSixVideos(userId)
      .then(function(resp) {
          res.json(resp);
      })
      .catch(function (error) {
          res.sendStatus(500);
      });
}
/**
 * route: GET /api/videos/videoCount/:id
 * @param req id = userId
 * @param res
 * @returns integer
 */
function getVideoCount (req, res) {
    var userId = req.params.id;

    videoCrud1_0_0
      .getVideoCount(userId)
      .then(function(resp) {
          res.json(resp);
      })
      .catch(function (error) {
          res.sendStatus(500);
      });
}
/**
 * route: GET /api/videos/followCount/:id
 * @param req
 * @param res
 * @returns integer
 */
function getFollowCount (req, res) {
    var userId = req.params.id;

    followCrud1_0_0
      .followCount(userId)
      .then(function(resp) {
          res.json(resp);
      })
      .catch(function (error) {
          res.sendStatus(500);
      });
}
/**
 * route: GET /api/videos/nextVideos?video=videoId
 * @param req
 * @param res
 */
function getNextVideos (req, res) {
    videoCrud1_0_0.getById(req.query.video)
      .then(function (video) {
          return catTypeCrud1_0_0.getInternalCategory(video.categories);
      })
      .then(videoCrud1_0_0.getNextVideos)
      .then(function (videos) {
          videos.forEach(function (video) {
              video.fullTitle = video.title;
              video.displayDate = moment(video.uploadDate).fromNow();
              video.title = video.title.substring(0, 30);
              video.description = video.description.substring(0, 90);
              if (video.title.length === 30) {
                  video.title = video.title + '...'
              }
              if (video.description.length === 90) {
                  video.description = video.description + '...';
              }
          });

          res.json(videos);
      })
      .catch(function () {
          res.sendStatus(500);
      });
}
/**
 * route: GET /api/video/videoOwnerProfile/:id (NOTE it is "api/video" and not "api/videos" path)
 * @param req id = userId
 * @param res
 * @returns
 * {
  "_id": "57e96a719ddd2b02f44f3367",
  "emailAddress": "bryce.blilie@airvuz.com",
  "userNameDisplay": "bryceb",
  "profilePicture": "/image/profile-picture/9160157083e6e8cace284f2b49af7985.23?size=50",
  "userNameUrl": "bryceb",
  "autoPlay": true,
  "aclRoles": [
    "user-general"
  ],
  "lastName": "SavesTheDay",
  "firstName": "Bryce",
  "isExternalLink": false
}
 */
function getVideoOwnerProfile (req, res) {
    var userId = req.params.id;

    usersCrud1_0_0
      .getUserById(userId)
      .then(function(user) {
          if (user !== null) {
              return SocialCrud.findByUserIdAndProvider(user._id, 'facebook')
                .then(function (social) {
                    SocialCrud.setProfilePicture(social, user);
                    return user;
                });
          }

          user.profilePicture = '/client/images/default.png';

          return user;
      })
      .then(function (user) {
          if(user.userNameDisplay.length > 12) {
              user.userNameDisplay = user.userNameDisplay.substring(0, 12) + '...';
          }
          user.isExternalLink = user.profilePicture.indexOf('http') > -1;
          res.json(user);
      })
      .catch(function (error) {
          res.sendStatus(500);
      });
}
/**
 * route: GET /api/videos/videoComments/:id
 * @param req id = videoId
 * @param res
 */
function getCommentsByVideoId (req, res) {
    var videoId = req.params.id;

    commentCrud1_0_0
      .getParentCommentByVideoId({videoId: videoId})
      .then(function(comments) {
          return Promise.map(comments, function (comment) {
              comment.commentDisplayDate = moment(comment.commentCreatedDate).fromNow();
              comment.showReplies = comment.replyCount > 0 ? true : false;
              if (comment.userId !== null) {
                  return SocialCrud.findByUserIdAndProvider(comment.userId._id, 'facebook')
                    .then(function (social) {
                        SocialCrud.setProfilePicture(social, comment.userId);
                        return comment;
                    });
              }
              comment.userId = {};
              comment.userId.profilePicture = '/client/images/default.png';
              return comment;
          });
      })
      .then(function(comments) {
          res.json(comments);
      })
      .catch(function (error) {
          res.sendStatus(500);
      });
}

function querySeoKeywords(req, res) {
    var keyword = req.query.keyword;
    return videoCrud1_0_0.findVideoBySeoKeyword(keyword)
      .then(function(videos) {
          res.json(videos);
      })
      .catch(function(error) {
          res.sendStatus(500);
      })
}

function renderVideoPage(req, res, next) {
    viewManager
      .getView({
          viewName: 'app.view.views.videoPlayerPartial',
          request: req,
          response: res,
          next: next
      })
      .then(function(view) {
          res.send(view)
      })
      .catch(function(error) {
          logger.debug('Video Player View Manager Error : ' + error)
      })
}

Video.prototype.getVideosByCategory     = getVideosByCategory;
Video.prototype.search                  = search;
Video.prototype.post                    = post;
Video.prototype.get                     = get;
Video.prototype.updateVideo             = updateVideo;
Video.prototype.deleteVideo             = deleteVideo;
Video.prototype.loaded                  = loaded;
Video.prototype.showcaseUpdate          = showcaseUpdate;
Video.prototype.reportVideo             = reportVideo;
Video.prototype.videoInfoCheck          = videoInfoCheck;
Video.prototype.getVideosByUser         = getVideosByUser;
Video.prototype.getTopSixVideos         = getTopSixVideos;
Video.prototype.getVideoCount           = getVideoCount;
Video.prototype.getFollowCount          = getFollowCount;
Video.prototype.getNextVideos           = getNextVideos;
Video.prototype.getVideoOwnerProfile    = getVideoOwnerProfile;
Video.prototype.getCommentsByVideoId    = getCommentsByVideoId;
Video.prototype.querySeoKeywords        = querySeoKeywords;
Video.prototype.renderVideoPage         = renderVideoPage;

module.exports = new Video();

//change crud and videos