#!/usr/bin/env node
/**
 * Run at the root /AirVuz2
 * - sudo node scripts/resize-profile-picture.js
 * - NODE_ENV
 *
 */
console.log('******************** Resize profile picture ********************');

var Promise = require('bluebird'),
    AWS = require('aws-sdk'),
    _ = require('lodash'),
    request = require('request'),
    gm = require('gm'),
    fs = require('fs'),
    path = require('path');

AWS.config.region = 'us-west-2';
AWS.config.httpOptions = {timeout: 3600000}; // 60 min

var TMP_BUCKET = process.env.NODE_ENV === 'production' ? 'airvuz-asset' : 'airvuz-asset-beta',
    AMAZON_URL = 'https://s3-us-west-2.amazonaws.com/' + TMP_BUCKET + '/';

var awsOptions = {accessKeyId: 'AKIAIXDMGK4H4EX4BDOQ', secretAccessKey: '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'};

function getProfilePictures() {
  return new Promise(function (resolve, reject) {
    var storage = new AWS.S3(awsOptions);

    var params = {
      Bucket: TMP_BUCKET,
      Prefix: 'users/profile-pictures'
    };

    storage.listObjects(params, function (err, bucket) {
      if (!err) {
        var pictures = bucket.Contents.map(function (content) {
          return content.Key;
        });
        return resolve(pictures);
      }
      reject('Error getting profile picture');
    });
  });
}

function resizeImages(pictures) {
  return Promise.map(pictures, function (picture) {
    var readStream = request(AMAZON_URL + picture);
    var part = picture.split('/')[2].split('.');
    var pictureWithoutExt = part[0];
    var writeStream = fs.createWriteStream(path.resolve(__dirname, '../profile-picture') + '/' + pictureWithoutExt + '-50x50.' + part[1]);

    gm(readStream)
      .resize('50', '50')
      .stream()
      .pipe(writeStream);

    return picture;
  });
}

getProfilePictures()
  .then(resizeImages)
  .catch(function (err) {
    console.log('******************** err ********************');
    console.log(err);
    console.log('************************************************');
  });
