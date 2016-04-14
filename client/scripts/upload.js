var Evaporate = require('evaporate'),
    AmazonConfig = require('./config/amazon.config.client');

var evaporate = new Evaporate({
  signerUrl: '/api/amazon/sign-auth',
  aws_key: AmazonConfig.ACCESS_KEY,
  bucket: AmazonConfig.INPUT_BUCKET,
  aws_url: 'https://s3-us-west-2.amazonaws.com'
});

function initialize() {
  /********************************************************/
  console.group('%cinit :', 'color:red;font:strait');
  //console.log(init);
  console.groupEnd();
  /********************************************************/
  $('')
}

module.exports = {
  initialize: initialize
};