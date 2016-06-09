var formsCrud              = require('../../persistence/crud/forms');
var nodemailer             = require('nodemailer');
var _                      = require('lodash');

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
  formsCrud.getCount()
    .then(function (count) {
      if (count > 3300) {
        throw 'Max capacity exceed';
      }
      return formsCrud.createForms(req.body);
    })
    .then(function () {
      var mailOptions = {
        to: req.body.emailAddress,
        subject: 'Valley Fair',
        html: '<div>You are going to valleyfair!</div>'
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
