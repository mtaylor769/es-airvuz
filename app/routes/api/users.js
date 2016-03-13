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
  console.log(req.body);
  Users.create(req.body);
});

usersRouter.get('/login', passport.authenticate('local-login', {
  successRedirect: '/',
  failureRedirect: '/'
}));

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