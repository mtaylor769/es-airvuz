var CronCrud = require('../../persistence/crud/cron'),
    EventTrackingCrud	  = require('../../persistence/crud/events/eventTracking');

function Cron() {}

function runTrending(req, res) {
  EventTrackingCrud.didTrendingRun()
    .then(function (did) {
      if (did) {
        return true;
      }
      return CronCrud.generateTrendingCollection()
        .then(function () {
          return EventTrackingCrud.create({
            codeSource  : 'cron',
            eventSource : 'nodejs',
            eventType   : 'get',
            eventName   : 'cron:trending'
          });
        });
    })
    .then(function () {
      res.sendStatus(200);
    })
    .catch(function () {
      res.sendStatus(500);
    });
}

Cron.prototype.runTrending = runTrending;

module.exports = new Cron();