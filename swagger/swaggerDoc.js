const swaggerUI = require('swagger-ui-express');
const swaggerJSONDocument = require('./swagger_v2.json');

module.exports = (app) => {
    app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerJSONDocument));
};

// TODO : finir la documentation sur le fichier JSON (surtout pour les users [register, login])
