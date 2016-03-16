var express = require('express');
var videoRouter = express.Router();
var Videos = require('../../persistence/crud/videos');

videoRouter.post('/', function(req, res) {
  Videos.create(req.body)
  .then(function(video) {
    res.send(video)
  })
});

videoRouter.get('/', function(req, res) {
  Videos.getById(req.body._id)
  .then(function(video) {
    res.send(video)
  })
});

videoRouter.put('/:id', function(req, res) {
  console.log('hitting route')
  Videos.update({id: req.body._id, update: req.body})
  .then(function(video) {
    console.log(video);
    res.json(video);
  })
});

exports.router = videoRouter;