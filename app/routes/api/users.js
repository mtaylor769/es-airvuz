var usersRouter         = require('express').Router();
var passport            = require('passport');
var Users               = require('../../persistence/crud/users');
usersRouter.get('/', function (req, res) {

  res.send('Test');

});

// usersRouter.post('/signup', passport.authenticate('local-signup', {
//   successRedirect: '/',
//   failureRedirect: '/play'
// }));

usersRouter.post('/signup', function(req, res) {
  Users.create(req.body);
});

usersRouter.post('/login', passport.authenticate('local-login'), function(req, res){
  console.log('passport is working');
});

// usersRouter.post('/login', passport.authenticate('local-login', {
//   successRedirect: '/',
//   failureRedirect: '/play',
//   failureFlash: 'Invalid username or password.'
// }));

// usersRouter.post('/login', function(req, res){
//   console.log(req.body);
// });

usersRouter.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
})

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}

exports.router = usersRouter;