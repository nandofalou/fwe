const BaseRoutes = require('./BaseRoutes');
const AuthController = require('../../Controllers/AuthController');
const DashboardController = require('../../Controllers/DashboardController');
const AuthApiController = require('../../Controllers/Api/AuthController');
const UserController = require('../../Controllers/Api/UserController');
const CategoryController = require('../../Controllers/Api/CategoryController');
const AuthMiddleware = require('../../Middlewares/AuthMiddleware');
const InstallController = require('../../Controllers/Api/InstallController');
const EventController = require('../../Controllers/Api/EventController');
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
        
        this.router.get('/dashboard', DashboardController.index);

        this.group('/auth', [], router => {
            router.get('/', AuthController.index);
            router.post('/', AuthController.login);

        });

        // Rotas públicas
        this.group('/api', [], router => {
            // Rota de instalação
            router.get('/install', InstallController.install);

            // Rotas de autenticação
            router.post('/auth/login', AuthApiController.login);
            router.post('/auth/register', AuthApiController.register);
            router.post('/auth/forgot-password', AuthApiController.forgotPassword);
            router.post('/auth/reset-password', AuthApiController.resetPassword);
            router.post('/auth/verify-email', AuthApiController.verifyEmail);
            router.post('/auth/resend-verification', AuthApiController.resendVerification);
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
