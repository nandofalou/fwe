const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const Database = require('../Helpers/Database');
const bcrypt = require('bcrypt');

class Server {
    constructor(config) {
        this.app = express();
        this.config = config;
        this.setupMiddleware();
        this.setupRoutes();
    }

    setupMiddleware() {
        this.app.use(cors());
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
    }

    setupRoutes() {
        this.app.get('/', (req, res) => {
            res.json({
                message: "FWE API",
                version: "1.0.0"
            });
        });

        try {
            const routes = require('../Config/Routes/Routes');
            this.app.use(routes);
        } catch (error) {
            console.error('Erro ao carregar rotas:', error);
            this.app.use((req, res) => {
                res.status(404).json({
                    error: true,
                    message: 'Rota não encontrada'
                });
            });
        }
    }

    async start() {
        return new Promise((resolve, reject) => {
            try {
                // Inicializa a conexão com o banco de dados antes de iniciar o servidor
                Database.connect().then(async () => {
                    // Garante a criação do usuário padrão se não existir
                    const User = require('../Models/User');
                    const userModel = new User();
                    const users = await userModel.findAll();
                    if (users.length === 0) {
                        await userModel.createDefaultUser();
                    }
                    // Inicia o servidor Express após a conexão estar pronta
                    this.server = this.app.listen(this.config.server.port, () => {
                        console.log(`Servidor rodando na porta ${this.config.server.port}`);
                        resolve(this.server);
                    });
                }).catch(err => {
                    console.error('Erro ao conectar ao banco de dados:', err);
                    reject(err);
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

async function startServer(config) {
    const server = new Server(config);
    return await server.start();
}

module.exports = { startServer }; 