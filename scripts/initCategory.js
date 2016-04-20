var mongoose = require('mongoose'),
  categoryTypeCrud = require('../app/persistence/crud/categoryType');

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
    promises.push(categoryTypeCrud.create(camera));
  });

  return Promise.all(promises);
}

setTimeout(function () {
  createCategoryType();
}, 5000);