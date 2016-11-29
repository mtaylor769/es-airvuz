var namespace = 'app.routes.apiVersion.videoCuration1-0-0';
try {
    var log4js                  = require('log4js');
    var logger                  = log4js.getLogger(namespace);
    var keywordCrud1_0_0        = require('../../persistence/crud/keywords1-0-0');
    var videoCrud1_0_0          = require('../../persistence/crud/videos1-0-0');
    var eventTrackingCrud       = require('../../persistence/crud/events/eventTracking');
    var Promise                 = require('bluebird');

    if (global.NODE_ENV === "production") {
        logger.setLevel("INFO");
    }
}
catch(exception) {
    logger.error(" import error:" + exception);
}

function VideoCuration() {}
/**
 * route: POST /api/video-curation
 * @param req
 * @param res
 */

function updateVideo(req, res) {
    var internalTags = [];
    var seoTags = [];
    var rawInternalTags = req.body.internalTags || [];
    var rawSeoTags = req.body.seoKeywords || [];
    var videoId = req.body.videoId;
    var videoCategories = req.body.categories;
    var internalRanking = req.body.internalRanking;
    var primaryCategory = req.body.primaryCategory || null;
    var videoNotes = req.body.videoNotes;
    var waitFor;

    var updateObject = {};
    updateObject.update = {};
    updateObject.update.curation = {};
    updateObject.update.categories = videoCategories;
    updateObject.id = videoId;
    updateObject.internalRanking = internalRanking;
    updateObject.update.curation.isRanked = true;
    updateObject.update.videoNotes = videoNotes;
    //will set primary category if param is set
    if (primaryCategory) {
      updateObject.update.primaryCategory = primaryCategory;
      updateObject.update.curation.primaryCategory = true;
    }

    //function to run if both internal and seo tags

    if (rawSeoTags.length && rawInternalTags.length) {

      waitFor = Promise.map(rawSeoTags, function (tag) {
        return keywordCrud1_0_0.create(tag.text);
      })
        .then(function () {
          rawSeoTags.forEach(function (tag) {
            seoTags.push(tag.text);
          });
          return Promise.map(rawInternalTags, function (tag) {
            return keywordCrud1_0_0.create(tag.text);
          });
        })
        .then(function () {
          rawInternalTags.forEach(function (tag) {
            internalTags.push(tag.text);
          });
          updateObject.update.internalTags = internalTags;
          updateObject.update.seoTags = seoTags;
          updateObject.update.curation.isTagged = true;
          updateObject.update.curation.isSeoTagged = true;
          return videoCrud1_0_0.videoCurationUpdate(updateObject);
        });

      //function to run if internal tags but no SEO

    } else if (rawInternalTags.length && !rawSeoTags.length) {

      waitFor = Promise.map(rawInternalTags, function (tag) {
        return keywordCrud1_0_0.create(tag.text);
      })
        .then(function () {
          rawInternalTags.forEach(function (tag) {
            internalTags.push(tag.text);
          });
          updateObject.update.internalTags = internalTags;
          updateObject.update.curation.isTagged = true;
          return videoCrud1_0_0.videoCurationUpdate(updateObject);
        });

      //function to run if SEO tags but no internal

    } else if (!rawInternalTags.length && rawSeoTags.length) {

      waitFor = Promise.map(rawSeoTags, function (tag) {
        return keywordCrud1_0_0.create(tag.text);
      })
        .then(function () {
          rawSeoTags.forEach(function (tag) {
            seoTags.push(tag.text);
          });
          updateObject.update.seoTags = seoTags;
          updateObject.update.curation.isSeoTagged = true;
          return videoCrud1_0_0.videoCurationUpdate(updateObject);
        });

      //function to run if only ranking

    } else {
      waitFor = videoCrud1_0_0.videoCurationUpdate(updateObject);
    }

    return waitFor
      .then(function () {
        return eventTrackingCrud.create(req.body.eventInfo);
      })
      .then(function() {
        res.sendStatus(200);
      })
      .catch(function (error) {
        res.sendStatus(500);
      })
}

function getNextVideo(req, res) {
    var initialVideo        = req.body.initialVideo;
    var nextVideoParams     = req.body.nextVideoParams;
    var initialVideoId      = req.body.stateVideo || null;
    var initialType         = req.body.stateType || null;
    var waitFor;


    //run if initial Video
    if(initialVideo) {
        if(initialVideoId) {
            waitFor = Promise.resolve({initialVideoId: initialVideoId});
        } else if(initialType) {
            waitFor = Promise.resolve({initialType: initialType});
        } else {
            waitFor = Promise.resolve();
        }

    } else {
        waitFor = Promise.resolve(nextVideoParams);
    }

    waitFor.then(function(params) {
        if(params) {
            if (params.initialVideoId) {
                return videoCrud1_0_0.getNextVideoToRate({videoId: params.initialVideoId});
            } else if (params.initialType) {
                return videoCrud1_0_0.getNextVideoToRate({type: params.initialType});
            } else if (params.type) {
                return videoCrud1_0_0.getNextVideoToRate(params)
                  .then(function(video) {
                      //if no more videos for specified params will send back a flag for dialog otherwise will return the video
                      if(!video.length) {
                          //flag for dialog
                          return {completed: true};
                      } else {
                          //return video like normal
                          return video;
                      }
                  });
            } else {
                return videoCrud1_0_0.getNextVideoToRate();
            }
        } else {
            return videoCrud1_0_0.getNextVideoToRate();
        }
    })
      .then(function(nextVideo) {
          res.json(nextVideo);
      })
      .catch(function(error) {
          res.send(500);
      });
}

VideoCuration.prototype.getNextVideo = getNextVideo;
VideoCuration.prototype.updateVideo = updateVideo;

module.exports = new VideoCuration();