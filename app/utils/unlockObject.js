var unlockObject = function(object) {
  var objectString = JSON.stringify(object);
  var newObject = JSON.parse(objectString)
  return newObject;
};

module.exports = unlockObject;