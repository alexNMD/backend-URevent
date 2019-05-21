// Dépendances 
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// if testMod is true, then is a test. Else is a production
const testMod = process.env.PORT || true;
const PORT = process.env.PORT || 8080;
// MongoDB connection
if (testMod) {
	// TEST
	var url = 'mongodb://localhost:27017';
	app.listen(PORT, function () {
		console.log('API test lancée !');
	});
} else {
	// PRODUCTION
	username = 'apiUser1';
	password = 'Azertyuiop1';
	var url = 'mongodb+srv://'+ username +':'+ password +'@urevent-bqouq.mongodb.net/test?retryWrites=true';
	// serveur de production
	app.listen(PORT, function () {
		console.log('API production lancée !');
	});
}
module.exports = { url, app };


