const expect = require('chai').expect;
const client = require('../api/api');
require('dotenv').config({ path: 'config/travis.env' });
const supertest = require("supertest");
var should = require("should");

const userToken = process.env.userToken;
const PORT = process.env.PORT;
let server = supertest.agent('http://localhost:' + PORT + '/api');
// FORCE QUIT NODE SERVER : "killall node"

describe('API test', () => {
    it('GET events', function(done) {
        // Test Get All Events with token
        server
            .get("/events")
            .set('Authorization', 'Bearer ' + userToken)
            .expect("Content-type",/json/)
            .expect(200) // This is HTTP response
            .end(function(err,res){
                // HTTP status should be 200
                res.status.should.equal(200);
                done();
            });
    });
    it('Ne doit pas retourner tous les événements (sans token)', function(done) {
        // Test Get All Events without token
        server
            .get("/events")
            .expect("Content-type",/json/)
            .expect(401) // This is HTTP response
            .end(function(err,res){
                // HTTP status should be 200
                res.status.should.equal(401);
                done();
            });
    });
    it('Doit afficher une page 404', function(done) {
        // Test default routing (404)
        server
            .get("/jenesiaspas")
            .set('Authorization', 'Bearer ' + userToken)
            .expect("Content-type",/json/)
            .expect(404) // This is HTTP response
            .end(function(err,res){
                // HTTP status should be 200
                res.status.should.equal(404);
                console.log(res.body);
                done();
            });
    });

});

// TODO : Faire plus de test (et surtout fonctionnels !!)
