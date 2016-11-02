var mongoose = require('mongoose'),
    cameraTypeCrud1_0_0 = require('../app/persistence/crud/cameraType1-0-0');

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
    promises.push(cameraTypeCrud1_0_0.create(camera));
  });

  return Promise.all(promises);
}

setTimeout(function () {
  createCameraType();
}, 5000);