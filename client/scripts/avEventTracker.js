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
 * @param {string} params.siteTimeSpent
 * @returns {Promise}
 */
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

module.exports = AVEventTracker;