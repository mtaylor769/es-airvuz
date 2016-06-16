var gm            = require('gm').subClass({imageMagick: true});

function resize(readStream, size) {
  return gm(readStream)
    .resize(size, size)
    .stream();
}

module.exports = {
  resize: resize
};