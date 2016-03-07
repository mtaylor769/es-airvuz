var jwt = require('jsonwebtoken'),
  tokenConfig = require('../../../config/token');

function login(req, res) {
  if (req.body.email !== 'admin@airvuz.com' || req.body.password !== 'AV2015qsc734') {
    return res.status(400).send('incorrect email or password');
  }

  // hard code for now
  var user = {
    email: 'admin@airvuz.com',
    name: 'Admin'
  };

  var token =  jwt.sign(user, tokenConfig.secret, { expiresIn: tokenConfig.expires });

  return res.json({
    token: token
  });
}

module.exports = {
  login: login
};