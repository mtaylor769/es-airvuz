require('../styles/category.css');

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

  $('#left-category').on('click', 'h5', function () {
    $(this).parent().toggleClass('is-open');
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
function _getVideos() {
  var TOTAL_PER_PAGE = 16;

  return $.ajax('/api/videos/category/' + CATEGORY_TYPE + '/page/' + current_page)
    .then(function (videos) {
      if (videos.length > 0) {
        categoryVideoTpl({videos: videos}, function (err, html) {
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