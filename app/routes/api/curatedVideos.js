var curatedVideosCrud = require('../../persistence/crud/curatedVideos');

function CuratedVideos() {

}

CuratedVideos.prototype.post = function(req, res) {
  curatedVideosCrud
  .create(req.body)
  .then(function(curatedVideo) {
    res.send(curatedVideo);
  })
};

CuratedVideos.prototype.get = function(req, res) {
  curatedVideosCrud
  .get(req.body.type)
  .then(function(curatedVideos) {
    res.send(curatedVideos);
  })
};

CuratedVideos.prototype.getById = function(req, res) {
  curatedVideosCrud
  .getById(req.params.id)
  .then(function(curatedVideo) {
    res.send(curatedVideo);
  })
};

CuratedVideos.prototype.put = function(req, res) {
  curatedVideosCrud
  .update({id: req.body._id, update: req.body})
  .then(function(curatedVideo) {
    res.send(curatedVideo);
  })
};

CuratedVideos.prototype.delete = function(req, res) {
  curatedVideosCrud
  .remove(req.params.id)
  .then(function(curatedVideo) {
    res.send(curatedVideo);
  })
};

module.exports = new CuratedVideos();