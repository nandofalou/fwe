const SessionMiddleware = require('../../Middlewares/SessionMiddleware');
const AuthController = require('../../Controllers/AuthController');
const DashboardController = require('../../Controllers/DashboardController');
const DocsController = require('../../Controllers/DocsController');
const ExampleController = require('../../Controllers/ExampleController');
const HomeController = require('../../Controllers/HomeController');
const UserController = require('../../Controllers/UserController');


/**
 * Registra todas as rotas web (páginas)
 * @param {BaseRoutes} router - Instância do router
 */
function registerWebRoutes(router) {
    // Rota inicial
    router.get('/', HomeController.index);
    
    // Rota de exemplo
    router.get('/example', ExampleController.index);
    
    // Rota de instalação
    router.get('/install', require('../../Controllers/Api/InstallController').install);
    
    // Dashboard
    router.get('/dashboard', DashboardController.index);

    // Rotas de documentação
    router.get('/docs', DocsController.index);
    router.get('/docs/:documento', DocsController.show);

    // Rotas de autenticação
    router.group('/auth', [], authRouter => {
        authRouter.get('/', AuthController.index);
        authRouter.post('/', AuthController.login);
        authRouter.get('/logout', AuthController.logout);
    });

    // Rotas de eventos (views) com SessionMiddleware
    // router.group('/event', [SessionMiddleware], eventRouter => {
    //     eventRouter.get('/', EventViewController.index);
    //     eventRouter.get('/edit', EventViewController.edit);
    //     eventRouter.get('/edit/:id', EventViewController.edit);
    //     eventRouter.post('/', EventViewController.store);
    //     eventRouter.post('/:id', EventViewController.update);
    // });

    // Rotas de usuários (views) com SessionMiddleware
    router.group('/user', [SessionMiddleware], userRouter => {
        userRouter.get('/', UserController.index);
        userRouter.get('/edit', UserController.edit);
        userRouter.get('/edit/:id', UserController.edit);
        userRouter.post('/', UserController.store);
        userRouter.post('/:id', UserController.update);
        userRouter.post('/:id/delete', UserController.delete);
    });

}

module.exports = registerWebRoutes; 