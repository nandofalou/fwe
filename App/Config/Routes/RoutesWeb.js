const SessionMiddleware = require('../../Middlewares/SessionMiddleware');
const AuthController = require('../../Controllers/AuthController');
const DashboardController = require('../../Controllers/DashboardController');
const DocsController = require('../../Controllers/DocsController');
const ExampleController = require('../../Controllers/ExampleController');
const HomeController = require('../../Controllers/HomeController');
const UserController = require('../../Controllers/UserController');
const ServicesController = require('../../Controllers/ServicesController');

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
    
    // Dashboard (com SessionMiddleware para verificar autenticação)
    router.get('/dashboard', [SessionMiddleware], DashboardController.index);

    // Rotas de documentação (com SessionMiddleware para manter sessão)
    router.get('/docs', SessionMiddleware, DocsController.index);
    router.get('/docs/:documento', SessionMiddleware, DocsController.show);

    // Rotas de autenticação (com SessionMiddleware e LicenseMiddleware)
    router.group('/auth', [SessionMiddleware], authRouter => {
        authRouter.get('/', AuthController.index);
        authRouter.post('/', AuthController.login);
        authRouter.get('/logout', AuthController.logout);
    });
   

    // Rotas de usuários (views) com SessionMiddleware
    router.group('/user', [SessionMiddleware], userRouter => {
        userRouter.get('/', UserController.index);
        userRouter.get('/edit', UserController.edit);
        userRouter.get('/edit/:id', UserController.edit);
        userRouter.post('/', UserController.store);
        userRouter.post('/:id', UserController.update);
        userRouter.post('/:id/delete', UserController.delete);
    });

    //Rotas de serviços (views) com SessionMiddleware
    router.group('/services', [SessionMiddleware], servicesRouter => {
        servicesRouter.get('/', ServicesController.index);
        servicesRouter.get('/list', ServicesController.list);
        servicesRouter.get('/search', ServicesController.search);
        servicesRouter.get('/status', ServicesController.status);
        servicesRouter.get('/info/:serviceName', ServicesController.info);
        servicesRouter.post('/run/:serviceName', ServicesController.run);
        servicesRouter.post('/stop/:serviceName', ServicesController.stop);
        servicesRouter.post('/stop-id/:id', ServicesController.stopById);
        servicesRouter.post('/stop-all', ServicesController.stopAll);
        servicesRouter.post('/restart/:serviceName', ServicesController.restart);
        servicesRouter.post('/cleanup', ServicesController.cleanup);
        servicesRouter.post('/reload', ServicesController.reload);
    });
}

module.exports = registerWebRoutes; 