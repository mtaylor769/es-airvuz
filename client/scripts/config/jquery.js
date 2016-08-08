var PubSub        = require('pubsub-js');

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
    }
  }
});