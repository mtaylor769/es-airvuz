var INPUT_BUCKET,
  OUTPUT_BUCKET,
  ASSET_BUCKET,
  CDN_URL = '';

if (IS_PRODUCTION) {
  INPUT_BUCKET = 'airvuz-drone-video-input';
  OUTPUT_BUCKET = 'airvuz-drone-video';
  ASSET_BUCKET = 'airvuz-asset';
  CDN_URL      = '//d32znywta9rkav.cloudfront.net';
} else {
  INPUT_BUCKET = 'airvuz-videos-beta-input';
  OUTPUT_BUCKET = 'airvuz-videos-beta';
  ASSET_BUCKET = 'airvuz-asset-beta';
  if (IS_BETA) {
    CDN_URL = '//d6xm2cm58wj2l.cloudfront.net';
  }
}

module.exports = {
  INPUT_BUCKET    : INPUT_BUCKET,
  OUTPUT_BUCKET   : OUTPUT_BUCKET,
  ASSET_BUCKET    : ASSET_BUCKET,
  TEMP_BUCKET     : 'airvuz-tmp',
  OUTPUT_URL      : '//s3-us-west-2.amazonaws.com/' + OUTPUT_BUCKET + '/',
  INPUT_URL       : '//s3-us-west-2.amazonaws.com/' + INPUT_BUCKET + '/',
  ASSET_URL       : '//s3-us-west-2.amazonaws.com/' + ASSET_BUCKET + '/',
  CDN_URL         : CDN_URL,
  ACCESS_KEY      : 'AKIAIXDMGK4H4EX4BDOQ'
};