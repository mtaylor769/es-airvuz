var apiRouter           = require('express').Router();
var users               = require('./users');
var videos              = require('./videos');
var passport            = require('passport');
var SocialMedia         = require('../../persistence/crud/socialMediaAccount');
var cameraType          = require('./cameraType');

/**
 * /api/auth
 */
var auth = require('./auth');

apiRouter.route('/auth')
  .post(auth.login);

apiRouter.route('/auth/facebook')
  .get(auth.facebook);

apiRouter.route('/auth/facebook/callback')
  .get(auth.facebookCallback);

apiRouter.route('/auth/google')
  .get(auth.google);

apiRouter.route('/auth/google/callback')
  .get(auth.googleCallback);

apiRouter.route('/auth/twitter')
  .get(auth.twitter);

apiRouter.route('/auth/twitter/callback')
  .get(auth.twitterCallback);



/**
 * /api/users/
 */
//apiRouter.route('/users')
//  .get(users.getAll)
//  .post(users.post);
//
//apiRouter.route('/users/search')
//  .get(users.search);
//
//apiRouter.route('/users/:id');

/**
 * /api/videos/
 */
apiRouter.route('/videos')
  .post(videos.post);
//apiRouter.use('/videos', videos.router);
//
//apiRouter.route('/videos/category/:category')
//  .get(videos.getByCategory);
//
apiRouter.route('/videos/:id')
  .get(videos.get)
  .put(videos.put)
  .delete(videos.del);


/**
 * /api/camera-type/
 */
apiRouter.route('/camera-type')
  .post(cameraType.post)
  .get(cameraType.get);

apiRouter.route('/camera-type/:id')
  .get(cameraType.getById)
  .put(cameraType.put)
  .delete(cameraType.del);

var auth = require('./auth');
apiRouter.route('/auth/token')
  .post(auth.login);

exports.router = apiRouter;