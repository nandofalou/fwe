const BaseRoutes = require('./BaseRoutes');
const AuthController = require('../../Controllers/AuthController');
const DashboardController = require('../../Controllers/DashboardController');
const DocsController = require('../../Controllers/DocsController');
const AuthApiController = require('../../Controllers/Api/AuthController');
const UserController = require('../../Controllers/Api/UserController');
const CategoryController = require('../../Controllers/Api/CategoryController');
const AuthMiddleware = require('../../Middlewares/AuthMiddleware');
const InstallController = require('../../Controllers/Api/InstallController');
const EventController = require('../../Controllers/Api/EventController');
const EventViewController = require('../../Controllers/EventController');
const CategoryViewController = require('../../Controllers/CategoryController');
const ExampleController = require('../../Controllers/ExampleController');
const HomeController = require('../../Controllers/HomeController');
const SessionMiddleware = require('../../Middlewares/SessionMiddleware');

class Routes extends BaseRoutes {
    constructor() {
        super();
        this.registerRoutes();
    }

    registerRoutes() {
        // Rota inicial
        this.router.get('/', HomeController.index);
        
        this.router.get('/install', InstallController.install);
        this.router.get('/dashboard', DashboardController.index);

        // Rotas de documentação
        this.router.get('/docs', DocsController.index);
        this.router.get('/docs/:documento', DocsController.show);

        

        this.group('/auth', [], router => {
            router.get('/', AuthController.index);
            router.post('/', AuthController.login);
            router.get('/logout', AuthController.logout);
        });

        // Rotas de eventos (views) com SessionMiddleware
        this.group('/event', [SessionMiddleware], router => {
            router.get('/', EventViewController.index);
            router.get('/edit', EventViewController.edit);
            router.get('/edit/:id', EventViewController.edit);
            router.post('/', EventViewController.store);
            router.post('/:id', EventViewController.update);
        });

        // Rotas de categorias (views) com SessionMiddleware
        this.group('/category', [SessionMiddleware], router => {
            router.get('/', CategoryViewController.index);
            router.get('/edit', CategoryViewController.edit);
            router.get('/edit/:id', CategoryViewController.edit);
            router.post('/', CategoryViewController.store);
            router.post('/:id', CategoryViewController.update);
        });

        // Rotas públicas
        this.group('/api', [], router => {
            // Rota de instalação
            

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

        //router.get('/install', InstallController.install);
    }
}

const routesInstance = new Routes();
module.exports = routesInstance.register(); 
