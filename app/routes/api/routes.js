var apiRouter           = require('express').Router();
var avEventTracker      = require('./avEventTracker');
var users               = require('./users');
var videos              = require('./videos');
var cameraType          = require('./cameraType');
var categoryType        = require('./categoryType');
var droneType           = require('./droneType');
var comment             = require('./comment');
var follow              = require('./follow');
var notifications       = require('./notifications');
var videoLike           = require('./videoLike');
var slide               = require('./slide');
var slider              = require('./slider');
var upload              = require('./upload');
var amazon              = require('./amazon');
var videoCollection     = require('./videoCollection');
var protect             = require('../../middlewares/protect');
var token               = require('../../middlewares/token');


apiRouter
	.route('/api/avEventTracker')
	.put(avEventTracker.put);


/**
 * /api/auth
 */
var auth = require('./auth');

apiRouter.route('/api/auth')
  .post(auth.login, auth.loginSuccess);

apiRouter.route('/api/auth/facebook')
  .get(auth.facebook);

apiRouter.route('/api/auth/facebook/callback')
  .get(auth.facebookCallback);

apiRouter.route('/api/auth/google')
  .get(auth.google);

apiRouter.route('/api/auth/google/callback')
  .get(auth.googleCallback);

apiRouter.route('/api/auth/twitter')
  .get(auth.twitter);

apiRouter.route('/api/auth/twitter/callback')
  .get(auth.twitterCallback);

apiRouter.route('/api/auth/instagram')
  .get(auth.instagram);

apiRouter.route('/api/auth/instagram/callback')
  .get(auth.instagramCallback);


/**
 * /api/users/
 */
//apiRouter.route('/api/users')
  //.get(users.getAll)
  //.post(users.post);
//
apiRouter.route('/api/users/search')
  .get(protect, users.search);

apiRouter.route('/api/users/:id')
  .get(users.get)
	.put(users.put);

apiRouter.route('/api/users/create')
  .post(users.createUser);

/**
 * /api/follow/
 */
apiRouter.route('/api/follow')
	.post(follow.post);

apiRouter.route('/api/follow/check')
	.post(follow.getCheckFollowing);

/**
 * /api/notifications/
 */
apiRouter.route('/api/notifications')
	.post(notifications.post);

apiRouter.route('/api/notifications/:id')
	.get(notifications.getUnseen);

apiRouter.route('/api/notifications/get-all/:id')
	.get(notifications.getAll);

/**
 * /api/videos/
 */
apiRouter.route('/api/videos')
  .post(videos.post);

apiRouter.route('/api/videos/category/:category/page/:page')
	.get(token, videos.getVideosByCategory);

apiRouter.route('/api/videos/loaded')
	.post(videos.loaded);

apiRouter.route('/api/videos/showcase-update')
	.post(videos.showcaseUpdate);

apiRouter.route('/api/videos/report-video')
	.post(videos.reportVideo);

apiRouter.route('/api/videos/videoInfoCheck')
	.get(videos.videoInfoCheck);

apiRouter.route('/api/videos/:id')
  .get(videos.get)
  .put(videos.put)
  .delete(videos.delete);

apiRouter.route('/api/video-like')
  .post(videoLike.post);

apiRouter.route('/api/videos/user/:id')
  .get(videos.getVideosByUser);

apiRouter.route('/api/videos/showcase/:id')
  .get(videos.getShowcaseByUser);


/**
 * /api/camera-type/
 */
apiRouter.route('/api/camera-type')
  .post(cameraType.post)
  .get(cameraType.get);

apiRouter.route('/api/camera-type/:id')
  .get(cameraType.getById)
  .put(cameraType.put)
  .delete(cameraType.delete);

/**
 * /api/category-type/
 */
apiRouter.route('/api/category-type')
  .post(categoryType.post)
  .get(categoryType.get);

apiRouter.route('/api/category-type/:id')
  .get(categoryType.getById)
  .put(categoryType.put)
  .delete(categoryType.delete);

/**
 * /api/drone-type/
 */
apiRouter.route('/api/drone-type')
  .post(droneType.post)
  .get(droneType.get);

apiRouter.route('/api/drone-type/:id')
  .get(droneType.getById)
  .put(droneType.put)
  .delete(droneType.delete);

/**
 * /api/comment/
 */
apiRouter.route('/api/comment')
  .post(protect, comment.post);

apiRouter.route('/api/comment/byParent')
  .get(comment.getByParentCommentId);

apiRouter.route('/api/comment/byVideo')
  .get(comment.getByVideoId);

apiRouter.route('/api/comment/:id')
  .get(comment.getById)
  .put(comment.put)
  .delete(comment.delete);

/**
 * /api/slider/
 */

apiRouter.route('/api/slider')
  .get(slider.getAll)
  .post(slider.post);

apiRouter.route('/api/slider/:id')
  .get(slider.get)
  .delete(slider.remove)
  .put(slider.put);

/**
 * /api/slide/
 */

apiRouter.route('/api/slide')
  .get(slide.getAll)
  .post(slide.post);

apiRouter.route('/api/slide/:id')
  .get(slide.get)
  .delete(slide.remove)
  .put(slide.put);

/**
 * /api/featured-videos/
 */
apiRouter.route('/api/featured-videos')
  .get(videoCollection.getVideos('Featured Videos'))
  .put(videoCollection.updateVideo('Featured Videos'));

apiRouter.route('/api/staff-pick-videos')
  .get(videoCollection.getVideos('Staff Pick Videos'))
  .put(videoCollection.updateVideo('Staff Pick Videos'));

apiRouter.route('/api/video-collection/update-collection')
	.post(videoCollection.updateCollectionVideos);

/**
 * /api/upload
 */
apiRouter.post('/api/upload', upload.post);
apiRouter.get('/api/upload/:id', /*upload.getStatus,*/ amazon.getVideoInfo);

/**
 * /api/amazon
 */

apiRouter.get('/api/amazon/sign-auth', amazon.signAuth);
apiRouter.get('/api/amazon/video-duration', amazon.getVideoDuration);
apiRouter.post('/api/amazon/move-file', amazon.moveFile);
apiRouter.post('/api/amazon/transcode/start', amazon.startTranscode);
apiRouter.post('/api/amazon/transcode/completion', /*bodyParser.text(),*/ amazon.confirmSubscription, upload.transcodeCompletion);
apiRouter.post('/api/amazon/transcode/progression', /*bodyParser.text(),*/ amazon.confirmSubscription, upload.transcodeProgression);
apiRouter.post('/api/amazon/transcode/failure', /*bodyParser.text(),*/ amazon.confirmSubscription, upload.transcodeFailure);
apiRouter.post('/api/amazon/transcode/warning', /*bodyParser.text(),*/ amazon.confirmSubscription, upload.transcodeWarning);

module.exports = apiRouter;