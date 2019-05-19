var ObjectId = require('mongodb').ObjectID;
const mongo = require('mongodb').MongoClient;
const bcrypt = require('bcrypt');
var server = require('./server/server');

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

server.app.route('/api/events')
.post(function (req, res) {
	if (!req.body.name || !req.body.description || !req.body.address) {
			res.status(404).send({
				message: 'Certains champs sont manquant !'
			})
	}
	else {
		eventsCollection.insertOne(req.body, (err, result) => {
		if (err) {
			console.log(err);
			res.status(404).send({
				message: err
			});
		}
		 
			res.status(200).send({
				message : result.ops[0]
			})
	
		
	}).in
}
})
.get(function (req, res) {
	eventsCollection.find().toArray((err, items) => {
		if (err) {
			console.log(err);
			res.status(404).send({
				message: err
			});
		}
		res.status(200).send({ 
			'Collection': 'Evenement',
			items 
		})
	})
});
server.app.route('/api/events/:key')
.get(function (req, res) {
	var key = new ObjectId(req.params.key);
	eventsCollection.findOne({ _id: key }, (err, item) => {
		if (err) {
			console.log(err);
			res.status(404).send({
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
	eventsCollection.deleteOne({ _id: key }, (err, item) => {
			if (err) {
			console.log(err);
			res.status(404).send({
				message: err
			});
		}
		res.status(200).send({item})
	})
})

server.app.route('/api/tags')
.post(function (req, res) {
	tagsCollection.insertOne(req.body, (err, result) => {
		if (err) {
			console.log(err);
			res.status(404).send({
				message: err
			});
		}
		res.status(200).send({
			message : result.ops[0]
		})
	})
})
.get(function (req, res) {
	tagsCollection.find().toArray((err, items) => {
		if (err) {
			console.log(err);
			res.status(404).send({
				message: err
			});
		}
		res.status(200).send({ 
			'Collection': 'Tag',
			items 
		})
	})
});
server.app.route('/api/tags/:key')
.get(function (req, res) {
	var key = new ObjectId(req.params.key);
	tagsCollection.findOne({ _id: key }, (err, item) => {
		if (err) {
			console.log(err);
			res.status(404).send({
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
	tagsCollection.deleteOne({ _id: key }, (err, item) => {
			if (err) {
			console.log(err);
			res.status(404).send({
				message: err
			});
		}
		res.status(200).send({item})
	})
})

server.app.route('/api/users')
.post(function (req, res) {
	usersCollection.insertOne(req.body, (err, result) => {
		if (err) {
			console.log(err);
			res.status(404).send({
				message: err
			});
		}
		res.status(200).send({
			message : result.ops[0]
		})
	})
})
.get(function (req, res) {
	usersCollection.find().toArray((err, items) => {
		if (err) {
			console.log(err);
			res.status(404).send({
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
	var key = new ObjectId(req.params.key);
	usersCollection.findOne({ _id: key }, (err, item) => {
		if (err) {
			console.log(err);
			res.status(404).send({
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
	usersCollection.deleteOne({ _id: key }, (err, item) => {
			if (err) {
			console.log(err);
			res.status(404).send({
				message: err
			});
		}
		res.status(200).send({item})
	})
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
					res.status(200).send({
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
				res.status(400).send({
					message: "Utilisateur non existant !"
				})
			} else {
				bcrypt.compare(req.body.password, user.password, function(err, response) {
    				if (response) {
    					res.status(200).send({
    						message: 'email & password GOOD !'
    					})
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
		res.status(200).send({
			message : result.ops[0]
		})
	})
})
.get(function (req, res) {
	productsCollection.find().toArray((err, items) => {
		if (err) {
			console.log(err);
			res.status(404).send({
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
	var key = new ObjectId(req.params.key);
	productsCollection.findOne({ _id: key }, (err, item) => {
		if (err) {
			console.log(err);
			res.status(404).send({
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
	productsCollection.deleteOne({ _id: key }, (err, item) => {
			if (err) {
			console.log(err);
			res.status(404).send({
				message: err
			});
		}
		res.status(200).send({item})
	})
})


// TEST
server.app.route('/api/test')
.post(function (req, res) {
	testCollection.insertOne(req.body, (err, result) => {
		if (err) {
			console.log(err);
			res.status(404).send({
				message: err
			});
		}
		res.status(200).send({
			message : result.ops[0]
		})
	})
})
.get(function (req, res) {
	testCollection.find().toArray((err, items) => {
		if (err) {
			console.log(err);
			res.status(404).send({
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
			res.status(404).send({
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
			res.status(404).send({
				message: err
			});
		}
		res.status(200).send({item})
	})
})
})

