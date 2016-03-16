var apiRouter           = require('express').Router();
var users               = require('./users');
var videos              = require('./videos');
var passport            = require('passport');
var SocialMedia         = require('../../persistence/crud/socialMediaAccount');

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



exports.router = apiRouter;