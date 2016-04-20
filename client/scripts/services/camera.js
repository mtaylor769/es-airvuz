var camera = {};

function getAll() {
  return $.ajax({
    url         : '/api/camera-type',
    type        : 'GET'
  });
}

/////////////////////////////////////////////

camera.getAll = getAll;

module.exports = camera;