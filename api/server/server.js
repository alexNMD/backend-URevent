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
});

module.exports = { url, app };


