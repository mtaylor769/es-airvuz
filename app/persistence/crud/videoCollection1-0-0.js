'use strict';
try {
  var log4js                  = require('log4js');
  var logger                  = log4js.getLogger('app.persistence.crud.videoCollection');
  var database                = require('../database/database');
  var VideoCollectionModel    = database.getModelByDotPath({modelDotPath: 'app.persistence.model.videoCollection'});
  var ErrorMessage            = require('../../utils/errorMessage');
  var generateShortId         = require('../../utils/generateShortId');
  var urlFriendlyString       = require('../../utils/urlFriendlyString');

  var _                     = require('lodash');
  var moment                = require('moment');
  var Promise               = require('bluebird');


} catch (exception) {
    logger.error(' import error:' + exception);
}

function VideoCollection() {}

function getVideo(type) {
    return VideoCollectionModel.findOne({name: type, user: null}).lean().exec()
        .then(function (videos) {
            if (videos) {
                return videos;
            }

            var newCollection = new VideoCollectionModel({name: type});

            return newCollection.save()
                .then(function (collection) {
                    return collection;
                });
        });
}

function updateVideos(type, videos) {
    return VideoCollectionModel.findOneAndUpdate({name: type, user: null}, {videos: videos}).exec();
}

function getStaffPickVideos() {
    return getVideoAndPopulate('Staff Pick Videos');
}

function getFeaturedVideos() {
    return getVideoAndPopulate('Featured Videos');
}

function getVideoAndPopulate(type) {
    var videoFields = 'userId title duration thumbnailPath viewCount uploadDate';
    var userFields = 'userNameUrl userNameDisplay';

    return VideoCollectionModel.findOne({name: type, user: null}).populate('videos', videoFields).lean().exec()
        .then(function (collection) {
            if (collection) {
                return VideoCollectionModel.populate(collection, {path: 'videos.userId', model: 'Users', select: userFields}).then(function (col) {
                    if (!col || col.length === 0) {
                        return [];
                    }
                    // TODO: slice / limit / paging
                    return col.videos.map(function (video) {
                        video.uploadDate = moment(new Date(video.uploadDate)).fromNow();
                        return video;
                    });
                });
            } else {
                return [];
            }
        });
}

function createVideoCollection(params) {
    return(new Promise(function(resolve, reject) {
            return VideoCollectionModel.findOne({user: params.user, name: params.name}).populate('videos').exec()
                .then(function(videoCollection) {
                    if(!videoCollection) {
                        var videoCollectionModel = new VideoCollectionModel(params);
                        videoCollectionModel.save(function(error, videoCollection) {
                            if(error) {
                                reject(error);
                            } else {
                                resolve(videoCollection);
                            }
                        });
                    } else {
                        return VideoCollectionModel.populate(videoCollection, {path: 'videos.userId', model: 'Users'}).then(function (col) {
                            col.videos.map(function (video) {
                                video.uploadDate = moment(new Date(video.uploadDate)).fromNow();
                                return video;
                            });

                            resolve(videoCollection);
                        });
                    }
                });
        })
    );
}


function getCollectionVideos(userId, name) {
    return VideoCollectionModel
        .findOne({user: userId, name: name})
        .populate('user', 'userNameDisplay userNameUrl profilePicture')
        .populate('videos', 'title description duration videoPath thumbnailPath viewCount uploadDate tags likeCount commentCount categories')
        .exec()
        .catch(function(err) {
            return err;
        });
}

function _updateShowcaseCollection(params, type) {
    var updateQuery = {};

    updateQuery[type] = {videos: params.video};
    return VideoCollectionModel.findOneAndUpdate({user: params.user, name: 'showcase'}, updateQuery).exec();
}

function addVideoToUserShowcase(params) {
  // $addToSet should only add if it exist instead of $push
  return _updateShowcaseCollection(params, '$addToSet');
}

function removeVideoFromUserShowcase(params) {
  // $pull will pull all matches
  return _updateShowcaseCollection(params, '$pull');
}

function getCurrentCustomCarousel() {
    return VideoCollectionModel.find({startDate: {$lte: Date.now()}, endDate: {$gte: Date.now()}})
        .populate('videos')
        .sort({startDate: -1})
        .lean()
        .exec()
        .then(function(carousels) {
            if(carousels.length === 0) {
                return null;
            } else {
                return VideoCollectionModel.populate(carousels[0], {path: 'videos.userId', model: 'Users', select: 'userNameDisplay userNameUrl'}).then(function(carousel) {
                    carousel.videos.forEach(function(video) {
                        video.uploadDate = moment(new Date(video.uploadDate)).fromNow();
                    });
                    return carousel;
                });

            }
        })
        .catch(function(error) {
           return error;
        });
}

function findByUrlId(id) {
    return VideoCollectionModel.findOne({urlId: id})
        .populate('videos')
        .sort({startDate: -1})
        .lean()
        .exec()
        .then(function(category) {
           return VideoCollectionModel.populate(category, {path: 'videos.userId', model: 'Users', select: 'userNameDisplay userNameUrl'})               .then(function(category) {
                   category.videos.forEach(function(video) {
                       video.uploadDate = moment(new Date(video.uploadDate)).fromNow();
                   });
                    return category;
                });
        })
        .catch(function(error) {
           return error;
        });
}

function findByUserId(id) {
    return VideoCollectionModel.find({user: id}).exec();
}

function remove(id) {
    return VideoCollectionModel.findByIdAndRemove(id).exec();
}


function customCarouselValidation(params) {
  var sourceLocation            = 'persistence.crud.videoCollection.createCustomCarousel';
  var errorMessage              = new ErrorMessage();
  var info                      = {};
  info.data                     = {};
  info.data.name                = params.name || null;
  info.data.nameUrl             = params.nameUrl || null;
  info.data.description         = params.description || null;
  info.data.listDescription     = params.listDescription || null;
  info.data.displayImage        = params.displayImage || null;
  info.data.displayVideo        = params.displayVideo || null;
  info.data.videos              = params.videos || null;
  if(!params.homepageDisplay) {
    info.data.startDate = undefined;
    info.data.endDate = undefined;
  } else {
    info.data.startDate           = new Date(params.startDate) || null;
    info.data.endDate             = new Date(params.endDate) || null;
  }

  if(info.data.name === null) {
    info.errors = errorMessage.getErrorMessage({
      statusCode			: "400",
      errorId					: "VALIDA1000",
      templateParams	: {
        name : "Title"
      },
      sourceError			: "#name",
      displayMsg			: "This field is required",
      errorMessage		: "Title is null",
      sourceLocation	: sourceLocation
    })
  }
  if(info.data.name === null) {
    info.errors = errorMessage.getErrorMessage({
        statusCode			: "400",
        errorId					: "VALIDA1000",
        templateParams	: {
            name : "Url"
        },
        sourceError			: "#url",
        displayMsg			: "This field is required",
        errorMessage		: "Url is null",
        sourceLocation	: sourceLocation
    })
  }

  if(info.data.description === null) {
    info.errors = errorMessage.getErrorMessage({
      statusCode			: "400",
      errorId					: "VALIDA1000",
      templateParams	: {
        name : "Description"
      },
      sourceError			: "#description",
      displayMsg			: "This field is required",
      errorMessage		: "Description is null",
      sourceLocation	: sourceLocation
    })
  }
  if(info.data.displayImage === null && info.data.displayVideo === null) {
    info.errors = errorMessage.getErrorMessage({
      statusCode			: "400",
      errorId					: "VALIDA1000",
      templateParams	: {
        name : "Banner Selection"
      },
      sourceError			: "#bannerSelection",
      displayMsg			: "This field is required",
      errorMessage		: "Banner Selection is null",
      sourceLocation	: sourceLocation
    })
  }
  if(info.data.startDate !== null && info.data.endDate !== null && info.data.startDate >= info.data.endDate) {
    info.errors = errorMessage.getErrorMessage({
      statusCode			: "400",
      errorId					: "VALIDA1000",
      templateParams	: {
        name : "Date Range"
      },
      sourceError			: "#endDate",
      displayMsg			: "End Date cannot come before or run concurrent with Start Date",
      errorMessage		: "Invalid Date Range",
      sourceLocation	: sourceLocation
    })
  }
  // if(info.data.videos.length < 10) {
  //   info.errors = errorMessage.getErrorMessage({
  //     statusCode			: "400",
  //     errorId					: "VALIDA1000",
  //     templateParams	: {
  //       name : "Videos"
  //     },
  //     sourceError			: "#videos",
  //     displayMsg			: "Requires a minimum of 10 videos",
  //     errorMessage		: "Video minimum not met",
  //     sourceLocation	: sourceLocation
  //   })
  // }

  return Promise.resolve(info);
}

function createCustomCarouselParams(info) {
    //if is an update call
    if(info.update) {
        //find index of id url params
        var sliceIndex = info.nameUrl.indexOf('?id=');
        //slice out urlId
        var urlId = info.nameUrl.slice(sliceIndex);
        //slice out nameUrl
        var url = info.nameUrl.slice(0, sliceIndex);
        //scrub url to only url friendly characters
        var scrubbedUrl = urlFriendlyString.createUrl(url.trim());
        //set nameUrl to new nameUrl + urlId
        info.nameUrl = scrubbedUrl + urlId;
        return Promise.resolve(info);
    } else {
        var carouselId      = generateShortId.generate();
        var scrubbedUrl     = urlFriendlyString.createUrl(info.nameUrl.trim());
        info.nameUrl   = scrubbedUrl + '?id=' + carouselId;
        info.urlId     = carouselId;
        return Promise.resolve(info);
    }
}

function createCustomCarousel(params) {
  return customCarouselValidation(params).then(function(info) {
      if(info.errors) {
        throw info.errors;
      } else {
        return createCustomCarouselParams(info.data)
          .then(function(info) {
            var videoCollection = new VideoCollectionModel(info);
            return videoCollection.save();
          });
    }
  });

}

function getAllCustom() {
  return VideoCollectionModel.find({urlId: {$ne: null}}).sort({createdDate: -1}).exec()
}

function getCustomById(id) {
  return VideoCollectionModel.findById(id).populate('videos').lean().exec();
}

function updateCustom(carouselId, carouselUpdates) {
  return customCarouselValidation(carouselUpdates)
    .then(function(updates) {
        updates.data.update = true;
        return createCustomCarouselParams(updates.data);
    })
    .then(function(updates) {
      return VideoCollectionModel.findByIdAndUpdate(carouselId, updates).exec();
    });
}

VideoCollection.prototype.getFeaturedVideos           = getFeaturedVideos;
VideoCollection.prototype.getStaffPickVideos          = getStaffPickVideos;
VideoCollection.prototype.getVideo                    = getVideo;
VideoCollection.prototype.updateVideos                = updateVideos;
VideoCollection.prototype.getCollectionVideos         = getCollectionVideos;
VideoCollection.prototype.createVideoCollection       = createVideoCollection;
VideoCollection.prototype.addVideoToUserShowcase      = addVideoToUserShowcase;
VideoCollection.prototype.removeVideoFromUserShowcase = removeVideoFromUserShowcase;
VideoCollection.prototype.findByUserId                = findByUserId;
VideoCollection.prototype.delete                      = remove;
VideoCollection.prototype.createCustomCarousel        = createCustomCarousel;
VideoCollection.prototype.getCurrentCustomCarousel    = getCurrentCustomCarousel;
VideoCollection.prototype.findByUrlId                 = findByUrlId;
VideoCollection.prototype.getAllCustom                = getAllCustom;
VideoCollection.prototype.getCustomById               = getCustomById;
VideoCollection.prototype.updateCustom                = updateCustom;

module.exports = new VideoCollection();