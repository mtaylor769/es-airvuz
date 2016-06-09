var mongoose      = require('mongoose');

var schema        = mongoose.Schema({
  firstName           : String,
  lastName            : String,
  emailAddress        : String,
  isUnder18           : Boolean,
  isUnder18agreement  : Boolean,
  type                : String,
  submitDate          : {
                          type: Date,
                          default: Date.now
                        }
});

module.exports = {
  connectionName  : 'main',
  modelName       : 'Forms',
  schema          : schema
};

