var request = require('request');
require('dotenv').config();

const apiK = process.env.GOOGLE_APIK;

urlTest = 'https://maps.googleapis.com/maps/api/geocode/json?address=32+quai+d’Austerlitz,+75013,+Paris,+France&key=AIzaSyDKAYgVkJUMbQJ6KzkQWuXfgntS-vRGtjc';


var geocoding = function(address, callback) {
	let location;
	address = address.replace(/[^a-zA-Z0-9]/g,'+');
	var apiUrl = "https://maps.googleapis.com/maps/api/geocode/json?address="+ address +"&key="+ apiK;
	request({url: apiUrl}, function (error, response, body) {
		body = JSON.parse(body);
		if (response.statusCode == 200 && body.status == 'OK') {
		   	location = body.results[0].geometry.location;
		} 
		else if (response.statusCode == 200 && body.status == 'ZERO_RESULTS') {
		   	location = 'Impossible de géo localiser';
		} else {
			location = 'Problème de géo localisation'
		}
		return callback(location);
	});
}

module.exports = geocoding;