const express = require('express');
const cors = require('cors');
const routes = require('./App/Config/Routes/Routes');
const path = require('path');
const Database = require('./App/Helpers/Database');
const ServiceManager = require('./App/Services/ServiceManager');

const app = express();

// Configuração do view engine e views
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'App', 'Views'));

// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'Public')));

// Rotas
app.use(routes);

// Middleware para rotas não encontradas (404)
app.use('*', (req, res) => {
    res.status(404).json({
        error: true,
        message: 'Rota não encontrada'
    });
});

// Tratamento de erros
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: true,
        message: 'Erro interno do servidor'
    });
});

const PORT = process.env.PORT || 9000;

// Inicializar banco de dados e serviços antes de iniciar o servidor
async function startServer() {
    try {
        await Database.connect();
        console.log('Banco de dados inicializado com sucesso');
        
        // Inicializar ServiceManager
        const serviceManager = ServiceManager.getInstance();
        await serviceManager.initialize();
        console.log('ServiceManager inicializado com sucesso');
        
        app.listen(PORT, () => {
            console.log(`Servidor rodando na porta ${PORT}`);
        });
    } catch (error) {
        console.error('Erro ao inicializar:', error);
        process.exit(1);
    }
}

startServer();

module.exports = app; 