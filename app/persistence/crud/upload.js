var log4js      = require('log4js');
var logger      = log4js.getLogger('persistance.crud.upload');
var UploadModel = null;

try {
  var database = require('../database/database');
  UploadModel = database.getModelByDotPath({modelDotPath: 'app.persistence.model.upload'});
}
catch(exception) {
  logger.error(' import error:' + exception);
}

/**
 * Upload
 * @constructor
 */
function Upload() {}

/**
 * Get a upload record by id
 * @param id
 * @returns {Promise}
 */
function getById(id) {
  return UploadModel.findById(id).exec();
}

/**
 * Update upload status state
 * @param id
 * @param status
 * @returns {Promise}
 */
function updateTranscodeStatus(id, status) {
  return UploadModel.findOneAndUpdate({_id: id}, {status: status}).exec();
}

/**
 * Update message usually for a warning
 * @param id
 * @param message
 * @returns {Promise}
 */
function updateMessageStatus(id, message) {
  return UploadModel.findOneAndUpdate({_id: id}, {message: message}).exec();
}

/**
 * Get video processing status
 * @param id
 * @returns {MPromise} - status state
 */
function getStatus(id) {
  return UploadModel.findOne({_id: id}).select('status').lean().exec()
    .then(function (upload) {
      return upload.status;
    });
}

/**
 * Create upload record to track status state
 * @param params
 * @returns {Promise}
 */
function createRecord(params) {
  return (new Upload(params)).save();
}

///////////////////////////////////////

Upload.prototype.getById                = getById;
Upload.prototype.updateTranscodeStatus  = updateTranscodeStatus;
Upload.prototype.updateMessageStatus    = updateMessageStatus;
Upload.prototype.getStatus              = getStatus;
Upload.prototype.createRecord          = createRecord;

module.exports = new Upload();