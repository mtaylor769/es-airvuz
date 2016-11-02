var namespace = 'app.routes.apiVersion.notifications1-0-0';
try {
    var log4js                  = require('log4js');
    var logger                  = log4js.getLogger(namespace);
    var notificationCrud1_0_0   = require('../../persistence/crud/notifications1-0-0');

    if (global.NODE_ENV === "production") {
        logger.setLevel("INFO");
    }
}
catch(exception) {
    logger.error(" import error:" + exception);
}
/**
 *
 * @constructor
 */
function Notification() {
}
/**
 * route: PROTECTED POST /api/notifications/seen
 * @param req
 * @param res
 */
function seen(req, res) {
    var userId = req.user._id;

    notificationCrud1_0_0
        .markAsSeen(userId)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function () {
            res.sendStatus(500);
        });
}
/**
 * route: PROTECTED POST /api/notifications
 * @param req
 * @param res
 */
function post(req, res) {

    notificationCrud1_0_0
        .create(req.body)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.sendStatus(500);
        });

}
/**
 * route: PROTECTED GET /api/notifications
 * @param req
 * @param res
 */
function getUnseen(req, res) {
    var userId = req.user._id;

    notificationCrud1_0_0
        .getUnseen(userId)
        .then(function (notifications) {
            notifications.forEach(function (notification) {
                if (notification.notificationType === 'COMMENT') {
                    notification.notificationMessage = 'commented on your <a href="/video/' + notification.videoId + '">video</a> : ' + '"' + notification.notificationMessage + '"';
                } else if (notification.notificationType === 'COMMENT REPLY') {
                    notification.notificationMessage = 'replied to your <a href="/video/' + notification.videoId + '">comment</a> : ' + '"' + notification.notificationMessage + '"'
                } else if (notification.notificationType === 'LIKE') {
                    notification.notificationMessage = 'Liked your <a href="/video/' + notification.videoId + '">video</a>';
                }
            });
            res.json({notifications: notifications, total: notifications.length});
        })
        .catch(function (err) {
            res.sendStatus(500);
        })
}
/**
 * route: GET /api/notifications/get-all/:id
 * @param req
 * @param res
 */
function getAll(req, res) {
    var userId = req.query.id;
    notificationCrud1_0_0
        .getAllByUserId(userId)
        .then(function (notifications) {
            res.json({notifications: notifications});
        })
        .catch(function (err) {
            res.sendStatus(500);
        })
}

Notification.prototype.seen         = seen;
Notification.prototype.post         = post;
Notification.prototype.getUnseen    = getUnseen;
Notification.prototype.getAll       = getAll;


module.exports = new Notification();