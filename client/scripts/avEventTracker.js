var browser = require('./services/browser'),
    EVENT_SOURCE = browser.isMobile() ? 'browser-mobile' : 'browser',
    identity = require('./services/identity');

/**
 * @description send event to the server
 * @param {Object} params
 * @param {string} params.codeSource
 * @param {string} params.eventName
 * @param {string} params.eventSource - required (browser | mobile-browser)
 * @param {string} params.eventType - required
 * @param {string} params.eventMessage
 * @param {string} params.eventVideoPlaybackDetails
 * @param {string} params.referrer
 * @param {string} params.videoId
 * @param {string} params.imgFileType
 * @param {string} params.timeOnSite
 * @param {Object} params.data
 * @returns {Promise}
 */
// TODO: move referrer, videoId, imgFileType, timeOnSite, eventMessage to data
function AVEventTracker(params) {
  if (!params) {
    throw new Error('params is required');
  }

  params = params || {};
  params.eventSource = EVENT_SOURCE;
  params.userId = identity.isAuthenticated() ? identity._id : null;

  return $.ajax({
    type: 'PUT',
    url: '/api/avEventTracker',
    contentType: 'application/json',
    data: JSON.stringify(params),
    dataType: 'json'
  });
}

// Track JavaScript error
(function (window) {
  "use strict";

  /**
   * catch all javascript unhandled exceptions
   * @private
   */
  function _onClientError(event) {
    // NOTE: return as a promise?
    AVEventTracker({
      codeSource: 'avEventTracker',
      eventName: 'unhandled-js-execeptions:client',
      eventType: 'javascript-error',
      data: {
        message: event.message,
        source: event.filename,
        lineNumber: event.lineno
      }
    });

    // TODO: send event to google? (if ga exists)

    // return false to fire the default event handler
    return false;
  }

  function _error(msg) {
    originalConsoleError(msg);
    var data = {};

    if (typeof msg === 'string') {
      data.message = msg;
    } else {
      data = msg;
    }

    AVEventTracker({
      codeSource: 'avEventTracker',
      eventName: 'js-error:client',
      eventType: 'javascript-error',
      data: data
    });
  }

  // override console.error to send data to the server
  var originalConsoleError = window.console.error;

  window.console.error = _error;

  // catch all client error
  window.addEventListener('error', _onClientError);
})(window);

module.exports = AVEventTracker;