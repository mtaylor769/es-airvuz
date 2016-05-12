require('../styles/category.css');

function bindEvents() {
  $('#load-more-btn').on('click', function () {
    /********************************************************/
    console.group('%cloading more video... :', 'color:red;font:strait');
    //console.log(loading more video...);
    console.groupEnd();
    /********************************************************/
  });
  $('#left-category').on('click', 'h5', function () {
    $(this).parent().toggleClass('is-open');
  });
}

function initialize() {
  bindEvents();
}

module.exports = {
  initialize: initialize
};