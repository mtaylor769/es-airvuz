var VideoCrud = require('../../persistence/crud/videos');

function Video() {

}

Video.prototype.post = function(req, res) {
  VideoCrud
    .create(req.body)
    .then(function(video) {
      res.send(video);
    })
};

Video.prototype.get = function(req, res) {
  VideoCrud
    .getById(req.params.id)
    .then(function(video) {
      res.send(video);
    })
};

Video.prototype.put = function(req, res) {
  VideoCrud
    .update({id: req.body._id, update: req.body})
    .then(function(video) {
      res.send(video);
    })
};

Video.prototype.delete = function(req, res) {
  VideoCrud
    .remove(req.params.id)
    .then(function(video) {
      res.sendStatus(200);
    })
};

module.exports = new Video();

//change crud and videos