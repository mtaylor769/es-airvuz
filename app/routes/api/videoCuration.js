var keywordCrud     = require('../../persistence/crud/keywords');
var videoCrud       = require('../../persistence/crud/videos1-0-0');
var Promise         = require('bluebird');
var log4js = require('log4js');
var logger = log4js.getLogger('app.persistence.api.videoCuration');

function VideoCuration() {}

VideoCuration.prototype.rating = function(req, res) {
    var internalTags        = [];
    var seoTags             = [];
    var rawInternalTags     = req.body.internalTags || [];
    var rawSeoTags          = req.body.seoKeywords || [];
    var videoId             = req.body.videoId;
    var videoCategories     = req.body.categories;
    var internalRanking     = req.body.internalRanking;
    var initialVideo        = req.body.initialVideo;
    var nextVideoParams     = req.body.nextVideoParams;
    var waitFor;

    //setting up query object. Video Ranking is always required
    var queryObject = {};
    queryObject.update = {};
    queryObject.update.curation = {};
    queryObject.update.categories = videoCategories;
    queryObject.id = videoId;
    queryObject.internalRanking = internalRanking;
    queryObject.update.curation.isRanked = true;

    //run if initial Video
    if(initialVideo) {
        waitFor = Promise.resolve();
    } else {

        //function to run if both internal and SEO tags
        if (rawSeoTags.length && rawInternalTags.length) {

            waitFor = Promise.map(rawSeoTags, function (tag) {
                return keywordCrud.create(tag.text);
            })
            .then(function () {
                rawSeoTags.forEach(function (tag) {
                    seoTags.push(tag.text);
                });
                return Promise.map(rawInternalTags, function (tag) {
                    return keywordCrud.create(tag.text);
                });
            })
            .then(function () {
                rawInternalTags.forEach(function (tag) {
                    internalTags.push(tag.text);
                });
                queryObject.update.internalTags = internalTags;
                queryObject.update.seoTags = seoTags;
                queryObject.update.curation.isTagged = true;
                queryObject.update.curation.isSeoTagged = true;
                return videoCrud.videoCurationUpdate(queryObject);
            });

            //function to run if internal tags but no SEO
        } else if (rawInternalTags.length && !rawSeoTags.length) {

            waitFor = Promise.map(rawInternalTags, function (tag) {
                return keywordCrud.create(tag.text);
            })
            .then(function () {
                rawInternalTags.forEach(function (tag) {
                    internalTags.push(tag.text);
                });
                queryObject.update.internalTags = internalTags;
                queryObject.update.curation.isTagged = true;
                return videoCrud.videoCurationUpdate(queryObject);
            });

            //function to run if SEO tags but no internal
        } else if (!rawInternalTags.length && rawSeoTags.length) {

            waitFor = Promise.map(rawSeoTags, function (tag) {
                return keywordCrud.create(tag.text);
            })
            .then(function () {
                rawSeoTags.forEach(function (tag) {
                    seoTags.push(tag.text);
                });
                queryObject.update.seoTags = seoTags;
                queryObject.update.curation.isSeoTagged = true;
                return videoCrud.videoCurationUpdate(queryObject);
            });

            //function to run if only ranking
        } else {
            waitFor = videoCrud.videoCurationUpdate(queryObject);
        }
    }

    waitFor.then(function () {
        if(initialVideo) {
            return videoCrud.getNextVideoToRate();
        } else {
            //will get next video based on input params
            return videoCrud.getNextVideoToRate(nextVideoParams)
              .then(function(video) {
                  //if no more videos for specified params will send back a flag for dialog otherwise will return the video
                  if(!video.length) {
                      //flag for dialog
                      return {completed: true};
                  } else {
                      //return video like normal
                      return video;
                  }
              })
        }
    })
    .then(function(nextVideo) {
        res.json(nextVideo);
    })
    .catch(function(error) {
        logger.error(error);
        res.send(500);
    });
};


module.exports = new VideoCuration();