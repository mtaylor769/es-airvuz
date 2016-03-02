var usersRouter = require('express').Router();
var passport  = require('passport');

usersRouter.get('/', function (req, res) {

  res.send('Test');

});

usersRouter.get('/signup', function(req,res){

});

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