var PubSub        = require('pubsub-js');
var AVEventTracker = require('../avEventTracker');

$.ajaxSetup({
  beforeSend: function (xhr) {
    var token = localStorage.getItem('id_token');
    if (token) {
      xhr.setRequestHeader('Authorization', 'Bearer ' + token);
    }
  },
  // similar to error property
  statusCode: {
    // forbidden
    403: function (jqXHR) {
      if (jqXHR.responseText === 'suspended') {
        PubSub.publish('logout');
      }
    },
    500: function (jqXHR) {
      AVEventTracker({
        codeSource: 'config:jquery',
        eventName: 'xhr:500:client',
        eventType: 'xhr-status',
        data: {
          url: this.url,
          response: jqXHR.responseText
        }
      });
    }
  }
});