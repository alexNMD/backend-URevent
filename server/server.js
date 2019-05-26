// Dépendances
require('dotenv').config();
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


const PORT = process.env.PORT;
const url = process.env.DB_URL;
const devStatus = process.env.NODE_ENV;

// MongoDB connection
app.listen(PORT, function () {
	console.log('API lancée ! || PORT: ' + PORT);
	console.log('Status: ' + devStatus);
})

// if (testMod) {
// 	// TEST
// 	var url = 'mongodb://localhost:27017';
// 	app.listen(PORT, function () {
// 		console.log('API test lancée !');
// 	});
// } else {
// 	// PRODUCTION
// 	username = 'apiUser1';
// 	password = 'Azertyuiop1';
// 	var url = 'mongodb+srv://'+ username +':'+ password +'@urevent-bqouq.mongodb.net/test?retryWrites=true';
// 	// serveur de production
// 	app.listen(PORT, function () {
// 		console.log('API production lancée !');
// 	});
// }

module.exports = { url, app };


