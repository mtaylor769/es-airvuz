var mongoose = require('mongoose'),
  droneTypeCrud = require('../app/persistence/crud/droneType');

var drones = [
  {
    model: 'Chroma',
    manufacturer : 'Horizon/Blade',
    isVisible: true
  },
  {
    model: '350QX/QX2/QX3',
    manufacturer : 'Horizon/Blade',
    isVisible: true
  }
];

function createDroneType() {
  var promises = [];

  drones.forEach(function (drone) {
    promises.push(droneTypeCrud.create(drone));
  });

  return Promise.all(promises);
}

setTimeout(function () {
  createDroneType();
}, 5000);