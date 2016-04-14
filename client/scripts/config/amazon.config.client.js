var INPUT_BUCKET,
  OUTPUT_BUCKET;

switch(process.env.NODE_ENV || 'development') {
  case 'production':
    INPUT_BUCKET = 'airvuz-drone-video-input';
    OUTPUT_BUCKET = 'airvuz-drone-video';
    break;
  default:
    // beta & development
    INPUT_BUCKET = 'airvuz-videos-beta-input';
    OUTPUT_BUCKET = 'airvuz-videos-beta';
    break;
}

module.exports = {
  INPUT_BUCKET: INPUT_BUCKET,
  OUTPUT_BUCKET: OUTPUT_BUCKET,
  ACCESS_KEY: 'AKIAIXDMGK4H4EX4BDOQ'
};