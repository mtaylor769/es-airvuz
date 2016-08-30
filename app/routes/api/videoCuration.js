var keywordCrud     = require('../../persistence/crud/keywords');
var videoCrud       = require('../../persistence/crud/videos');
var Promise         = require('bluebird');

function VideoCuration() {}

VideoCuration.prototype.rating = function(req, res) {
    var internalTags    = [];
    var rawInternalTags = req.body.internalTags;
    var videoId         = req.body.videoId;
    var internalRanking     = req.body.internalRanking;
    var initialVideo    = req.body.initialVideo;

    if(rawInternalTags) {
        return Promise.map(rawInternalTags, function(tag) {
            return keywordCrud.create(tag.text)
        })
            .then(function() {
                rawInternalTags.forEach(function(tag) {
                    internalTags.push(tag.text);
                });
                var queryObject = {};
                queryObject.id = videoId;
                queryObject.update = {};
                queryObject.update.internalTags = internalTags;
                queryObject.update.internalRanking = internalRanking;
                queryObject.update.curation = {};
                queryObject.update.curation.isRanked = true;
                queryObject.update.curation.isTagged = true;
                return videoCrud.videoCurationUpdate(queryObject)
            })
            .then(function() {
                return videoCrud.getNextVideoToRate()
            })
            .then(function(nextVideo) {
                res.json(nextVideo)
            })
    } else if(initialVideo) {
        return videoCrud.getNextVideoToRate()
            .then(function(nextVideo) {
                res.json(nextVideo)
            })
    } else {
        var queryObject = {};
        queryObject.id = video._id;
        queryObject.update = {};
        queryObject.update.internalRanking = internalRanking;
        queryObject.update.curation = {};
        queryObject.update.curation.isRanked = true;

        return videoCrud.videoCurationUpdate(queryObject)
            .then(function() {
                return videoCrud.getNextVideoToRate()
            })
            .then(function(nextVideo) {
                res.json(nextVideo)
            })
    }
};


module.exports = new VideoCuration();