const ObjectId = require('mongodb').ObjectID;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const initializeRoutes = (app, database) => {
    // Déclaration des collections
    const eventsCollection = database.collection('Evenement');
    const tagsCollection = database.collection('Tag');
    const usersCollection = database.collection('Utilisateur');
    const productsCollection = database.collection('Produit');
    const salonCollection = database.collection('Salon');
    const testCollection = database.collection('test');

    app.route('/api/events')
        .post(function (req, res) {
            eventsCollection.insertOne(req.body, (err, result) => {
                if (err) {
                    console.log(err);
                    res.status(400).send({
                        message: err
                    });
                }
                let eventKey = result.ops[0]._id;
                salonCollection.insertOne(
                    {
                        'event-key': eventKey,
                        'comments': [{ }]
                    }, (err, result) => {
                        if (err) {
                            console.log(err);
                            res.status(400).send({
                                message: err
                            });
                        }
                        let salonKey = result.ops[0]._id;
                        eventsCollection.findOneAndUpdate({ _id: eventKey },{ $set: { 'salon-key': salonKey } }, (err, result) => {
                            if (err) {
                                console.log(err);
                                res.status(400).send({
                                    message: err
                                });
                            }
                            res.status(201).send({
                                message : result.value
                            })
                        })
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
    app.route('/api/events/:key')
        .get(function (req, res) {
            if (req.params.key.length !== 24) {
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
            if (req.params.key.length !== 24) {
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
        });

    app.route('/api/tags')
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
    app.route('/api/tags/:key')
        .get(function (req, res) {
            if (req.params.key.length !== 24) {
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
            if (req.params.key.length !== 24) {
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
        });

    app.route('/api/users')
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
    app.route('/api/users/:key')
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
            if (req.params.key.length !== 24) {
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
        });
    app.route('/api/users/register')
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
                        bcrypt.hash(req.body.password, 10, function(err, hash) {
                            req.body.password = hash;
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
        });
    app.route('/api/users/login')
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
        });


    app.route('/api/products')
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
    app.route('/api/products/:key')
        .get(function (req, res) {
            if (req.params.key.length !== 24) {
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
            if (req.params.key.length !== 24) {
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
        });

    app.route('*')
        .get(function (req, res) {
            res.status(404).send({
                statusCode: 404,
                message: 'Mauvais endPoint !'
            })
        });

    // TEST
    app.route('/api/test')
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
    app.route('/api/test/:key')
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
        });
};

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

module.exports = initializeRoutes;