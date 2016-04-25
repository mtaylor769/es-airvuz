var VideoCrud = require('../../persistence/crud/videos');

function Video() {

}

Video.prototype.post = function(req, res) {
  VideoCrud
    .create(req.body)
    .then(function(video) {
      res.json(video);
    })
    .catch(function (err) {
      res.sendStatus(500);
    });
};

Video.prototype.get = function(req, res) {
  VideoCrud
    .getById(req.params.id)
    .then(function(video) {
      res.send(video);
    })
    .catch(function (err) {
      res.sendStatus(500);
    });
};

Video.prototype.put = function(req, res) {
  VideoCrud
    .update({id: req.body._id, update: req.body})
    .then(function(video) {
      res.send(video);
    })
    .catch(function (err) {
      res.sendStatus(500);
    });
};

Video.prototype.delete = function(req, res) {
  VideoCrud
    .remove(req.params.id)
    .then(function(video) {
      res.sendStatus(200);
    })
    .catch(function (err) {
      res.sendStatus(500);
    });
};

Video.prototype.like = function(req, res) {
  VideoCrud
    .getById(req.body.id)
    .then(function(video) {
      VideoCrud
        .like(video, req.body.like)
        .then(function(comment) {
          res.sendStatus(200);
        })
        .catch(function (err) {
          res.sendStatus(500);
        });
    })
    .catch(function (err) {
      res.sendStatus(500);
    });
};

module.exports = new Video();

//change crud and videos