var Videos = require('../../persistence/crud/videos');

function get(req, res) {
  Videos
    .getById(req.params.id)
    .then(function(video) {
      res.send(video)
    })
}

function post(req, res) {
  Videos
    .create(req.body)
    .then(function(video) {
      res.send(video)
    })
}

function put(req, res) {
  Videos
    .update({id: req.body._id, update: req.body})
    .then(function(video) {
      res.send(video);
    })
}

function del(req, res){
  Videos
    .remove(req.params.id)
    .then(function(video) {
      res.sendStatus(200);
    })
}

module.exports = {
  get: get,
  post: post,
  put: put,
  del: del
};