const expect = require('chai').expect;
const routes = require('../api/api');
const supertest = require("supertest");
var should = require("should");

const userToken = process.env.userToken;
const PORT = process.env.PORT;
let url = 'http://localhost:' + PORT + '/api';
let server = supertest.agent(url);

// FORCE QUIT NODE SERVER : "killall node"

describe('API test', () => {
    it('Doit retourner tous les événements (avec token)', function(done) {
        // Test Get All Events
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
        // Test Get All Events
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
        // Test Get All Events
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
