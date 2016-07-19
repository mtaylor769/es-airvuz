var DroneTypeCrud = require('../../persistence/crud/droneType');

function DroneType() {

}

DroneType.prototype.post = function(req, res) {
  DroneTypeCrud
    .create(req.body)
    .then(function(drone) {
      res.send(drone);
    })
    .catch(function(error) {
      res.send(error);
    })
};

DroneType.prototype.get = function(req, res) {
  DroneTypeCrud
    .get()
    .then(function(drones) {
      res.send(drones);
    })
};

DroneType.prototype.getById = function(req, res) {
  DroneTypeCrud
    .getById(req.params.id)
    .then(function(drone) {
      res.send(drone);
    })
};

DroneType.prototype.put = function(req, res) {
  DroneTypeCrud
    .update({id: req.body._id, update: req.body})
    .then(function(drone) {
      res.send(drone);
    })
};

DroneType.prototype.delete = function(req, res) {
  DroneTypeCrud
    .remove(req.params.id)
    .then(function() {
      res.sendStatus(200);
    })
};

module.exports = new DroneType();