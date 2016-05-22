require('../styles/category.css');

var $categoryPage,
    current_page = 1,
    CATEGORY_TYPE;

/**
 * Templates
 */
var categoryVideoTpl = require('../templates/category/category-video.dust');

function bindEvents() {
  $('#load-more-btn').on('click', function () {
    var self = this,
      // total per page should be same as the server side
      TOTAL_PER_PAGE = 16;

    current_page++;

    $.ajax('/api/videos/category/' + CATEGORY_TYPE + '/page/' + current_page)
      .then(function (videos) {
        if (videos.length > 0) {
          categoryVideoTpl({videos: videos}, function (err, html) {
            $categoryPage.find('#videos > div').append(html);
          });
        }
        if (videos.length < TOTAL_PER_PAGE) {
          // remove load more button when there's none left
          $(self).remove();
        }
      });
  });
  $('#left-category').on('click', 'h5', function () {
    $(this).parent().toggleClass('is-open');
  });
}

function initialize(categoryType) {
  $categoryPage = $('#category-page');

  CATEGORY_TYPE = categoryType;

  bindEvents();
}

module.exports = {
  initialize: initialize
};