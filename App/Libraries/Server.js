const express = require('express');
const cors = require('cors');
const Database = require('../Helpers/Database');
const path = require('path');
const ejs = require('ejs');
const { base_url } = require('../Helpers/Common');
const SessionMiddleware = require('../Middlewares/SessionMiddleware');
const { resolveAppPath } = require('../Helpers/Path');

class Server {
    constructor(config) {
        this.app = express();
        this.app.set('view engine', 'ejs');
        this.config = config;
        this.setupMiddleware();
        this.setupRoutes();
        this.app.locals.base_url = base_url;
    }

    setupMiddleware() {
        this.app.use(SessionMiddleware);
        this.app.use(cors());
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        // Configura EJS como view engine (async: true para permitir await nas views)
        this.app.set('view engine', 'ejs');
        const isAsar = __dirname.includes('app.asar');
        const viewsPath = isAsar
          ? path.join(process.resourcesPath, 'app.asar.unpacked', 'App', 'Views')
          : resolveAppPath('App', 'Views');
        this.app.set('views', viewsPath);
        console.log('Caminho das views usado pelo Express:', viewsPath);
        // Expor pasta Public como estática
        const staticPath = isAsar
          ? path.join(process.resourcesPath, 'app.asar.unpacked', 'Public')
          : resolveAppPath('Public');
        this.app.use('/', express.static(staticPath));
        // Middleware para garantir content-type correto em renderizações de views
        // REMOVIDO: this.app.use((req, res, next) => {
        //     const originalRender = res.render;
        //     res.render = function(view, options, callback) {
        //         res.set('Content-Type', 'text/html; charset=utf-8');
        //         return originalRender.call(this, view, options, callback);
        //     };
        //     next();
        // });
    }

    setupRoutes() {
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