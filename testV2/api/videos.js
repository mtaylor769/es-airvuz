var chai        = require('chai');
var chaiHttp    = require('chai-http');
var host        = 'http://' + (process.env.HOST || 'localhost');
var server      = host + ":" + (process.env.PORT || 80);
var expect      = require('chai').expect;

var token;
var userId = '56a7473c2defb658467acb6e';
var userNameDisplay = 'bryceb';

chai.use(chaiHttp);

describe('Video API tests', function () {
    before(function (done) {
        chai.request(server)
            .post('/api/auth')
            .send({emailAddress: 'bryce.blilie@airvuz.com', password: 'bryc3b'})
            .end(function (err, res) {
                token = "Bearer " + res.text;
                done();
            });
    });
    describe('Video tests no apiVer', function () {
        /**
         * Attempt to get data for a known user
         * prerequisites: userId exists, valid token
         */
        describe('Search using a valid video', function () {
            it('should return the json for a video', function (done) {
                chai.request(server)
                    .get('/api/videos/')
                    .end(function (err, res) {
                        var data = res.body;
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');

                        done();
                    });
            });
        });
    });
});