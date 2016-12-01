var chai        = require('chai');
var chaiHttp    = require('chai-http');
var host        = 'http://' + (process.env.HOST || 'localhost');
var server      = host + ":" + (process.env.PORT || 80);
var expect      = require('chai').expect;

var token;
var userId;
var videoId =  '5796685c9069ac690de4ba41';
var userNameDisplay = 'bryceb';
var parentCommentId;
var comment;
var replyComment;
var updatedComment;

function makeComment()
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 15; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

chai.use(chaiHttp);

describe('Comment API Tests', function() {
    before(function (done) {
        /**
         * Obtain a valid token using local login, then get the userid by searching
         */
        describe('get a token', function() {
            chai.request(server)
                .post('/api/auth')
                .send({emailAddress: 'bryce.blilie@airvuz.com', password: 'bryc3b'})
                .then(function (res) {
                    return token = "Bearer " + res.text;
                })
                .then(function(token) {
                    chai.request(server)
                        .et('/api/users?username=' + userNameDisplay)
                        .set('Authorization', token)
                        .end(function(err, res){
                            userId = res.body._id;
                            done();
                        });
                });
        });
    });
    describe('Comment API tests no apiVer', function() {
        var apiVer = 'apiVer=';
        comment = makeComment();
        describe('Post a comment with no parent comment', function () {
            it('should post a comment and return json with posted comment data', function (done) {
                chai.request(server)
                    .post('/api/comment/?' + apiVer)
                    .set('Authorization', token)
                    .set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
                    // TODO Send JSON instead of JSON in a string
                    .send({data: '{' +
                    '"comment": {' +
                    '"videoId":"' + videoId + '",' +
                    '"comment":"' + comment + '",' +
                    '"userId":"' + userId + '"' +
                    '},' +
                    '"notification": {' +
                    '"notificationType":"COMMENT",' +
                    '"notifiedUserId":"57b248b28f6b2e883860fd6f",' +
                    '"notificationMessage":"test",' +
                    '"videoId":"'+ videoId +'",' +
                    '"actionUserId":"57e96ae61ef82b3db949d2a8"' +
                    '}' +
                    '}'
                    })
                    .end(function (err, res) {
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        expect(res.body).to.have.property('_id');
                        expect(res.body).to.have.property('comment', comment);
                        parentCommentId = res.body._id;
                        done();
                    });
            });
        });
        describe('Update a comment with no parent comment', function () {
            updatedComment = 'updated ' + makeComment();
            it('should update a comment and return json with posted comment data', function (done) {
                chai.request(server)
                    .put('/api/comment/' + parentCommentId + '/?' + apiVer)
                    .set('Authorization', token)
                    .set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
                    .send({ comment: updatedComment})
                    .end(function (err, res) {
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        expect(res.body).to.have.property('_id');
                        expect(res.body).to.have.property('comment', updatedComment);
                        done();
                    });
            });
        });
        describe('Get the comment just posted', function(){
            it('should find the comment just posted', function(done) {
                chai.request(server)
                    .get('/api/comment/byVideo/?videoId=' + videoId + '&' + apiVer)
                    .end(function (err, res) {
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        expect(res.body[0]).to.have.property('comment', updatedComment);
                        done();
                    });
            });
        });
        describe('Post a reply to a comment', function() {
            replyComment = makeComment();
            it('should post a reply to a comment', function(done) {
                chai.request(server)
                    .post('/api/comment/?' + apiVer)
                    .set('Authorization', token)
                    .set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
                    .send({data: '{' +
                    '"comment": {' +
                    '"videoId":"' + videoId + '",' +
                    '"comment":"' + replyComment + '",' +
                    '"parentCommentId":"'+ parentCommentId + '",' +
                    '"userId":"' + userId + '"' +
                    '},"notification": {' +
                    '"notificationType":"COMMENT",' +
                    '"notifiedUserId":"57b248b28f6b2e883860fd6f",' +
                    '"notificationMessage":"test",' +
                    '"videoId":"'+ videoId +'",' +
                    '"actionUserId":"57e96ae61ef82b3db949d2a8"' +
                    '}' +
                    '}'
                    })
                    .end(function (err, res) {
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        expect(res.body).to.have.property('_id');
                        expect(res.body).to.have.property('comment', replyComment);
                        done();
                    });
            });
        });
        describe('Get the reply comment', function() {
            it('should find the reply comment', function(done) {
                chai.request(server)
                    .get('/api/comment/byParent/?parentId=' + parentCommentId + '&' + apiVer)
                    .end(function (err, res) {
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        expect(res.body[0]).to.have.property('comment', replyComment);
                        done();
                    });
            });
        });
        // Doesnt appear to be a way to do this on the site
        describe('Report a comment', function() {
            it('should send an email about the comment', function(done) {
                chai.request(server)
                    .post('/api/comment/report/?' + apiVer)
                    .set('Authorization', token)
                    .set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
                    .send({ commentId: parentCommentId})
                    .end(function(err, res) {
                        var data = res.text;
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'text/plain; charset=utf-8');
                        expect(data).to.equal("OK");
                        done();
                    });
            });
        });
        describe('Delete an updated comment with no parent comment', function () {
            it('should delete the updated comment', function (done) {
                chai.request(server)
                    .delete('/api/comment/' + parentCommentId + '/?' + apiVer)
                    .set('Authorization', token)
                    .set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
                    .send({ comment: updatedComment})
                    .end(function (err, res) {
                        var data = res.text;
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'text/plain; charset=utf-8');
                        expect(data).to.equal("OK");
                        done();
                    });
            });
        });
        describe('Try to find comment just deleted', function() {
            it('should fail to find the updated comment', function(done) {
                chai.request(server)
                    .get('/api/comment/' + parentCommentId + '/?' + apiVer)
                    .end(function (err, res) {
                        expect(res).to.have.status(200);
                        expect(res.text).to.equal("");
                        done();
                    });
            });
        });
    });

    describe('Comment API tests apiVer 1.0.0', function() {
        var apiVer = 'apiVer=1.0.0';
        comment = makeComment();
        describe('Post a comment with no parent comment', function () {
            it('should post a comment and return json with posted comment data', function (done) {
                chai.request(server)
                    .post('/api/comment/?' + apiVer)
                    .set('Authorization', token)
                    .set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
                    .send({data: '{"comment":{"videoId":"' + videoId + '","comment":"' + comment + '","userId":"' + userId + '"},"notification":{"notificationType":"COMMENT","notifiedUserId":"57b248b28f6b2e883860fd6f","notificationMessage":"test","videoId":"'+ videoId +'","actionUserId":"57e96ae61ef82b3db949d2a8"}}'})
                    .end(function (err, res) {
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        expect(res.body).to.have.property('_id');
                        expect(res.body).to.have.property('comment', comment);
                        parentCommentId = res.body._id;
                        done();
                    });
            });
        });
        describe('Update a comment with no parent comment', function () {
            updatedComment = 'updated ' + makeComment();
            it('should update a comment and return json with posted comment data', function (done) {
                chai.request(server)
                    .put('/api/comment/' + parentCommentId + '/?' + apiVer)
                    .set('Authorization', token)
                    .set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
                    .send({ comment: updatedComment})
                    .end(function (err, res) {
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        expect(res.body).to.have.property('_id');
                        expect(res.body).to.have.property('comment', updatedComment);
                        done();
                    });
            });
        });
        describe('Get the comment just posted', function(){
            it('should find the comment just posted', function(done) {
                chai.request(server)
                    .get('/api/comment/byVideo/?videoId=' + videoId + '&' + apiVer)
                    .end(function (err, res) {
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        expect(res.body[0]).to.have.property('comment', updatedComment);
                        done();
                    });
            });
        });
        describe('Post a reply to a comment', function() {
            replyComment = makeComment();
            it('should post a reply to a comment', function(done) {
                chai.request(server)
                    .post('/api/comment/?' + apiVer)
                    .set('Authorization', token)
                    .set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
                    .send({data: '{"comment":{"videoId":"' + videoId + '","comment":"' + replyComment + '","parentCommentId":"'+ parentCommentId + '","userId":"' + userId + '"},"notification":{"notificationType":"COMMENT","notifiedUserId":"57b248b28f6b2e883860fd6f","notificationMessage":"test","videoId":"'+ videoId +'","actionUserId":"57e96ae61ef82b3db949d2a8"}}'})
                    .end(function (err, res) {
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        expect(res.body).to.have.property('_id');
                        expect(res.body).to.have.property('comment', replyComment);
                        done();
                    });
            });
        });
        describe('Get the reply comment', function() {
            it('should find the reply comment', function(done) {
                chai.request(server)
                    .get('/api/comment/byParent/?parentId=' + parentCommentId + '&' + apiVer)
                    .end(function (err, res) {
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        expect(res.body[0]).to.have.property('comment', replyComment);
                        done();
                    });
            });
        });
        // Doesnt appear to be a way to do this on the site
        describe('Report a comment', function() {
            it('should send an email about the comment', function(done) {
                chai.request(server)
                    .post('/api/comment/report/?' + apiVer)
                    .set('Authorization', token)
                    .set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
                    .send({ commentId: parentCommentId})
                    .end(function(err, res) {
                        var data = res.text;
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'text/plain; charset=utf-8');
                        expect(data).to.equal("OK");
                        done();
                    });
            });
        });
        describe('Delete an updated comment with no parent comment', function () {
            it('should delete the updated comment', function (done) {
                chai.request(server)
                    .delete('/api/comment/' + parentCommentId + '/?' + apiVer)
                    .set('Authorization', token)
                    .set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
                    .send({ comment: updatedComment})
                    .end(function (err, res) {
                        var data = res.text;
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'text/plain; charset=utf-8');
                        expect(data).to.equal("OK");
                        done();
                    });
            });
        });
        describe('Try to find comment just deleted', function() {
            it('should fail to find the updated comment', function(done) {
                chai.request(server)
                    .get('/api/comment/' + parentCommentId + '/?' + apiVer)
                    .end(function (err, res) {
                        expect(res).to.have.status(200);
                        expect(res.text).to.equal("");
                        done();
                    });
            });
        });
    });
    describe('Comment API tests apiVer 2.0.0', function() {
        var apiVer = 'apiVer=2.0.0';
        comment = makeComment();
        describe('Post a comment with no parent comment', function () {
            it('should return a 400 and invalid api version json', function (done) {
                chai.request(server)
                    .post('/api/comment/?' + apiVer)
                    .set('Authorization', token)
                    .set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
                    .send({data: '{"comment":{"videoId":"' + videoId + '","comment":"' + comment + '","userId":"' + userId + '"},"notification":{"notificationType":"COMMENT","notifiedUserId":"57b248b28f6b2e883860fd6f","notificationMessage":"test","videoId":"'+ videoId +'","actionUserId":"57e96ae61ef82b3db949d2a8"}}'})
                    .end(function (err, res) {
                        expect(res).to.have.status(400);
                        expect(res.body).to.have.property("error", "invalid api version")
                        done();
                    });
            });
        });
        describe('Update a comment with no parent comment', function () {
            updatedComment = 'updated ' + makeComment();
            it('should return a 400 and invalid api version json', function (done) {
                chai.request(server)
                    .put('/api/comment/' + parentCommentId + '/?' + apiVer)
                    .set('Authorization', token)
                    .set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
                    .send({ comment: updatedComment})
                    .end(function (err, res) {
                        expect(res).to.have.status(400);
                        expect(res.body).to.have.property("error", "invalid api version")
                        done();
                    });
            });
        });
        describe('Get the comment just posted', function(){
            it('should return a 400 and invalid api version json', function(done) {
                chai.request(server)
                    .get('/api/comment/byVideo/?videoId=' + videoId + '&' + apiVer)
                    .end(function (err, res) {
                        expect(res).to.have.status(400);
                        expect(res.body).to.have.property("error", "invalid api version")
                        done();
                    });
            });
        });
        describe('Post a reply to a comment', function() {
            replyComment = makeComment();
            it('should return a 400 and invalid api version json', function(done) {
                chai.request(server)
                    .post('/api/comment/?' + apiVer)
                    .set('Authorization', token)
                    .set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
                    .send({data: '{"comment":{"videoId":"' + videoId + '","comment":"' + replyComment + '","parentCommentId":"'+ parentCommentId + '","userId":"' + userId + '"},"notification":{"notificationType":"COMMENT","notifiedUserId":"57b248b28f6b2e883860fd6f","notificationMessage":"test","videoId":"'+ videoId +'","actionUserId":"57e96ae61ef82b3db949d2a8"}}'})
                    .end(function (err, res) {
                        expect(res).to.have.status(400);
                        expect(res.body).to.have.property("error", "invalid api version")
                        done();
                    });
            });
        });
        describe('Get the reply comment', function() {
            it('should return a 400 and invalid api version json', function(done) {
                chai.request(server)
                    .get('/api/comment/byParent/?parentId=' + parentCommentId + '&' + apiVer)
                    .end(function (err, res) {
                        expect(res).to.have.status(400);
                        expect(res.body).to.have.property("error", "invalid api version")
                        done();
                    });
            });
        });
        // Doesnt appear to be a way to do this on the site
        describe('Report a comment', function() {
            it('should return a 400 and invalid api version json', function(done) {
                chai.request(server)
                    .post('/api/comment/report/?' + apiVer)
                    .set('Authorization', token)
                    .set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
                    .send({ commentId: parentCommentId})
                    .end(function (err, res) {
                        expect(res).to.have.status(400);
                        expect(res.body).to.have.property("error", "invalid api version")
                        done();
                    });
            });
        });
        describe('Delete an updated comment with no parent comment', function () {
            it('should return a 400 and invalid api version json', function (done) {
                chai.request(server)
                    .delete('/api/comment/' + parentCommentId + '/?' + apiVer)
                    .set('Authorization', token)
                    .set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
                    .send({ comment: updatedComment})
                    .end(function (err, res) {
                        expect(res).to.have.status(400);
                        expect(res.body).to.have.property("error", "invalid api version")
                        done();
                    });
            });
        });
        describe('try to find comment just deleted', function() {
            it('should return a 400 and invalid api version json', function(done) {
                chai.request(server)
                    .get('/api/comment/' + parentCommentId + '/?' + apiVer)
                    .end(function (err, res) {
                        expect(res).to.have.status(400);
                        expect(res.body).to.have.property("error", "invalid api version")
                        done();
                    });
            });
        });
    });
});