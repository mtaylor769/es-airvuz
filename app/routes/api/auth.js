var jwt = require('jsonwebtoken'),
  passport = require('passport'),
  tokenConfig = require('../../../config/token');

function login(req, res, next) {
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


  // if (req.body.email !== 'admin@airvuz.com' || req.body.password !== 'AV2015qsc734') {
  //   return res.status(400).send('incorrect email or password');
  // }

  // // hard code for now
  // var user = {
  //   email: 'admin@airvuz.com',
  //   name: 'Admin'
  // };

  // var token =  jwt.sign(user, tokenConfig.secret, { expiresIn: tokenConfig.expires });

  // return res.json({
  //   token: token
  // });
}

function local(req, res) {
  //passport
}
module.exports = {
  login: login,
  local: local
};