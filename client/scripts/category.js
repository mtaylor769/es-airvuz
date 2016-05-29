require('../styles/category.css');
var AmazonConfig              = require('./config/amazon.config.client');

var $categoryPage,
    $loadMoreBtn,
    current_page = 1,
    CATEGORY_TYPE;

/**
 * Templates
 */
var categoryVideoTpl = require('../templates/category/category-video.dust');

function bindEvents() {
  $loadMoreBtn.on('click', onLoadMoreBtnClick);

  $('.category-nav').on('click', 'h5', function () {
    $(this).parent().toggleClass('is-open');
  });
  $categoryPage.find('#category-sort-select').on('change', function () {
    current_page = 1;
    $categoryPage.find('#videos > div').empty();
    _getVideos($(this).val());
  });
}

function onLoadMoreBtnClick() {
  current_page++;

  _getVideos();
}

/**
 * get videos
 * @returns {Promise}
 * @private
 */
function _getVideos(sort) {
  var TOTAL_PER_PAGE = 20,
      apiUrl = '/api/videos/category/' + CATEGORY_TYPE + '/page/' + current_page;

  if (sort) {
    apiUrl += '?sort=' + sort;
  }

  return $.ajax(apiUrl)
    .then(function (videos) {
      if (videos.length > 0) {
        categoryVideoTpl({videos: videos, s3Bucket: AmazonConfig.OUTPUT_URL}, function (err, html) {
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

  CATEGORY_TYPE = categoryType;

  // only follower videos are render from client side because it require a user to get follower video
  if (CATEGORY_TYPE === 'Follower Videos') {
    getFollowerVideos();
  }

  bindEvents();
}

module.exports = {
  initialize: initialize
};