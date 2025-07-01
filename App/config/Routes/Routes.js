const BaseRoutes = require('./BaseRoutes');
const AuthController = require('../../Controllers/AuthController');
const UserController = require('../../Controllers/UserController');
const AuthMiddleware = require('../../Middlewares/AuthMiddleware');
const InstallController = require('../../Controllers/InstallController');
const EventController = require('../../Controllers/EventController');

class Routes extends BaseRoutes {
    constructor() {
        super();
        this.registerRoutes();
    }

    registerRoutes() {
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
        });
    }
}

module.exports = new Routes().register(); 