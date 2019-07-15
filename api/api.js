	const server = require('./server/server');
	const jwt = require('jsonwebtoken');
	const routes = require('./routes');
	const MongoClient = require('mongodb').MongoClient;

		MongoClient.connect(server.url, { useNewUrlParser: true }).then(function (client) {
			console.log('Connexion établie à MongoDB.');
			const database = client.db('urevent');

			// SANS TOKEN AUTHORIZATION
			server.app.use(verifToken, function (req, res, next) {
				if (req.token === 'excludePath') {
					next();
				} else {
					jwt.verify(req.token, 'userKey', (err, auth) => {
						if (err) {
							jwt.verify(req.token, 'adminKey', (err, auth) => {
								if (err) {
									res.status(401).send({
										message: 'Veuillez vous connecter !!!'
									})
								} else {
									next();
								}
							})
						} else {
							next();
						}
					});
				}
			});
			routes(server.app, database);
			console.log('API lancée !');
		}).catch(function (err) {
			console.log('Impossible de se connecter à MongoDB.');
			console.log(err);
		});

	function verifToken(req, res, next) {
		const excludePath = [
			'/api/users/register',
			'/api/users/login',
			'/api/test',
			'/api-docs/',
			'/api-docs/swagger-ui.css',
			'/api-docs/swagger-ui-bundle.js',
			'/api-docs/swagger-ui-standalone-preset.js',
			'/api-docs/swagger-ui-init.js',
			'/scrapper',
			'/scrapper/launch'
		];
		if (excludePath.indexOf(req.path) !== -1) {
			req.token = 'excludePath';
			next();
		}
		else {
			const bearerHeader = req.headers['authorization'];
			if (typeof bearerHeader !== 'undefined') {
				const bearer = bearerHeader.split(' ');
				const bearerToken = bearer[1];
				req.token = bearerToken;
				next();
			} else {
				res.status(401).send({
					message: 'Veuillez vous connecter !'
				});
			}
		}
	}

	module.exports = server.app;
