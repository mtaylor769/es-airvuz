try {
    var log4js				    = require('log4js');
    var logger				    = log4js.getLogger('app.routes.api.customCarousel');
    var videoCollCrud1_0_0     = require('../../persistence/crud/videoCollection1-0-0');
    var generateShortId         = require('../../utils/generateShortId');
    var urlFriendlyString       = require('../../utils/urlFriendlyString');

    // setting logger options for NODE environment
    if(global.NODE_ENV === "production") {
        logger.setLevel("INFO");
    }

    logger.debug("import complete");
}

//catch for import error
catch(exception) {
    logger.error(" import error:" + exception);
}

function CustomCarousel() {

}

function createCustomCarousel(req, res) {
    var params = req.body;
    return videoCollCrud1_0_0.createCustomCarousel(params)
        .then(function(newCollection) {
            logger.debug(newCollection);
            res.sendStatus(200);
        })
        .catch(function(error) {
            if(error.length) {
                res.status(400).send(error);
            } else {
                res.sendStatus(500)
            }
        });
}

function getAllCustomCarousels(req, res) {
    return videoCollCrud1_0_0.getAllCustom()
      .then(function(carousels) {
        res.json(carousels);
      })
      .catch(function(error) {
          res.sendStatus(500);
      });
}

function getById(req, res) {
    var carouselId = req.params.id;
    return videoCollCrud1_0_0.getCustomById(carouselId)
      .then(function(carousel) {
          res.json(carousel);
      })
      .catch(function(error) {
          res.sendStatus(500);
      });
}

function updateCarousel(req, res) {
    var carouselId = req.params.id;
    var carouselUpdates = req.body;
    return videoCollCrud1_0_0.updateCustom(carouselId, carouselUpdates)
      .then(function(data) {
          res.json(data);
      })
      .catch(function(error) {
          res.sendStatus(500);
      });
}

function removeCarousel(req, res) {
    var carouselId = req.params.id;
    return videoCollCrud1_0_0.delete(carouselId)
      .then(function(carousel) {
          res.json(carousel);
      })
      .catch(function(error) {
          res.sendStatus(500);
      });
}


CustomCarousel.prototype.createCustomCarousel = createCustomCarousel;
CustomCarousel.prototype.getAllCustomCarousels = getAllCustomCarousels;
CustomCarousel.prototype.getById = getById;
CustomCarousel.prototype.updateCarousel = updateCarousel;
CustomCarousel.prototype.removeCarousel = removeCarousel;


module.exports = new CustomCarousel();