var EventTrackingCrud = require('../../persistence/crud/events/eventTracking');
var log4js            = require('log4js');
var logger            = log4js.getLogger('app.routes.api.avEventTracker');

if (global.NODE_ENV === 'production') {
  logger.setLevel('WARN');
}

function AVEventTracker() {
}

function createEventTracker(req, res) {
  EventTrackingCrud
    .create(req.body)
    .then(function () {
      res.sendStatus(200);
    })
    .catch(function (error) {
      logger.error('create event tracker error:' + error);
      res.sendStatus(500);
    });
}

AVEventTracker.prototype.put = createEventTracker;

module.exports = new AVEventTracker();