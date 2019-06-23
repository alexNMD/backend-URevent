	var ObjectId = require('mongodb').ObjectID;
	const mongo = require('mongodb').MongoClient;
	const bcrypt = require('bcrypt');
	var server = require('../server/server');
	var jwt = require('jsonwebtoken');

	const saltRounds = 10;

	mongo.connect(server.url, { useNewUrlParser: true }, (err, client) => {
	if (err) {
		console.error(err)
		return
	}
		const db = client.db('urevent');
		// Initialisation des collections
		const eventsCollection = db.collection('Evenement');
		const tagsCollection = db.collection('Tag');
		const usersCollection = db.collection('Utilisateur');
		const productsCollection = db.collection('Produit');
		const salonCollection = db.collection('Salon');
		const testCollection = db.collection('test');
		console.log('connexion en parfait état de fonctionnement !');

		// server.app.use(unless('/api/users/register'))
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
	

	server.app.route('/api/events')
	.post(function (req, res) {
			eventsCollection.insertOne(req.body, (err, result) => {
			if (err) {
				console.log(err);
				res.status(400).send({
					message: err
				});
			}
			 
				res.status(201).send({
					message : result.ops[0]
				})
		})
	})
	.get(function (req, res) {
				eventsCollection.find().toArray((err, items) => {
					if (err) {
						console.log(err);
						res.status(400).send({
							message: err
						});
					}
					res.status(200).send({ 
						'Collection': 'Evenement',
						items,
					})
				})
			});
	server.app.route('/api/events/:key')
	.get(function (req, res) {
		if (req.params.key.length != 24) {
			res.status(400).send({
				message: 'Argument passed in must be a single String of 12 bytes or a string of 24 hex characters'
			})
		} else {
			var key = new ObjectId(req.params.key);
			eventsCollection.findOne({ _id: key }, (err, item) => {
			if (err) {
				console.log(err);
				res.status(400).send({
					message: err
				});
			}
			if (!item) {
				res.status(404).send({
					message: 'Document non existant'
				})
			}
			res.status(200).send({ item })
			})
		}
	})
	.delete(function (req, res) {
		if (req.params.key.length != 24) {
		res.status(400).send({
			message: 'Argument passed in must be a single String of 12 bytes or a string of 24 hex characters'
		})
		} else {
		var key = new ObjectId(req.params.key);
		eventsCollection.deleteOne({ _id: key }, (err, item) => {
				if (err) {
				console.log(err);
				res.status(400).send({
					message: err
				});
			}
			res.status(200).send({ item })
		})
	}
	})

	server.app.route('/api/tags')
	.post(function (req, res) {
        let tags = Object.values(req.body);
        tags.forEach(function (tag) {
            tagsCollection.findOne({ 'name': tag.name }, (err, item) => {
                if (err) {
                    console.log(err);
                    res.status(400).send({
                        message: err
                    });
                }
                if (!item) {
                    tagsCollection.insertOne(tag, (err, result) => {
                        if (err) {
                            console.log(err);
                            res.status(400).send({
                                message: err
                            });
                        }
                    });
                }
            });
        });
		res.status(201).send({
			message: 'OK'
		});
	})


	.get(function (req, res) {
		tagsCollection.find().toArray((err, items) => {
			if (err) {
				console.log(err);
				res.status(400).send({
					message: err
				});
			}
			res.status(200).send({ 
				'Collection': 'Tag',
				items,
			})
		})
	});
	server.app.route('/api/tags/:key')
	.get(function (req, res) {
		if (req.params.key.length != 24) {
		res.status(400).send({
			message: 'Argument passed in must be a single String of 12 bytes or a string of 24 hex characters'
		})
		} else {
		var key = new ObjectId(req.params.key);
		tagsCollection.findOne({ _id: key }, (err, item) => {
			if (err) {
				console.log(err);
				res.status(400).send({
					message: err
				});
			}
			if (!item) {
				res.status(404).send({
					message: 'Document non existant'
				})
			}
			res.status(200).send({ item })
		})
	}
	})
	.delete(function (req, res) {
		if (req.params.key.length != 24) {
		res.status(400).send({
			message: 'Argument passed in must be a single String of 12 bytes or a string of 24 hex characters'
		})
		} else {
		var key = new ObjectId(req.params.key);
		tagsCollection.deleteOne({ _id: key }, (err, item) => {
				if (err) {
				console.log(err);
				res.status(400).send({
					message: err
				});
			}
			res.status(200).send({item})
		})
	}
	})

	server.app.route('/api/users')
	.get(verifAdmin, function (req, res) {
		usersCollection.find().toArray((err, items) => {
			if (err) {
				console.log(err);
				res.status(400).send({
					message: err
				});
			}
			res.status(200).send({ 
				'Collection': 'Utilisateur',
				items 
			})
		})
	});
	server.app.route('/api/users/:key')
	.get(function (req, res) {
		if (req.params.key.length != 24) {
		res.status(400).send({
			message: 'Argument passed in must be a single String of 12 bytes or a string of 24 hex characters'
		})
		} else {
		var key = new ObjectId(req.params.key);
		usersCollection.findOne({ _id: key }, (err, item) => {
			if (err) {
				console.log(err);
				res.status(400).send({
					message: err
				});
			}
			if (!item) {
				res.status(404).send({
					message: 'Document non existant'
				})
			}
			res.status(200).send({ item })
		})
	}
	})
	.delete(verifAdmin, function (req, res) {
		if (req.params.key.length != 24) {
		res.status(400).send({
			message: 'Argument passed in must be a single String of 12 bytes or a string of 24 hex characters'
		})
		} else {
		var key = new ObjectId(req.params.key);
		usersCollection.deleteOne({ _id: key }, (err, item) => {
				if (err) {
				console.log(err);
				res.status(400).send({
					message: err
				});
			}
			res.status(200).send({item})
		})
	}
	})
	server.app.route('/api/users/register')
	.post(function (req, res) {
		// Fields expected : lastname, firstname, email, password
		if (!req.body.lastname || !req.body.firstname || !req.body.email || !req.body.password) {
			res.status(400).send({
				message: "champs manquants !"
			}) 
		}
		else {
			usersCollection.findOne({ email: req.body.email }, (err, user) => {
				if (err) {
					console.log(err);
					res.status(400).send({
						message: err
					})
				}
				if (user) {
					res.status(400).send({
						message: "Utilisateur déjà existant"
					})
				} else {
					bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
		  				req.body.password = hash
		  				usersCollection.insertOne(req.body, (err, result) => {
						if (err) {
							console.log(err);
							res.status(400).send({
								message: err
							})
						}
						res.status(201).send({
							message : result.ops[0]
						})
						})
						});
			}
			})
		}
	})
	server.app.route('/api/users/login')
	.post(function (req, res) {
		usersCollection.findOne({ email: req.body.email }, (err, user) => {
				if (err) {
					console.log(err);
					res.status(400).send({
						message: err
					})
				}
				if (!user) {
					res.status(404).send({
						message: "Utilisateur non existant !"
					})
				} else {
					bcrypt.compare(req.body.password, user.password, function(err, response) {
	    				if (response) {
	    					if (user.is_admin) {
	    						jwt.sign({ user: req.body.email }, 'adminKey', (err, token) => {
		    						res.status(200).send({
		    							message: 'email & password GOOD !',
		    							is_admin: true,
		    							token: token
	    							})
	    						})
	    					} else {
		    					jwt.sign({ user: req.body.email }, 'userKey', (err, token) => {
		    						res.status(200).send({
		    							message: 'email & password GOOD !',
		    							token: token
	    							})
	    						})
	    					}
	    					
	    					
	    					
	    				} else {
	    					res.status(400).send({
	    						message: 'incorrect information !'
	    					})
	    				}
				});
			}
			})
	})


	server.app.route('/api/products')
	.post(function (req, res) {
		productsCollection.insertOne(req.body, (err, result) => {
			if (err) {
				console.log(err);
				res.status(404).send({
					message: err
				});
			}
			res.status(201).send({
				message : result.ops[0]
			})
		})
	})
	.get(function (req, res) {
		productsCollection.find().toArray((err, items) => {
			if (err) {
				console.log(err);
				res.status(400).send({
					message: err
				});
			}
			res.status(200).send({ 
				'Collection': 'Produit',
				items 
			})
		})
	});
	server.app.route('/api/products/:key')
	.get(function (req, res) {
		if (req.params.key.length != 24) {
		res.status(400).send({
			message: 'Argument passed in must be a single String of 12 bytes or a string of 24 hex characters'
		})
		} else {
		var key = new ObjectId(req.params.key);
		productsCollection.findOne({ _id: key }, (err, item) => {
			if (err) {
				console.log(err);
				res.status(400).send({
					message: err
				});
			}
			if (!item) {
				res.status(404).send({
					message: 'Document non existant'
				})
			}
			res.status(200).send({ item })
		})
	}
	})
	.delete(function (req, res) {
		if (req.params.key.length != 24) {
		res.status(400).send({
			message: 'Argument passed in must be a single String of 12 bytes or a string of 24 hex characters'
		})
		} else {
		var key = new ObjectId(req.params.key);
		productsCollection.deleteOne({ _id: key }, (err, item) => {
				if (err) {
				console.log(err);
				res.status(400).send({
					message: err
				});
			}
			res.status(200).send({item})
		})
	}
	})


	// TEST
	server.app.route('/api/test')
	.post(function (req, res) {
		testCollection.insertOne(req.body, (err, result) => {
			if (err) {
				console.log(err);
				res.status(400).send({
					message: err
				});
			}
			res.status(201).send({
				message : result.ops[0]
			})
		})
	})
	.get(function (req, res) {
		testCollection.find().toArray((err, items) => {
			if (err) {
				console.log(err);
				res.status(400).send({
					message: err
				});
			}
			res.status(200).send({ 
				'Collection': 'TEST',
				items 
			})
		})
	});
	server.app.route('/api/test/:key')
	.get(function (req, res) {
		var key = new ObjectId(req.params.key);
		testCollection.findOne({ _id: key }, (err, item) => {
			if (err) {
				console.log(err);
				res.status(400).send({
					message: err
				});
			}
			if (!item) {
				res.status(404).send({
					message: 'Document non existant'
				})
			}
			res.status(200).send({ item })
		})
	})
	.delete(function (req, res) {
		var key = new ObjectId(req.params.key);
		testCollection.deleteOne({ _id: key }, (err, item) => {
				if (err) {
				console.log(err);
				res.status(400).send({
					message: err
				});
			}
			res.status(200).send({item})
		})
	})

	server.app.route('*')
	.get(function (req, res) {
		res.status(404).send({
			statusCode: 404,
			message: 'Mauvais endPoint !' 
		})
	})
	})

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
	function verifAdmin(req, res, next) {
		jwt.verify(req.token, 'adminKey', (err, auth) => {
				if (err) {
					res.status(401).send({
						message: 'Connectez vous en tant qu\'admin !'
					})
				} else {
					next();
				}
			});
	}

