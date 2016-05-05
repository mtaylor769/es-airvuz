require('../styles/category.css');

function bindEvents() {
  $('#load-more-btn').on('click', function () {
    /********************************************************/
    console.group('%cloading more video... :', 'color:red;font:strait');
    //console.log(loading more video...);
    console.groupEnd();
    /********************************************************/
  });
}

function initialize() {
  bindEvents();
}

module.exports = {
  initialize: initialize
};