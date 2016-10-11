var chai = require('chai');
var chaiHttp = require('chai-http');
var server  = 'http://localhost';
var expect = require('chai').expect;

chai.use(chaiHttp);

describe('Auth', function() {

    describe('Authorize with no apiVer', function () {
        it('should return a token', function (done) {
            var token;
            chai.request(server)
                .post('/api/auth')
                .send({emailAddress: 'bryce.blilie@airvuz.com', password: 'bryc3b'})
                .end(function (err, res) {
                    expect(res).to.have.status(200);
                    expect(res).to.have.header('content-type', 'text/html; charset=utf-8');
                    expect(res).to.be.html;
                    done();
                });
        });
    });
    describe('Authorize with an invalid apiVer', function () {
        it('should return a 400', function (done) {
            var token;
            chai.request(server)
                .post('/api/auth?apiVer=1.0.1')
                .send({emailAddress: 'bryce.blilie@airvuz.com', password: 'bryc3b'})
                .end(function (err, res) {
                    expect(res).to.have.status(400);
                    done();
                });
        });
    });
    describe('Authorize with valid apiVer', function () {
        it('should return a token', function (done) {
            var token;
            chai.request(server)
                .post('/api/auth?apiVer=1.0.0')
                .send({emailAddress: 'bryce.blilie@airvuz.com', password: 'bryc3b'})
                .end(function (err, res) {
                    expect(res).to.have.status(200);
                    expect(res).to.have.header('content-type', 'text/html; charset=utf-8');
                    expect(res).to.be.html;
                    done();
                });
        });
    });
    describe('Authorize with valid apiVer but wrong password', function () {
        it('should return a 400 unauthorized', function (done) {
            var token;
            chai.request(server)
                .post('/api/auth?apiVer=1.0.0')
                .send({emailAddress: 'bryce.blilie@airvuz.com', password: 'xxx'})
                .end(function (err, res) {
                    expect(res).to.have.status(400);
                    done();
                });
        });
    });
    describe('Authorize with valid apiVer but wrong username', function () {
        it('should return a 400 unauthorized', function (done) {
            var token;
            chai.request(server)
                .post('/api/auth?apiVer=1.0.0')
                .send({emailAddress: 'prettysurethiswillfail@prettysurethiswillfailyyy.net', password: 'xxx'})
                .end(function (err, res) {
                    expect(res).to.have.status(400);
                    done();
                });
        });
    });
    describe('Unauthorized access attempt', function () {
        describe('POST /api/notifications/seen', function(){
            it('should return 401 Unauthorize status', function (done) {
                chai.request(server)
                    .post('/api/notifications/seen')
                    .end(function (err, res) {
                        expect(res).to.have.status(401);
                        done();
                    });
            });
        });
    });
});