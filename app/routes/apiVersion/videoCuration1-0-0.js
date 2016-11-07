var namespace = 'app.routes.apiVersion.videoCuration1-0-0';
try {
    var log4js                  = require('log4js');
    var logger                  = log4js.getLogger(namespace);
    var keywordCrud1_0_0        = require('../../persistence/crud/keywords1-0-0');
    var videoCrud1_0_0          = require('../../persistence/crud/videos1-0-0');
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
function rating(req, res) {
    var internalTags        = [];
    var seoTags             = [];
    var rawInternalTags     = req.body.internalTags || [];
    var rawSeoTags          = req.body.seoKeywords || [];
    var videoId             = req.body.videoId;
    var videoCategories     = req.body.categories;
    var internalRanking     = req.body.internalRanking;
    var initialVideo        = req.body.initialVideo;
    var nextVideoParams     = req.body.nextVideoParams;
    var initialVideoId      = req.body.stateVideo || null;
    var initialType         = req.body.stateType || null;
    var primaryCategory     = req.body.primaryCategory || null;
    var waitFor;

    //setting up query object. Video Ranking is always required
    var queryObject = {};
    queryObject.update = {};
    queryObject.update.curation = {};
    queryObject.update.categories = videoCategories;
    queryObject.id = videoId;
    queryObject.internalRanking = internalRanking;
    queryObject.update.curation.isRanked = true;
    //will set primary category if param is set
    if(primaryCategory) {
        queryObject.update.primaryCategory = primaryCategory;
        queryObject.update.curation.primaryCategory = true;
    }

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

        //function to run if both internal and SEO tags
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
                queryObject.update.internalTags = internalTags;
                queryObject.update.seoTags = seoTags;
                queryObject.update.curation.isTagged = true;
                queryObject.update.curation.isSeoTagged = true;
                return videoCrud1_0_0.videoCurationUpdate(queryObject)
                  .then(function() {
                      return Promise.resolve(nextVideoParams);
                  })
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
                queryObject.update.internalTags = internalTags;
                queryObject.update.curation.isTagged = true;
                return videoCrud1_0_0.videoCurationUpdate(queryObject)
                  .then(function() {
                      return Promise.resolve(nextVideoParams);
                  })
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
                queryObject.update.seoTags = seoTags;
                queryObject.update.curation.isSeoTagged = true;
                return videoCrud1_0_0.videoCurationUpdate(queryObject)
                  .then(function() {
                      return Promise.resolve(nextVideoParams);
                  })
            });

            //function to run if only ranking
        } else {
                waitFor = videoCrud1_0_0.videoCurationUpdate(queryObject)
              .then(function() {
                  return Promise.resolve(nextVideoParams);
              })

        }
    }
    // waitFor.then(function () {
    //     if(initialVideo) {
    //         return videoCrud1_0_0.getNextVideoToRate();
    //     } else {
    //         //will get next video based on input params
    //         return videoCrud1_0_0.getNextVideoToRate(nextVideoParams)
    //           .then(function(video) {
    //               //if no more videos for specified params will send back a flag for dialog otherwise will return the video
    //               if(!video.length) {
    //                   //flag for dialog
    //                   return {completed: true};
    //               } else {
    //                   //return video like normal
    //                   return video;
    //               }
    //           })


    //TODO : make work like function above ^^^^^
    waitFor.then(function(params) {
        if(params) {
            if (params.initialVideoId) {
                return videoCrud1_0_0.getNextVideoToRate({videoId: params.initialVideoId});
            } else if (params.initialType) {
                return videoCrud1_0_0.getNextVideoToRate({type: params.initialType});
            } else if (params.type) {
                return videoCrud1_0_0.getNextVideoToRate(params);
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

VideoCuration.prototype.rating = rating;

module.exports = new VideoCuration();