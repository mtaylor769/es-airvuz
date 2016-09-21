require('../styles/search.css');

var AmazonConfig = require('./config/amazon.config.client'),
  currentPage = 1,
  $loadMoreBtn,
  $currentPage,
  searchKeyWord;

/**
 * Templates
 */
var videoDisplayTpl = require('../templates/core/video-display.dust');

function bindEvents() {
  $loadMoreBtn.on('click', onLoadMoreBtnClick);
  _checkImageError();
}

function _imageLoadError() {
  $(this).attr('src', AmazonConfig.CDN_URL + '/client/images/unavailable-drone-video-thumbnail-226x127.jpg');
}

function _checkImageError() {
  $('.video img').one('error', _imageLoadError);
}

function onLoadMoreBtnClick() {
  currentPage++;

  _getVideos();
}

/**
 * get videos
 * @returns {Promise}
 * @private
 */
function _getVideos() {
  var TOTAL_PER_PAGE = 20,
    apiUrl = '/api/videos/search?q=' + searchKeyWord + '&page=' + currentPage;

  return $.ajax(apiUrl)
    .then(function (result) {

      if (result.videos.length > 0) {
        videoDisplayTpl({videos: result.videos, s3Bucket: AmazonConfig.OUTPUT_BUCKET, showCategory: true, cdnUrl: AmazonConfig.CDN_URL}, function (err, html) {
          $currentPage.find('#videos > div').append(html);
          _checkImageError();
        });
      }

      if (result.videos.length < TOTAL_PER_PAGE) {
        // remove load more button when there's none left
        $loadMoreBtn.remove();
      }
    });
}

function initialize(keyword) {
  searchKeyWord = keyword;
  $loadMoreBtn = $('#load-more-btn');
  $currentPage = $('#search-page');

  bindEvents();
}

module.exports = {
  initialize: initialize
};