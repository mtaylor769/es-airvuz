var mongoose = require('mongoose'),
  cameraTypeCrud = require('../app/persistence/crud/cameraType');

var cameras = [
  {
    model: '(all models)',
    manufacturer : 'Integrated/Built-In',
    isVisible: true
  },
  {
    model: '(all models)',
    manufacturer : 'GoPro',
    isVisible: true
  }
];

function createCameraType() {
  var promises = [];

  cameras.forEach(function (camera) {
    promises.push(cameraTypeCrud.create(camera));
  });

  return Promise.all(promises);
}

setTimeout(function () {
  createCameraType();
}, 5000);