const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

class Server {
    constructor(config) {
        this.app = express();
        this.config = config;
        this.setupMiddleware();
        this.setupRoutes();
        this.setupSwagger();
    }

    setupMiddleware() {
        // CORS
        if (this.config.server.cors) {
            this.app.use(cors());
        }

        // JSON Parser
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));

        // JWT Middleware
        this.app.use((req, res, next) => {
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                const token = authHeader.substring(7);
                try {
                    const decoded = jwt.verify(token, this.config.jwt.secret);
                    req.user = decoded;
                } catch (error) {
                    return res.status(401).json({ error: 'Token inválido' });
                }
            }
            next();
        });
    }

    setupRoutes() {
        // Carregar rotas dinamicamente
        const routes = require('../config/Routes');
        routes(this.app);
    }

    setupSwagger() {
        const swaggerOptions = {
            definition: {
                openapi: '3.0.0',
                info: {
                    title: 'FWE API',
                    version: '1.0.0',
                    description: 'API do Framework Electron',
                },
                servers: [
                    {
                        url: `http://localhost:${this.config.server.port}`,
                        description: 'Servidor de Desenvolvimento',
                    },
                ],
            },
            apis: ['./App/Controllers/*.js'], // Caminho para os arquivos com anotações Swagger
        };

        const swaggerDocs = swaggerJsdoc(swaggerOptions);
        this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
    }

    async start() {
        return new Promise((resolve, reject) => {
            try {
                this.server = this.app.listen(this.config.server.port, () => {
                    console.log(`Servidor rodando na porta ${this.config.server.port}`);
                    resolve(this.server);
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    async stop() {
        if (this.server) {
            return new Promise((resolve, reject) => {
                this.server.close((error) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve();
                    }
                });
            });
        }
    }
}

// Função para iniciar o servidor
async function startServer(config) {
    const server = new Server(config);
    return await server.start();
}

module.exports = { startServer }; 