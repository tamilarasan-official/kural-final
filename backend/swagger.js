const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Kural API',
            version: '1.0.0',
            description: 'API documentation for Kural App',
        },
        servers: [
            { url: 'https://api.kuralapp.in/api/v1' },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [{ bearerAuth: [] }],
    },
    apis: ['./src/routes/*.js'], // Path to the API docs
};

const specs = swaggerJSDoc(options);

module.exports = {
    swaggerUi,
    specs,
};