var mongoose = require('mongoose'),
  catTypeCrud1_0_0 = require('../app/persistence/crud/categoryType1-0-0');

var category = [
  {
    name: 'News',
    isVisible: true
  },
  {
    name: 'AirVuz',
    isVisible: true
  }
];

function createCategoryType() {
  var promises = [];

  category.forEach(function (camera) {
    promises.push(catTypeCrud1_0_0.create(camera));
  });

  return Promise.all(promises);
}

setTimeout(function () {
  createCategoryType();
}, 5000);