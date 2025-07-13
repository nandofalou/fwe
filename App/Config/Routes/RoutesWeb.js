const AuthController = require('../../Controllers/AuthController');
const DashboardController = require('../../Controllers/DashboardController');
const DocsController = require('../../Controllers/DocsController');
const EventViewController = require('../../Controllers/EventController');
const CategoryViewController = require('../../Controllers/CategoryController');
const TicketController = require('../../Controllers/TicketController');
const ExampleController = require('../../Controllers/ExampleController');
const HomeController = require('../../Controllers/HomeController');
const SessionMiddleware = require('../../Middlewares/SessionMiddleware');

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
    router.group('/event', [SessionMiddleware], eventRouter => {
        eventRouter.get('/', EventViewController.index);
        eventRouter.get('/edit', EventViewController.edit);
        eventRouter.get('/edit/:id', EventViewController.edit);
        eventRouter.post('/', EventViewController.store);
        eventRouter.post('/:id', EventViewController.update);
    });

    // Rotas de categorias (views) com SessionMiddleware
    router.group('/category', [SessionMiddleware], categoryRouter => {
        categoryRouter.get('/', CategoryViewController.index);
        categoryRouter.get('/edit', CategoryViewController.edit);
        categoryRouter.get('/edit/:id', CategoryViewController.edit);
        categoryRouter.post('/', CategoryViewController.store);
        categoryRouter.post('/:id', CategoryViewController.update);
    });

    // Rotas de tickets (views) com SessionMiddleware
    router.group('/ticket', [SessionMiddleware], ticketRouter => {
        ticketRouter.get('/', TicketController.index);
        ticketRouter.get('/edit', TicketController.edit);
        ticketRouter.get('/edit/:id', TicketController.edit);
        ticketRouter.post('/', TicketController.store);
        ticketRouter.post('/:id', TicketController.update);
    });
}

module.exports = registerWebRoutes; 