var curatedVideosCrud = require('../../persistence/crud/curatedVideos');

function CuratedVideos() {

}

CuratedVideos.prototype.post = function(req, res) {
  console.log('hitting');
  curatedVideosCrud
  .create(req.body)
  .then(function(curatedVideo) {
    res.send(curatedVideo);
  })
};

module.exports = new CuratedVideos();