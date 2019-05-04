const admin = require('firebase-admin');
/*const functions = require('firebase-functions');*/
var serviceAccount = require('./serviceAccountKey.json');
var firebaseHelper = require('firebase-functions-helper');
var express = require('express');
var app = express();
var ejs = require('ejs');
var bodyParser = require('body-parser');

app.listen(8080);
console.log('8080 is the magic port');
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// <---> Firebase connection <--->
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://urevent-1551266799424.firebaseio.com"
});

var db = admin.firestore();

// Déclaration des collections
var eventsCollection = 'Evenement';
var tagsCollection = 'Tag';
var usersCollection = 'Utilisateur';
var productsCollection = 'Produit';
var testCollection = 'test';
var salonCollection = 'Salon';

// API's calls
// GET all collection
app.get('/api/events', function (req, res) {
    firebaseHelper.firestore
        .backup(db, eventsCollection)
        .then(function (data) {
            if (data) {
                res.status(200).send(data);
            } else {
                res.status(404).send({
                    message: "collection vide"
                });
            }
        })
});
app.get('/api/tags', function (req, res) {
    firebaseHelper.firestore
        .backup(db, tagsCollection)
        .then(function (data) {
            if (data) {
                res.status(200).send(data);
            } else {
                res.status(404).send({
                    message: "collection vide"
                });
            }
        })
});
app.get('/api/products', function (req, res) {
    firebaseHelper.firestore
        .backup(db, productsCollection)
        .then(function (data) {
            if (data) {
                res.status(200).send(data);
            } else {
                res.status(404).send({
                    message: "collection vide"
                });
            }
        })
});
app.get('/api/users', function (req, res) {
    firebaseHelper.firestore
        .backup(db, usersCollection)
        .then(function (data) {
            if (data) {
                res.status(200).send(data);
            } else {
                res.status(404).send({
                    message: "collection vide"
                });
            }
        })
});

// GET by key
app.get('/api/events/:key', function (req, res) {
    const key = req.params.key;
    firebaseHelper.firestore
        .getDocument(db, eventsCollection, key)
        .then(function (doc) {
            if (doc) {
                res.status(200).send(doc);
            } else {
                res.status(404).send({
                    message: "Document non existant"
                });
            }
        });
});
app.get('/api/tags/:key', function (req, res) {
    const key = (req.params.key);
    firebaseHelper.firestore
        .getDocument(db, tagsCollection, key)
        .then(function (doc) {
            if (doc) {
                res.status(200).send(doc);
            } else {
                res.status(404).send({
                    message: "Document non existant"
                });
            }
        });
});
app.get('/api/products/:key', function (req, res) {
    const key = (req.params.key);
    firebaseHelper.firestore
        .getDocument(db, productsCollection, key)
        .then(function (doc) {
            if (doc) {
                res.status(200).send(doc);
            } else {
                res.status(404).send({
                    message: "Document non existant"
                });
            }
        });
});
app.get('/api/users/:key', function (req, res) {
    const key = (req.params.key);
    firebaseHelper.firestore
        .getDocument(db, usersCollection, key)
        .then(function (doc) {
            if (doc) {
                res.status(200).send(doc);
            } else {
                res.status(404).send({
                    message: "Document non existant"
                });
            }
        });
});

// POST
app.post('/api/events', function (req, res) {
    if (!req.body.name || !req.body.description || !req.body.address) {
        res.status(404).send('Certains champs sont manquant !')
    } else {
        firebaseHelper.firestore
            .createNewDocument(db, eventsCollection, req.body)
            .then(function () {
                res.status(200).send('Evenement créé');
            });
    }

});
app.post('/api/tags', function (req, res) {
    firebaseHelper.firestore
        .createNewDocument(db, tagsCollection, req.body)
        .then(function () {
            res.status(200).send('Tag créé');
        });
});
app.post('/api/products', function (req, res) {
    firebaseHelper.firestore
        .createNewDocument(db, productsCollection, req.body)
        .then(function () {
            res.status(200).send('Produit créé');
        });
});
app.post('/api/users', function (req, res) {
    firebaseHelper.firestore
        .createNewDocument(db, usersCollection, req.body)
        .then(function () {
            res.status(200).send('Utilisateur créé');
        });
});

// DELETE by key
app.delete('/api/events/:key', function (req, res) {
  const key = req.params.key;
    firebaseHelper.firestore
        .deleteDocument(db, eventsCollection, key)
        .then(function (value) {
            res.status(200).send(value);
        })
});
app.delete('/api/tags/:key', function (req, res) {
    const key = req.params.key;
    firebaseHelper.firestore
        .deleteDocument(db, tagsCollection, key)
        .then(function (value) {
            res.status(200).send(value);
        })
});
app.delete('/api/products/:key', function (req, res) {
    const key = req.params.key;
    firebaseHelper.firestore
        .deleteDocument(db, productsCollection, key)
        .then(function (value) {
            res.status(200).send(value);
        })
});
app.delete('/api/users/:key', function (req, res) {
    const key = req.params.key;
    firebaseHelper.firestore
        .deleteDocument(db, usersCollection, key)
        .then(function (value) {
            res.status(200).send(value);
        })
});


// TEST
app.post('/api/test', function (req, res) {
    firebaseHelper.firestore
        .createNewDocument(db, testCollection, req.body)
        .then(docRef => console.log(docRef.id));
});

//TODO : avoir un affichage "propre" pour le front de l'administration
//TODO : enregistrement des tags dans la collection 'Tag' via le scrapper des Events