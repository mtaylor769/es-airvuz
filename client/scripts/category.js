require('../styles/category.css');
var AmazonConfig              = require('./config/amazon.config.client');

var $categoryPage,
    $loadMoreBtn,
    currentPage = 1,
    currentSort = 'uploadDate',
    currentCategoryType;

/**
 * Templates
 */
var videoDisplayTpl = require('../templates/core/video-display.dust');

function bindEvents() {
  $loadMoreBtn.on('click', onLoadMoreBtnClick);

  $('.category-nav').on('click', 'h5', function () {
    $(this).parent().toggleClass('is-open');
  });
  $categoryPage.find('#category-sort-select').on('change', function () {
    currentPage = 1;
    $categoryPage.find('#videos > div').empty();
    currentSort = $(this).val();
    _getVideos();
  });
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
      apiUrl = '/api/videos/category/' + currentCategoryType + '?page=' + currentPage + '&sort=' + currentSort;

  return $.ajax(apiUrl)
    .then(function (videos) {
      if (videos.length > 0) {
        videoDisplayTpl({videos: videos, s3Bucket: AmazonConfig.OUTPUT_URL}, function (err, html) {
          $categoryPage.find('#videos > div').append(html);
        });
      }
      if (videos.length < TOTAL_PER_PAGE) {
        // remove load more button when there's none left
        $loadMoreBtn.remove();
      }
    });
}

function getFollowerVideos() {
  _getVideos();
}

function initialize(categoryType) {
  $categoryPage = $('#category-page');
  $loadMoreBtn = $('#load-more-btn');

  currentCategoryType = categoryType;

  // only follower videos are render from client side because it require a user to get following video
  if (currentCategoryType === 'following-drone-videos') {
    getFollowerVideos();
  }

  bindEvents();
}

module.exports = {
  initialize: initialize
};