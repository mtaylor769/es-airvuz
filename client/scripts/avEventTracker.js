/**
 * @description send event to the server
 * @param {Object} params
 * @param {string} params.codeSource
 * @param {string} params.eventName
 * @param {string} params.eventSource - required
 * @param {string} params.eventType - required
 * @param {string} params.eventMessage
 * @param {string} params.eventVideoPlaybackDetails
 * @param {string} params.referrer
 * @param {string} params.videoId
 * @returns {Promise}
 */
function AVEventTracker(params) {
  if (!params) {
    throw new Error('params is required');
  }

  return $.ajax({
    type: 'PUT',
    url: '/api/avEventTracker',
    contentType: 'application/json',
    data: JSON.stringify(params),
    dataType: 'json'
  });
}

module.exports = AVEventTracker;