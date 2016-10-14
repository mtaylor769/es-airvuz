//logging library
var log4js                      = require('log4js');
var logger                      = log4js.getLogger('app.views.model.customCategoryModel');

try {
    //npm modules
    var Promise                 = require('bluebird');
    var util                    = require('util');
    var _                       = require('lodash');

    //internal code references
    var BaseModel               = require('./baseModel');
    var amazonConfig            = require('../../config/amazon.config');
    var videoCollectionCrud     = require('../../persistence/crud/videoCollection');
    var categoryCrud            = require('../../persistence/crud/categoryType');
    var videoCrud               = require('../../persistence/crud/videos');

    //set logger level based on Node environment
    if(global.NODE_ENV === 'production') {
        logger.setLevel('WARN');
    }
}

//logger for loading error
catch(exception){
    logger.error('import error: ' + exception);
}

//set view model
var CustomCategoryModel = function(params) {
  BaseModel.apply(this, arguments);
};

util.inherits(CustomCategoryModel, BaseModel);

CustomCategoryModel.prototype.getData = function(params) {
    //config params
    params.data = {};
    params.data.title = 'AirVūz - Category';
    params.data.s3_OUTPUT_Bucket = amazonConfig.OUTPUT_URL;
    params.data.s3Bucket = amazonConfig.OUTPUT_BUCKET;
    params.data.s3_ASSET_Bucket = amazonConfig.ASSET_URL;
    params.data.category = {};

    var categoryId = params.request.query.id;

    return videoCollectionCrud.findByUrlId(categoryId)
        .then(function(category) {
            params.data.category = category;
            params.data.videos = category.videos;
            return categoryCrud.get();
        })
        .then(function(categories) {
            params.data.categories = categories;
          if(params.data.category.displayVideo) {
            params.data.videoHeader = true;
            return videoCrud.getById(params.data.category.displayVideo)
              .then(function(video) {
                params.data.displayVideoSrc = amazonConfig.OUTPUT_URL + video.thumbnailPath;
                return params;
              })
          } else {
            return params;
          }
        })
        .catch(function(error) {
          params.next();
        });

};

module.exports = CustomCategoryModel;