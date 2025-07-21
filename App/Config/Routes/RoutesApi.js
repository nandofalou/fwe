const AuthApiController = require('../../Controllers/Api/AuthController');
const UserController = require('../../Controllers/Api/UserController');
const CategoryController = require('../../Controllers/Api/CategoryController');
const EventController = require('../../Controllers/Api/EventController');
const AcessoController = require('../../Controllers/Api/AcessoController');
const AuthMiddleware = require('../../Middlewares/AuthMiddleware');

/**
 * Registra todas as rotas da API
 * @param {BaseRoutes} router - Instância do router
 */
function registerApiRoutes(router) {
    // Rotas públicas da API (sem autenticação)
    router.group('/api', [], publicApiRouter => {
        // Rotas de autenticação
        publicApiRouter.post('/auth/login', AuthApiController.login);
        publicApiRouter.post('/auth/register', AuthApiController.register);
        publicApiRouter.post('/auth/forgot-password', AuthApiController.forgotPassword);
        publicApiRouter.post('/auth/reset-password', AuthApiController.resetPassword);
        publicApiRouter.post('/auth/verify-email', AuthApiController.verifyEmail);
        publicApiRouter.post('/auth/resend-verification', AuthApiController.resendVerification);
    });

    // Rotas protegidas da API (com autenticação)
    router.group('/api', [AuthMiddleware.handle], protectedApiRouter => {
        // Rotas de usuário
        protectedApiRouter.resource('/users', UserController);
        protectedApiRouter.get('/users/profile', UserController.profile);
        protectedApiRouter.put('/users/profile', UserController.updateProfile);
        protectedApiRouter.put('/users/password', UserController.updatePassword);
        protectedApiRouter.post('/users/avatar', UserController.uploadAvatar);
        protectedApiRouter.delete('/users/avatar', UserController.removeAvatar);
        
        // Rotas de eventos
        protectedApiRouter.resource('/events', EventController);
        
        // Rotas de categorias
        protectedApiRouter.resource('/categories', CategoryController);
        
        // Rotas customizadas de categorias (comentadas para uso futuro)
        // protectedApiRouter.get('/categories/type/:type', CategoryController.findByType);
        // protectedApiRouter.get('/categories/code/:code', CategoryController.findByCode);
        // protectedApiRouter.get('/categories/name/:name', CategoryController.findByName);
    });

    router.group('/api/acesso', [], acesso => {
        
        acesso.post('/', AcessoController.acesso);
        acesso.post('/register', AcessoController.register);
    })
}

module.exports = registerApiRoutes; 