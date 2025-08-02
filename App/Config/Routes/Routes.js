const BaseRoutes = require('./BaseRoutes');
const registerWebRoutes = require('./RoutesWeb');
const registerApiRoutes = require('./RoutesApi');

class Routes extends BaseRoutes {
    constructor() {
        super();
        this.registerRoutes();
    }

    registerRoutes() {
        // Registra rotas web (páginas)
        registerWebRoutes(this);
        
        // Registra rotas da API
        registerApiRoutes(this);
    }
}

const routesInstance = new Routes();
module.exports = routesInstance.register(); 
