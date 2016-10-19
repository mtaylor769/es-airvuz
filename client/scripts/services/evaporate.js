var Evaporate = require('evaporate');
var AmazonConfig = require('../config/amazon.config.client');

function upload (params, bucket) {
  var evaporate = new Evaporate({
    signerUrl : '/api/amazon/sign-auth',
    aws_key   : AmazonConfig.ACCESS_KEY,
    bucket    : bucket === 'temp' ? AmazonConfig.TEMP_BUCKET : AmazonConfig.INPUT_BUCKET,
    aws_url   : 'https://s3-us-west-2.amazonaws.com',

    partSize  : 200 * 1024 * 1024,
    logging   : !IS_PRODUCTION
  });

  params.headersCommon = {
    'Cache-Control': 'max-age=604800' // 1 week
  };

  evaporate.add(params);
}

module.exports = {
  upload: upload
};