const path = require('path');
const fs = require('fs');

/**
 * Carrega um controlador dinamicamente
 * @param {string} controllerName Nome do controlador
 * @returns {Object} Instância do controlador
 */
function loadController(controllerName) {
    const controllerPath = path.join(__dirname, '..', 'Controllers', `${controllerName}.js`);
    if (fs.existsSync(controllerPath)) {
        const Controller = require(controllerPath);
        return new Controller();
    }
    throw new Error(`Controller ${controllerName} não encontrado`);
}

/**
 * Configura as rotas da aplicação
 * @param {Express} app Instância do Express
 */
module.exports = function(app) {
    // Rota de autenticação
    app.post('/auth/login', async (req, res) => {
        try {
            const authController = loadController('Auth');
            await authController.login(req, res);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // Rotas de usuários
    app.get('/users', async (req, res) => {
        try {
            const userController = loadController('User');
            await userController.index(req, res);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.post('/users', async (req, res) => {
        try {
            const userController = loadController('User');
            await userController.create(req, res);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.get('/users/:id', async (req, res) => {
        try {
            const userController = loadController('User');
            await userController.show(req, res);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.put('/users/:id', async (req, res) => {
        try {
            const userController = loadController('User');
            await userController.update(req, res);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.delete('/users/:id', async (req, res) => {
        try {
            const userController = loadController('User');
            await userController.delete(req, res);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // Rota padrão
    app.get('/', (req, res) => {
        res.json({
            message: 'FWE API',
            version: '1.0.0',
            documentation: '/api-docs'
        });
    });

    // Rota 404
    app.use((req, res) => {
        res.status(404).json({
            error: 'Rota não encontrada'
        });
    });
}; 