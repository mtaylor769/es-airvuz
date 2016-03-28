var apiRouter           = require('express').Router();
var users               = require('./users');
var videos              = require('./videos');
var passport            = require('passport');
var SocialMedia         = require('../../persistence/crud/socialMediaAccount');
var cameraType          = require('./cameraType');
var categoryType        = require('./categoryType');
var droneType           = require('./droneType');
var curatedVideos       = require('./curatedVideos');
var comment             = require('./comment');

/**
 * /api/auth
 */
var auth = require('./auth');

apiRouter.route('/api/auth')
  .post(auth.login);

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
//apiRouter.route('/api/users/search')
//  .get(users.search);
//
//apiRouter.route('/api/users/:id');

/**
 * /api/videos/
 */
apiRouter.route('/api/videos')
  .post(videos.post);
//apiRouter.use('/videos', videos.router);
//
//apiRouter.route('/api/videos/category/:category')
//  .get(videos.getByCategory);
//
apiRouter.route('/api/videos/:id')
  .get(videos.get)
  .put(videos.put)
  .delete(videos.delete);


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
 * /api/curated-videos/
 */
apiRouter.route('/api/curated-videos')
  .post(curatedVideos.post)
  .get(curatedVideos.get);
//
apiRouter.route('/api/curated-videos/:id')
  .get(curatedVideos.getById)
  .put(curatedVideos.put)
  .delete(curatedVideos.delete);

/**
 * /api/comment/
 */
apiRouter.route('/api/comment')
  .post(comment.post)
  .get(comment.get);

module.exports = apiRouter;