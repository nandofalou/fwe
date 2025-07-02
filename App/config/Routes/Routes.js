const BaseRoutes = require('./BaseRoutes');
const AuthController = require('../../Controllers/AuthController');
const UserController = require('../../Controllers/UserController');
const CategoryController = require('../../Controllers/CategoryController');
const AuthMiddleware = require('../../Middlewares/AuthMiddleware');
const InstallController = require('../../Controllers/InstallController');
const EventController = require('../../Controllers/EventController');
const ExampleController = require('../../Controllers/ExampleController');
const HomeController = require('../../Controllers/HomeController');

class Routes extends BaseRoutes {
    constructor() {
        super();
        this.registerRoutes();
    }

    registerRoutes() {
        // Rota inicial
        this.router.get('/', HomeController.index);
        // Rotas públicas
        this.group('/api', [], router => {
            // Rota de instalação
            router.get('/install', InstallController.install);

            // Rotas de autenticação
            router.post('/auth/login', AuthController.login);
            router.post('/auth/register', AuthController.register);
            router.post('/auth/forgot-password', AuthController.forgotPassword);
            router.post('/auth/reset-password', AuthController.resetPassword);
            router.post('/auth/verify-email', AuthController.verifyEmail);
            router.post('/auth/resend-verification', AuthController.resendVerification);
        });

        // Rota pública para exemplo (fora do /api)
        this.router.get('/example', ExampleController.index);

        // Rotas protegidas
        this.group('/api', [AuthMiddleware.handle], router => {
            // Rotas de usuário
            router.resource('/users', UserController);
            router.get('/users/profile', UserController.profile);
            router.put('/users/profile', UserController.updateProfile);
            router.put('/users/password', UserController.updatePassword);
            router.post('/users/avatar', UserController.uploadAvatar);
            router.delete('/users/avatar', UserController.removeAvatar);
            // Rotas de eventos
            router.resource('/events', EventController);
            
            // Rotas de categorias
            router.resource('/categories', CategoryController);
            // router.get('/categories/type/:type', CategoryController.findByType);
            // router.get('/categories/code/:code', CategoryController.findByCode);
            // router.get('/categories/name/:name', CategoryController.findByName);
        });

        
    }
}

const routesInstance = new Routes();
module.exports = routesInstance.register(); 
