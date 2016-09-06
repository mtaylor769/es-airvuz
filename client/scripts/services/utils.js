var utils = {};

/**
 * check if the file is image
 * @param file {File}
 */
function isImage(file) {
  var type = ['image/jpeg', /*'image/png',*/ 'image/gif'];

  return type.indexOf(file.type) > -1;
}

/////////////////////////////////////////////

utils.isImage = isImage;

module.exports = utils;