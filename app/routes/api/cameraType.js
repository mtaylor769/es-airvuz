var CameraType = require('../../persistence/crud/cameraType');

function post(req, res) {
  CameraType
  .create(req.body)
  .then(function(camera) {
    res.send(camera);
  })
}

function get(req, res) {
  CameraType
  .get()
  .then(function(cameras) {
    res.send(cameras);
  })
}

function getById(req, res) {
  CameraType
  .getById(req.params.id)
  .then(function(camera) {
    res.send(camera);
  })
}

function put(req, res) {
  CameraType
  .update({id: req.body._id, update: req.body})
  .then(function(camera) {
    res.send(camera);
  })
}

function del(req, res) {
  CameraType
  .remove(req.params.id)
  .then(function() {
    res.sendStatus(200);
  })
}

module.exports = {
  post: post,
  get: get,
  getById: getById,
  put: put,
  del: del
};