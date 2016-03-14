/**
 * Run with:
 * mocha test/api/
 * node_modules/mocha/bin/mocha test/api
 *
 */
/* global expect: true */
var request = require('supertest'),
    app = require('../../app'),
    expect = require('chai').expect;

request = request(app);

describe('Auth', function() {
    var API_URL = '/api/auth/token';


    describe('Authorize', function () {
        var token;
        before(function (done) {
            request.post(API_URL)
                .send({email: 'doua@airvuz.com', password: '123123'})
                .expect(200)
                .expect(function (res) {
                    token = res.body.token;
                })
                .end(done);
        });
        describe('GET ' + API_URL, function(){
            it('should return the user information', function (done) {
                request.get(API_URL)
                    .set('authorization', 'Bearer ' + token)
                    .end(function (err, res) {
                        var data = res.body;

                        expect(data).to.have.property('_id');
                        expect(data).to.have.property('name');
                        expect(data).to.have.property('iat');
                        expect(data).to.have.property('exp');
                        expect(data).to.have.property('roles');

                        done();
                    });
            });
        });
    });
    describe('Unauthorize', function () {
        describe('GET ' + API_URL, function(){
            it('should return 401 Unauthorize status', function (done) {
                request.get(API_URL).expect(401).end(done);
            });
        });
    });
});