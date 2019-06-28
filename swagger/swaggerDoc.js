const swaggerUI = require('swagger-ui-express');
var swaggerDocument = require('./swagger.json');

const options = {
    swaggerDefinition: {
        // Like the one described here: https://swagger.io/specification/#infoObject
        info: {
            title: 'API documentation for UR event',
            version: '1.0.0',
            description: 'Documentation pour l\'api de l\'application URevent',
        },
        contact: {
            name: "Alexandre Normand",
            email: "ale.normand@icloud.com"
        }
    },
    // List of files to be processes. You can also set globs './routes/*.js'
};

module.exports = (app) => {
    app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument));
};

// TODO : finir la documentation sur le fichier JSON
