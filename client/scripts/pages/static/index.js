var valleyFairForm = require('./valley-fair-forms');

function initialize() {
  if (window.location.pathname === '/forms') {
    valleyFairForm.initialize();
  }
}

module.exports = {
  initialize: initialize
};