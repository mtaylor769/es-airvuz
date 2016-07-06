var gm            = require('gm').subClass({imageMagick: true});

function resize(readStream, size) {
  var width = size,
      height = size;
  
  if (typeof size === 'object') {
    width = size.width;
    height = size.height;
  }
  
  return gm(readStream)
    .resize(width, height)
    .stream();
}

module.exports = {
  resize: resize
};