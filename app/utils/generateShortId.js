var shortId = require('shortid');

function generateShortId() {}

function generate() {
    return shortId.generate();
}

generateShortId.prototype.generate = generate;

module.exports = new generateShortId();