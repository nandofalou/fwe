const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API Documentation',
            version: '1.0.0',
            description: 'Documentação da API usando Swagger',
            contact: {
                name: 'Suporte',
                email: 'suporte@exemplo.com'
            }
        },
        servers: [
            {
                url: 'http://localhost:9000',
                description: 'Servidor de Desenvolvimento'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        },
        security: [{
            bearerAuth: []
        }]
    },
    apis: [
        './App/Controllers/*.js',
        './App/Models/*.js',
        './App/Config/Routes/*.js'
    ]
};

const specs = swaggerJsdoc(options);

module.exports = specs; 