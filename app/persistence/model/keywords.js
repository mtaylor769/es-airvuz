var mongoose = require('mongoose');

var keywordSchema = mongoose.Schema({
    keyword: {
        required: true,
        type: String,
        unique: true
    }
});

module.exports = {
    connectionName  : 'main',
    modelName       : 'Keyword',
    schema          : keywordSchema
};