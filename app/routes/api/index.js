var apiRouter = require('express').Router();

var users = require('./users');
var videos = require('./videos');

/**
 * /api/auth
 */
//apiRouter.route('/auth/twitter')
//  .post(auth.facebook);
//
//apiRouter.route('/auth/facebook')
//  .post(auth.facebook);
//
//apiRouter.route('/auth')
//  .post(auth.local);



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
//apiRouter.route('/videos')
//  .get(videos.get);
//apiRouter.use('/videos', videos.router);
//
//apiRouter.route('/videos/category/:category')
//  .get(videos.getByCategory);
//
//apiRouter.route('/videos/:id')
//  .get(videos.get)
//  .put(videos.update)
//  .delete(videos.delete);

var auth = require('./auth');
apiRouter.route('/auth/token')
  .post(auth.login);

exports.router = apiRouter;