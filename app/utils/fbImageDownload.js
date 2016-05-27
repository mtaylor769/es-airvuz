var urls       = require('url');
var log4js		= require('log4js');
var logger		= log4js.getLogger("util.errorMessage");
var fs        = require('fs');
var http      = require('http');
var path = require('path');

var getImage = function(imageObject, cb) {
  var port      = imageObject.port || 80;
  var url       = urls.parse(imageObject.url);
  
  //set storage folder url path
  var storeFolder = __dirname + '/../../testImage/something/fbImage.png';
  
  //create url options for http get
  var options = {
    host: url.hostname,
    port: port,
    path: url.pathname
  };
  
  //request to get provided URL
  http.get(options, function(response) {
    var redirectUrl = urls.parse(response.headers.location);
    console.log(response.headers);
    logger.debug(redirectUrl)
    // var redirectOptions = {
    //   host: redirectUrl.hostname,
    //   port: port,
    //   path: redirectUrl.path
    // };
    //
    // //request to get redirected URL
    // http.get(redirectOptions, function(response) {
    //  
    //   logger.debug(redirectUrl);
    //   //set encoding
    //   response.setEncoding('binary');
    //  
    //   //set image to empty
    //   var image = '';
    //  
    //   //when response received set data to image
    //   response.on('data', function(chunck) {
    //     image += chunck;
    //   });
    //  
    //   //when done recieving image store in specified directory
    //   response.on('end', function() {
    //     logger.debug(image);
    //     fs.writeFile(storeFolder, image, 'binary', cb);
    //   });
    // }).on('error', function(error) {
    //   logger.debug(error)
    // })
  })
};


module.exports = getImage;