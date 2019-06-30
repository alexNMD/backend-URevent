// Dépendances
require('dotenv').config({ path: 'config/local.env' });
const routes = require('../routes');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


const PORT = process.env.PORT;
const url = process.env.DB_URL;
const devStatus = process.env.NODE_ENV;


// Server connexion
app.listen(PORT, function () {
	console.log('Server ON ! || PORT: ' + PORT);
	console.log('Status: ' + devStatus);
	app.use(function (req, res, next) {
		// Website you wish to allow to connect
		res.setHeader('Access-Control-Allow-Origin', '*');
		// Request methods you wish to allow
		res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
		// Request headers you wish to allow
		res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
		// Set to true if you need the website to include cookies in the requests sent
		// to the API (e.g. in case you use sessions)
		res.setHeader('Access-Control-Allow-Credentials', true);
		// Pass to next layer of middleware
		next();
	});
});

module.exports = { url, app };


