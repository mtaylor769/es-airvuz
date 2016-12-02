var CronCrud = require('../../persistence/crud/cron'),
    EventTrackingCrud = require('../../persistence/crud/events/eventTracking'),
    AutoView = require('../../persistence/crud/autoView1-0-0');

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

function applyAutoViews(req, res) {
    var daysAhead = req.params.daysAhead || 0;
    AutoView.applyAutoViews(daysAhead)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function () {
            res.sendStatus(500);
        });
}

Cron.prototype.runTrending = runTrending;
Cron.prototype.applyAutoViews = applyAutoViews;

module.exports = new Cron();