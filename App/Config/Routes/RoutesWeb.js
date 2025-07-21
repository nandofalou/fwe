const SessionMiddleware = require('../../Middlewares/SessionMiddleware');
const AuthController = require('../../Controllers/AuthController');
const DashboardController = require('../../Controllers/DashboardController');
const DocsController = require('../../Controllers/DocsController');
const EventViewController = require('../../Controllers/EventController');
const CategoryViewController = require('../../Controllers/CategoryController');
const TicketController = require('../../Controllers/TicketController');
const ExampleController = require('../../Controllers/ExampleController');
const HomeController = require('../../Controllers/HomeController');
const UserController = require('../../Controllers/UserController');

const CategoryGroupController = require('../../Controllers/CategoryGroupController');
const TerminalController = require('../../Controllers/TerminalController');
// const AcessoController = require('../../Controllers/Api/AcessoController');

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
        ticketRouter.get('/search', TicketController.search);
        ticketRouter.get('/edit', TicketController.edit);
        ticketRouter.get('/edit/:id', TicketController.edit);
        ticketRouter.post('/', TicketController.store);
        ticketRouter.post('/:id', TicketController.update);
    });

    // Rotas de grupos (views) com SessionMiddleware
    router.group('/group', [SessionMiddleware], groupRouter => {
        groupRouter.get('/', CategoryGroupController.index);
        groupRouter.get('/search', CategoryGroupController.search);
        groupRouter.get('/edit', CategoryGroupController.edit);
        groupRouter.get('/edit/:id', CategoryGroupController.edit);
        groupRouter.post('/', CategoryGroupController.store);
        groupRouter.post('/:id', CategoryGroupController.update);
    });

    // Associação de categorias ao grupo
    router.get('/group/:id/category', CategoryGroupController.category);
    router.post('/group/:id/category', CategoryGroupController.associateCategory);

    // Rotas de equipamentos (views) com SessionMiddleware
    router.group('/device', [SessionMiddleware], deviceRouter => {
        deviceRouter.get('/', TerminalController.index);
        deviceRouter.get('/search', TerminalController.search);
        deviceRouter.get('/edit', TerminalController.edit);
        deviceRouter.get('/edit/:id', TerminalController.edit);
        deviceRouter.post('/', TerminalController.store);
        deviceRouter.post('/:id', TerminalController.update);
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

}

module.exports = registerWebRoutes; 