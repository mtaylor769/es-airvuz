var mongoose = require('mongoose'),
    droneTypeCrud1_0_0 = require('../app/persistence/crud/droneType1-0-0');

var drones = [
    {
        model: 'Chroma',
        manufacturer: 'Horizon/Blade',
        isVisible: true
    },
    {
        model: '350QX/QX2/QX3',
        manufacturer: 'Horizon/Blade',
        isVisible: true
    }
];

function createDroneType() {
    var promises = [];

    drones.forEach(function (drone) {
        promises.push(droneTypeCrud1_0_0.create(drone));
    });

    return Promise.all(promises);
}

setTimeout(function () {
    createDroneType();
}, 5000);