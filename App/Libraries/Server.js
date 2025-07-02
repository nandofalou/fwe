const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const Database = require('../Helpers/Database');
const bcrypt = require('bcrypt');
const User = require('../Models/User');
const path = require('path');
const ejs = require('ejs');

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
        // Configura EJS como view engine (async: true para permitir await nas views)
        this.app.engine('ejs', (filePath, options, callback) => {
            ejs.renderFile(filePath, options, { async: true }, callback);
        });
        this.app.set('view engine', 'ejs');
        const viewsPath = path.join(process.cwd(), 'App', 'Views');
        console.log('Caminho absoluto das views:', viewsPath);
        this.app.set('views', viewsPath);
        // Expor pasta Public como estática
        this.app.use(express.static(path.join(process.cwd(), 'Public')));
        // Middleware para garantir content-type correto em renderizações de views
        this.app.use((req, res, next) => {
            const originalRender = res.render;
            res.render = function(view, options, callback) {
                res.set('Content-Type', 'text/html; charset=utf-8');
                return originalRender.call(this, view, options, callback);
            };
            next();
        });
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