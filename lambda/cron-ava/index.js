/**
 * lambda name: auto-views
 *  run auto view cron
 *
 * configure input:
 *  - production: {"NODE_ENV":"production"}
 *  - beta: {"NODE_ENV":"beta"}
 */

var request = require('request');
var CRON_URL = 'https://beta.airvuz.com/api/cron/ava';

exports.handler = function(event, context, callback) {
  var NODE_ENV = event.NODE_ENV || 'beta';

  if (NODE_ENV === 'production') {
    CRON_URL = 'https://www.airvuz.com/api/cron/ava';
  }

  request(CRON_URL, function (error, response) {
    if (!error && response.statusCode == 200) {
      return callback(null, 'Success running auto-views cron for ' + NODE_ENV);
    }
    return callback(error);
  });
};