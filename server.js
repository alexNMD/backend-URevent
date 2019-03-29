const admin = require('firebase-admin');
/*const functions = require('firebase-functions');*/

var serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://urevent-1551266799424.firebaseio.com"
});

var db = admin.firestore();

var events = db.collection('Evenement');


// Récupération
var getEvent = events.get()
    .then(data => {
        data.forEach(doc => {
            console.log(doc.id);
    })
}).catch(err => {
    console.log('Erreur dans la récupération du document');
});

var salon = {
    name: "alex"
};
var data = {
    name: 'TECHNO PARADE',
    adresse: 'MARSEILLE',
    prix: 40
};

// Ajout
var setDoc = db.collection('Evenement')
    .add(data)
    .then(doc => {
        doc.collection('Salon').add(salon);
    });
