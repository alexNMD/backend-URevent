// Dépendances 
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// if testMod is true, then is a test. Else is a production
const testMod = true

// MongoDB connection
if (testMod) {
	// TEST
	var url = 'mongodb://localhost:27017';
	app.listen(8080, function () {
		console.log('API test lancée !');
	});
} else {
	// PRODUCTION
	var url = 'mongodb://mongodb-alexnmd.alwaysdata.net';
	// serveur de production
	app.listen(process.env.ALWAYSDATA_HTTPD_PORT, process.env.ALWAYSDATA_HTTPD_IP, function () {
		console.log('API production lancée !');
	});
}
module.exports = { url, app };
