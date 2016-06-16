var gm = require('gm'),
  fs = require('fs'),
  request = require('request');

var stream = request('https://s3-us-west-2.amazonaws.com/airvuz-asset-beta/users/profile-pictures/18d5efd33f720f66e855c4cac02eb67a.png');

// var writeStream = fs.createWriteStream('./img.png');

gm(stream)
  .resize('50', '50')
  .write('resize.png', function (err) {
    if (err) {
      console.log('******************** err ********************');
      console.log(err);
      console.log('************************************************');
    }
  });
  // .pipe(writeStream);
