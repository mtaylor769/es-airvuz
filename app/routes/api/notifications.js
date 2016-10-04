var NotificationCrud = require('../../persistence/crud/notifications');

function Notification() {}

function seen(req, res) {
  var userId = req.user._id;

  NotificationCrud
    .markAsSeen(userId)
    .then(function () {
      res.sendStatus(200);
    })
    .catch(function () {
      res.sendStatus(500);
    });
}

Notification.prototype.post = function(req, res) {

    NotificationCrud
      .create(req.body)
      .then(function() {
        res.sendStatus(200);
      })
      .catch(function(err) {
        res.sendStatus(500);
      });

};

Notification.prototype.getUnseen = function(req, res) {
  var userId = req.user._id;

  NotificationCrud
  .getUnseen(userId)
  .then(function(notifications) {
    notifications.forEach(function(notification) {
      if(notification.notificationType === 'COMMENT'){
        notification.notificationMessage = 'commented on your <a href="/video/' + notification.videoId +'">video</a> : ' + '"' + notification.notificationMessage + '"';
      } else if(notification.notificationType === 'COMMENT REPLY') {
        notification.notificationMessage = 'replied to your <a href="/video/' + notification.videoId + '">comment</a> : ' + '"' +notification.notificationMessage + '"'
      } else if(notification.notificationType === 'LIKE') {
        notification.notificationMessage = 'Liked your <a href="/video/' + notification.videoId + '">video</a>';
      }
    });
    res.json({notifications: notifications, total: notifications.length});
  })
  .catch(function(err) {
    res.sendStatus(500);
  })
};

Notification.prototype.getAll = function(req, res) {
  var userId = req.query.id;
  NotificationCrud
    .getAllByUserId(userId)
    .then(function(notifications) {
      res.json({notifications: notifications});
    })
    .catch(function(err) {
      res.sendStatus(500);
    })

};

Notification.prototype.seen = seen;

module.exports = new Notification();