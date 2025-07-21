const express = require('express');
const cors = require('cors');
const routes = require('./App/Config/Routes/Routes');
const path = require('path');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'App', 'Views'));
app.use(express.static(path.join(__dirname, 'Public')));

const PORT = process.env.PORT || 9000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

module.exports = app; 