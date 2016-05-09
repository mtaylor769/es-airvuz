var NotificationCrud = require('../../persistence/crud/notifications');

function Notification() {

}

Notification.prototype.post = function(req, res) {
  NotificationCrud
    .create(req.body)
    .then(function(notification) {
      res.json(notification)
    })
    .catch(function(err) {

    })
};

module.exports = new Notification();