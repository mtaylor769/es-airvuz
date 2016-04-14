var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 *  SCHEMA DEFINITION
 */
var schema      = new Schema({
  // _id is hash of the file
  _id           : String,
  status        : String,
  message       : String,
  user          : {
                    type    : mongoose.Schema.ObjectId,
                    ref     : 'User'
                  },
  file          : Schema.Types.Mixed,
  userAgent     : String,
  date          : {
                    type    : Date,
                    default : Date.now
                  },
  processStart  : Date,
  processEnd    : Date
});

module.exports = {
  connectionName  : "main",
  modelName       : "Upload",
  schema          : schema
};