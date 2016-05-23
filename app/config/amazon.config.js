var INPUT_BUCKET,
  OUTPUT_BUCKET,
  PIPELINE_ID,
  ASSET_BUCKET;

switch(process.env.NODE_ENV || 'development') {
  case 'production':
    INPUT_BUCKET = 'airvuz-drone-video-input';
    OUTPUT_BUCKET = 'airvuz-drone-video';
    PIPELINE_ID   = '1455744809087-s0jcq3';
    ASSET_BUCKET  = 'airvuz-asset';
    break;
  default:
    // beta & development
    INPUT_BUCKET = 'airvuz-videos-beta-input';
    OUTPUT_BUCKET = 'airvuz-videos-beta';
    PIPELINE_ID   = '1452901546045-62g3bq';
    ASSET_BUCKET  = 'airvuz-asset-beta';
    break;
}

module.exports = {
  INPUT_BUCKET: INPUT_BUCKET,
  OUTPUT_BUCKET: OUTPUT_BUCKET,
  PIPELINE_ID: PIPELINE_ID,
  ASSET_BUCKET: ASSET_BUCKET,

  OUTPUT_URL: '//s3-us-west-2.amazonaws.com/' + OUTPUT_BUCKET + '/',
  INPUT_URL: '//s3-us-west-2.amazonaws.com/' + INPUT_BUCKET + '/',
  ASSET_URL: '//s3-us-west-2.amazonaws.com/' + ASSET_BUCKET + '/',

  // KEY are for beta
  ACCESS_KEY: process.env.AWS_ACCESS_KEY || 'AKIAIXDMGK4H4EX4BDOQ',
  SECRET_KEY: process.env.AWS_SECRET_KEY || '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',

  NUMBER_OF_THUMBNAIL: 6
};