const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./App/Config/swagger');
const routes = require('./App/Config/Routes/Routes');
const path = require('path');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Swagger
app.use('/api-docs', swaggerUi.serve);
app.get('/api-docs', swaggerUi.setup(swaggerSpecs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: "API Documentation",
    swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        docExpansion: 'list',
        filter: true,
        showCommonExtensions: true,
        showExtensions: true,
        showRequestHeaders: true,
        showResponseHeaders: true,
        syntaxHighlight: {
            activate: true,
            theme: 'monokai'
        }
    }
}));

// Rotas
app.use(routes);

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
    console.log(`Documentação Swagger disponível em: http://localhost:${PORT}/api-docs`);
});

module.exports = app; 