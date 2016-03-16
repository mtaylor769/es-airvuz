var apiRouter           = require('express').Router();
var users               = require('./users');
var videos              = require('./videos');
var passport            = require('passport');
var SocialMedia         = require('../../persistence/crud/socialMediaAccount');

/**
 * /api/auth
 */
apiRouter.route('/auth')
  .post('/', function(req, res, next) {
  passport.authenticate('local-login', function(error, user, info){
    if (error) {
      return next(error);
    }
    if (!user) {
      return res.json(401, {error: 'No user found'});
    }
    var token =  jwt.sign(user, tokenConfig.secret, { expiresIn: tokenConfig.expires });
    res.json({token: token});
  })(req, res, next);
});

apiRouter.route('/auth')
  .get('/facebook', passport.authenticate('facebook', {scope : 'email'}));

apiRouter.route('/auth')
  .get('/facebook/callback', 
  passport.authenticate('facebook', { failureRedirect: '/play' }),
  function(req, res) {
    console.log('successful facebook auth');
    console.log(req.body);
  });


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