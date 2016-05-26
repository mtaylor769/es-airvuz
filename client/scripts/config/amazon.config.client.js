var INPUT_BUCKET,
  OUTPUT_BUCKET,
  ASSET_BUCKET;

switch(window.location.host) {
  case '54.213.44.149': // prod2
  case 'airvuz.com':
  case 'www.airvuz.com':
    INPUT_BUCKET = 'airvuz-drone-video-input';
    OUTPUT_BUCKET = 'airvuz-drone-video';
    ASSET_BUCKET = 'airvuz-asset';
    break;
  default:
    INPUT_BUCKET = 'airvuz-videos-beta-input';
    OUTPUT_BUCKET = 'airvuz-videos-beta';
    ASSET_BUCKET = 'airvuz-asset-beta';
}

module.exports = {
  INPUT_BUCKET    : INPUT_BUCKET,
  OUTPUT_BUCKET   : OUTPUT_BUCKET,
  ASSET_BUCKET    : ASSET_BUCKET,
  TEMP_BUCKET     : 'airvuz-tmp',
  OUTPUT_URL      : '//s3-us-west-2.amazonaws.com/' + OUTPUT_BUCKET + '/',
  INPUT_URL       : '//s3-us-west-2.amazonaws.com/' + INPUT_BUCKET + '/',
  ASSET_URL       : '//s3-us-west-2.amazonaws.com/' + ASSET_BUCKET + '/',

  ACCESS_KEY      : 'AKIAIXDMGK4H4EX4BDOQ'
};