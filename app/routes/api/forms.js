var formsCrud              = require('../../persistence/crud/forms');
var nodemailer             = require('nodemailer');
var _                      = require('lodash');
var Promise                = require('bluebird');

function Forms() {}

function _sendMail(options) {
  var transport = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user:'support@airvuz.com',
      pass:'b5&YGG6n'
    }
  });

  var defaultOptions = {
    from : 'AirVuz <noreply@airvuz.com>'
    // to
    // subject
    // html
  };

  return new Promise(function (resolve, reject) {
    transport.sendMail(_.extend({}, defaultOptions, options), function(error, message) {
      if(error) {
        return reject(message);
      }
      return resolve(message);
    });
  });
}

function post(req, res) {
  var isRegistered  = formsCrud.getCount({emailAddress: req.body.emailAddress, type: req.body.type});
  var totalCount    = formsCrud.getCount({type: req.body.type});

  Promise.all([totalCount, isRegistered])
    .spread(function (count, isRegister) {
      if (count > 3300) {
        throw 'Max capacity exceed.';
      }
      if (isRegister) {
        throw 'You already registered. Please check email.';
      }
      return formsCrud.createForms(req.body);
    })
    .then(function () {
      var mailOptions = {
        to: req.body.emailAddress,
        subject: 'Link to your required form for being an extra at Valley Fair',
        html: '<div>Please click <a href="https://drive.google.com/file/d/0B-3MjoINNAV1TmxHZk9CTXZvWXk1cWdPdDZjVEJqZjlIUzVB/view?usp=sharing">here</a> to access the required form for attending the Ryan\'s Ridiculous show at Valley Fair. <br/><br/>Please print it, have your parent/guardians sign it and be sure to bring it with you that day!</div>' +
        '<br/>' +
        '<br/>' +
        'Thanks and See you there!' +
        '<br/>' +
        'Team AirVūz'
      };

      return _sendMail(mailOptions);
    })
    .then(function () {
      res.sendStatus(200);
    })
    .catch(function (err) {
      if (typeof err === 'string') {
        return res.status(400).send(err);
      }
      res.sendStatus(500);
    });
}

Forms.prototype.post         = post;

module.exports = new Forms();
