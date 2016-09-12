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
var reports 			= require('./reports');
var keywords			= require('./keywords');
var videoCuration 		= require('./videoCuration');
// var forms               = require('./forms');
var image               = require('./image');
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
  .post(auth.localLogin);

apiRouter.route('/api/auth/facebook')
  .post(auth.facebook);

apiRouter.route('/api/auth/google')
  .post(auth.google);

// apiRouter.route('/api/auth/twitter')
//   .get(auth.twitter);
//
// apiRouter.route('/api/auth/twitter/callback')
//   .get(auth.twitterCallback);
//
// apiRouter.route('/api/auth/instagram')
//   .get(auth.instagram);
//
// apiRouter.route('/api/auth/instagram/callback')
//   .get(auth.instagramCallback);

/**
 * /api/users/
 */
//apiRouter.route('/api/users')
//.get(users.getAll)
//.post(users.post);
//
apiRouter.route('/api/users/search')
  .get(protect, users.search);

apiRouter.route('/api/users/password-reset')
  .post(users.passwordResetRequest)
  .put(users.passwordResetChange);

apiRouter.route('/api/users/create')
  .post(users.createUser);

apiRouter.route('/api/users/hireme')
  .post(users.hireMe);

apiRouter.route('/api/users/contact-us')
  .post(users.contactUs);

apiRouter.route('/api/users/:id' + '/status')
  .put(protect, users.statusChange);

apiRouter.route('/api/users/:id')
  .get(users.get)
  .put(protect, users.put)
  .delete(protect, users.delete);

apiRouter.route('/api/users/resend-confirmation')
  .post(users.resendConfirmation);

/**
 * /api/follow/
 */
apiRouter.route('/api/follow')
  .post(follow.post);

apiRouter.route('/api/follow/check')
  .post(follow.getCheckFollowing);

apiRouter.route('/api/follow/get-followers')
  .get(follow.getFollowers);

apiRouter.route('/api/follow/get-following')
  .get(follow.getFollowing);

/**
 * /api/notifications/
 */
apiRouter.route('/api/notifications')
  .post(notifications.post)
  .get(protect, notifications.getUnseen);

apiRouter.route('/api/notifications/seen')
  .post(protect, notifications.seen);

apiRouter.route('/api/notifications/get-all/:id')
  .get(notifications.getAll);

/**
 * /api/videos/
 */
apiRouter.route('/api/videos')
  .post(protect, videos.post);

apiRouter.route('/api/videos/search')
	.get(videos.search);

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
  .put(protect, videos.put)
  .delete(protect, videos.delete);

apiRouter.route('/api/video-like')
  .post(videoLike.post);

apiRouter.route('/api/videos/user/:id')
  .get(videos.getVideosByUser);

apiRouter.route('/api/videos/showcase/:id')
  .get(videos.getShowcaseByUser);

apiRouter.route('/api/videos/topSixVideos/:id')
	.get(videos.getTopSixVideos);
apiRouter.route('/api/videos/videoCount/:id')
	.get(videos.getVideoCount);
apiRouter.route('/api/videos/followCount/:id')
	.get(videos.getFollowCount);
apiRouter.route('/api/videos/nextVideos')
	.post(videos.getNextVideos);
apiRouter.route('/api/video/videoOwnerProfile/:id')
	.get(videos.getVideoOwnerProfile);
apiRouter.route('/api/videos/videoComments/:id')
	.get(videos.getCommentsByVideoId);

/**
 * /api/camera-type/
 */
apiRouter.route('/api/camera-type')
  .post(protect, cameraType.post)
  .get(cameraType.get);

apiRouter.route('/api/camera-type/:id')
  .get(cameraType.getById)
  .put(protect, cameraType.put)
  .delete(protect, cameraType.delete);

/**
 * /api/category-type/
 */
apiRouter.route('/api/category-type')
  .post(protect, categoryType.post)
  .get(categoryType.get);

apiRouter.route('/api/category-type/by-roles')
  .get(protect, categoryType.getByRoles);

apiRouter.route('/api/category-type/:id')
  .get(categoryType.getById)
  .put(protect, categoryType.put)
  .delete(protect, categoryType.delete);

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
  .put(protect, comment.put)
  .delete(protect, comment.delete);

apiRouter.route('/api/comment/report/')
  .post(protect, comment.reportComment);

/**
 * /api/slider/
 */

apiRouter.route('/api/slider')
  .get(slider.getAll)
  .post(protect, slider.post);

apiRouter.route('/api/slider/:id')
  .get(slider.get)
  .delete(protect, slider.remove)
  .put(protect, slider.put);

/**
 * /api/slide/
 */

apiRouter.route('/api/slide')
  .get(slide.getAll)
  .post(protect, slide.post);

apiRouter.route('/api/slide/:id')
  .get(slide.get)
  .delete(protect, slide.remove)
  .put(protect, slide.put);

/**
 * /api/featured-videos/
 */
apiRouter.route('/api/featured-videos')
  .get(videoCollection.getVideos('Featured Videos'))
  .put(protect, videoCollection.updateVideo('Featured Videos'));

apiRouter.route('/api/staff-pick-videos')
  .get(videoCollection.getVideos('Staff Pick Videos'))
  .put(protect, videoCollection.updateVideo('Staff Pick Videos'));

apiRouter.route('/api/video-collection/update-collection')
  .post(protect, videoCollection.updateCollectionVideos);

/**
 * /api/upload
 */
apiRouter.post('/api/upload', protect, upload.post);
apiRouter.get('/api/upload/:id', /*upload.getStatus,*/ amazon.getVideoInfo);

apiRouter.post('/api/upload-external', protect, upload.uploadExternalVideo);

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

/**
 * /api/forms/
 */
// apiRouter.post('/api/forms', forms.post);

/**
 * /api/images
 */
apiRouter.get('/api/image/profile-picture/:picture', image.getProfilePicture);

/**
 * /api/reports
 */

apiRouter.route('/api/reports/site-info')
  .get(reports.siteInfo);

apiRouter.route('/api/reports/employee-contributor')
  .post(reports.employeeContributor);

apiRouter.route('/api/reports/videos')
  .get(reports.getVideos);

apiRouter.route('/api/reports/comments')
	.get(reports.getComments);
apiRouter.route('/api/reports/hashtag')
	.post(reports.hashTag);
apiRouter.route('/api/reports/user-hashtag')
	.post(reports.userHashtag);
apiRouter.route('/api/reports/top-views')
	.post(reports.top100Views);

apiRouter.route('/api/edit-comments')
	.get(comment.adminGetComments);
/**
 * /api/keywords
 */

apiRouter.route('/api/keyword')
	.get(keywords.search)
	.post(keywords.create);

apiRouter.route('/api/video-curation')
	.post(videoCuration.rating);


module.exports = apiRouter;