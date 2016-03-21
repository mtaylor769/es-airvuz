var CameraTypeCrud = require('../../persistence/crud/cameraType');

function CameraType() {

}

CameraType.prototype.post = function(req, res) {
  CameraTypeCrud
  .create(req.body)
  .then(function(camera) {
    res.send(camera);
  })
};

CameraType.prototype.get = function(req, res) {
  CameraTypeCrud
  .get()
  .then(function(cameras) {
    res.send(cameras);
  })
};

CameraType.prototype.getById = function(req, res) {
  CameraTypeCrud
  .getById(req.params.id)
  .then(function(camera) {
    res.send(camera);
  })
};

CameraType.prototype.put = function(req, res) {
  CameraTypeCrud
  .update({id: req.body._id, update: req.body})
  .then(function(camera) {
    res.send(camera);
  })
};

CameraType.prototype.delete = function(req, res) {
  CameraTypeCrud
  .remove(req.params.id)
  .then(function() {
    res.sendStatus(200);
  })
};

module.exports = new CameraType();