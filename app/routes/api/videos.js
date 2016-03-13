var express = require('express');
var videoRouter = express.Router();
var Videos = require('../../persistence/crud/videos');

videoRouter.post('/', function(req, res) {
  Videos.get();
});

exports.router = videoRouter;