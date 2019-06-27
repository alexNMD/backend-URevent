	const server = require('./server/server');
	const jwt = require('jsonwebtoken');
	const routes = require('./routes');
	const MongoClient = require('mongodb').MongoClient;

		MongoClient.connect(server.url, { useNewUrlParser: true }).then(function (client) {
			console.log('Connexion établie à MongoDB.');
			const database = client.db('urevent');
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

			// for testing
			let exportRoot = routes(server.app, database);
			module.exports = routes;

		}).catch(function (err) {
			console.log('Impossible de se connecter à MongoDB.');
			console.log(err);
		});
	function verifToken(req, res, next) {
		const excludePath = ['/api/users/register', '/api/users/login', '/api/test'];
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
