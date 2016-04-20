var drone = {};

function getAll() {
  return $.ajax({
    url         : '/api/drone-type',
    type        : 'GET'
  });
}

/////////////////////////////////////////////

drone.getAll = getAll;

module.exports = drone;