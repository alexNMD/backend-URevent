const ObjectId = require('mongodb').ObjectID;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
var jwtDecode = require('jwt-decode');
var Geocoding = require('./geocoding');
var Event = require('../crawler/models/Event');
const swaggerDoc = require('../swagger/swaggerDoc');
const ejs = require('ejs');

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
            // Fields expected : name, description, address
            if (!req.body.name || !req.body.description || !req.body.address) {
                res.status(400).send({
                    message: "champs manquants !"
                })
            } else {
                let evenement = new Event(req.body);
                evenement.name = req.body.name;
                evenement.address = req.body.address;
                evenement.description = req.body.description;
                evenement.price = req.body.price;
                evenement.img = req.body.img;
                evenement.baseURL = req.body.baseURL;
                evenement.tags = req.body.tags;
                evenement.start = req.body.start;
                evenement.end = req.body.end;
                Geocoding(req.body.address, function (response) {
                    evenement.location = response;
                    console.log(evenement);
                    eventsCollection.insertOne(evenement, (err, result) => {
                        if (err) {
                            console.log(err);
                            res.status(400).send({
                                message: err
                            });
                        }
                        let eventKey = result.ops[0]._id;
                        salonCollection.insertOne(
                            {
                                'eventKey': eventKey,
                                'comments': [{ }]
                            }, (err, result) => {
                                if (err) {
                                    console.log(err);
                                    res.status(400).send({
                                        message: err
                                    });
                                }
                                let salonKey = result.ops[0]._id;
                                eventsCollection.findOneAndUpdate({ _id: eventKey },{ $set: { 'salonKey': salonKey } }, (err, result) => {
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
                });
            }
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
                salonCollection.deleteOne({ 'eventKey': key }).then(function () {
                    eventsCollection.deleteOne({ _id: key }, (err, item) => {
                        if (err) {
                            console.log(err);
                            res.status(400).send({
                                message: err
                            });
                        }
                        res.status(200).send({ item })
                    })
                }).catch(function(err) {
                    res.status(400).send({
                        message: err
                    })
                });

            }
        });
    app.route('/api/events/:key/comment')
        .post(function (req, res) {
            if (req.params.key.length !== 24) {
                res.status(400).send({
                    message: 'Argument passed in must be a single String of 12 bytes or a string of 24 hex characters'
                })
            } else {
                if (!req.body.comment) {
                    res.status(400).send({
                        message: "Commentaire vide !"
                    })
                } else {
                    let key = new ObjectId(req.params.key);
                    let comment = req.body.comment;
                    let user = jwtDecode(req.token).user;
                    let commentaire = {
                        user: user,
                        comment: comment
                    };
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
                        let salonKey = item.salonKey;
                        salonCollection.findOneAndUpdate({ _id: salonKey },
                            {
                                $push:
                                    {
                                        'comments': commentaire
                                    }
                            }, (err, result) => {
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
                }
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
            if (req.params.key.length !== 24) {
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

    app.route('/scrapper').get(function (req, res) {
        res.render('pages/scrapper-index');
    });
    app.route('/scrapper/launch').post(function (req, res) {

        var launchValues = {'start': req.body.start_date, 'end': req.body.end_date};
        // console.log(launchValues);
        require('../crawler/scrapper')(launchValues);
        res.render('pages/scrapper-launched', { launchValues: launchValues})
    });

    // for swagger documentation
    swaggerDoc(app);

    app.route('*')
        .get(function (req, res) {
            res.status(404).send({
                statusCode: 404,
                message: 'Mauvais endPoint !'
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

// TODO : refaire fonctionner les tokens (avec swagger notamment) et aussi pour l'ajout de commentaire
