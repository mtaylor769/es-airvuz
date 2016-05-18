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
      res.sendStatus(500);
    })
};

Notification.prototype.getUnseen = function(req, res) {
  var userId = req.query.id;
  NotificationCrud
  .getByUserId(userId)
  .then(function(notifications) {
    notifications.forEach(function(notification) {
      if(notification.notificationType === 'COMMENT'){
        notification.notificationMessage = 'commented on your video : ' + notification.notificationMessage;
      } else if(notification.notificationType === 'COMMENT REPLY') {
        notification.notificationMessage = 'replied to your comment : ' + notification.notificationMessage
      }
    });
    NotificationCrud
    .getUnseenCount(userId)
    .then(function(notificationCount) {
      res.json({notifications: notifications, notificationCount: notificationCount});
    })
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

}

module.exports = new Notification();