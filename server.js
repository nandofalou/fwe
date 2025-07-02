const express = require('express');
const cors = require('cors');
const routes = require('./App/Config/Routes/Routes');
const Log = require('./App/Helpers/Log');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas
app.use(routes);

// Tratamento de erros
app.use((err, req, res, next) => {
    Log.error('Erro interno do servidor', { 
        error: err.message, 
        stack: err.stack,
        url: req.url,
        method: req.method
    });
    res.status(500).json({
        error: true,
        message: 'Erro interno do servidor'
    });
});

const PORT = process.env.PORT || 9000;
app.listen(PORT, () => {
    Log.info('Servidor Express iniciado', { 
        port: PORT
    });
}); 