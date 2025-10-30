const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Kural API Documentation',
            version: '1.0.0',
            description: `
## Kural App Backend API

Complete API documentation for the Kural voter management system.

### Features:
- 🔐 JWT Authentication
- 👥 Voter Management
- 📊 Survey System
- 👔 Cadre Management
- 🗳️ Election Management
- 📱 Mobile & Special Categories
- 🎨 Customization (Part Colors, Vulnerabilities)

### Authentication:
Most endpoints require a Bearer token. Obtain a token by logging in via POST /api/v1/auth/login

### Base URL:
- **Production:** https://api.kuralapp.in/api/v1
- **Development:** http://localhost:5000/api/v1
            `,
            contact: {
                name: 'Kural API Support',
                email: 'support@kuralapp.in',
            },
            license: {
                name: 'Private',
            },
        },
        servers: [{
                url: 'http://localhost:5000/api/v1',
                description: 'Development server'
            },
            {
                url: 'https://api.kuralapp.in/api/v1',
                description: 'Production server'
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter your JWT token obtained from /auth/login',
                },
            },
            schemas: {
                Error: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: false,
                        },
                        message: {
                            type: 'string',
                            example: 'Error message',
                        },
                    },
                },
                Success: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: true,
                        },
                        message: {
                            type: 'string',
                            example: 'Operation successful',
                        },
                        data: {
                            type: 'object',
                        },
                    },
                },
            },
        },
        security: [{ bearerAuth: [] }],
        tags: [
            { name: 'Authentication', description: 'Login and authentication endpoints' },
            { name: 'Voters', description: 'Voter management operations' },
            { name: 'Surveys', description: 'Survey and survey form management' },
            { name: 'Cadres', description: 'Cadre (staff) management' },
            { name: 'Elections', description: 'Election configuration' },
            { name: 'Settings', description: 'Application settings and configurations' },
            { name: 'Special Categories', description: 'Transgender, Fatherless, Guardian, Age 60+, Age 80+ voters' },
            { name: 'Mobile Voters', description: 'Voters with mobile numbers' },
            { name: 'Catalogue', description: 'Catalogue management' },
            { name: 'Health', description: 'Health check endpoints' },
        ],
    },
    apis: [
        './src/routes/*.js',
        './src/controllers/*.js',
        './src/models/*.js',
    ],
};

const specs = swaggerJSDoc(options);

module.exports = {
    swaggerUi,
    specs,
};