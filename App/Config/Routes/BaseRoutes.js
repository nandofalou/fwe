const express = require('express');

class BaseRoutes {
    constructor() {
        this.router = express.Router();
        this.routes = [];
    }

    /**
     * Registra uma rota GET
     * @param {string} path 
     * @param {Function} handler 
     * @param {Array} middlewares 
     */
    get(path, ...args) {
        let handler, middlewares = [];
        
        if (args.length === 1) {
            handler = args[0];
        } else if (args.length === 2) {
            middlewares = Array.isArray(args[0]) ? args[0] : [args[0]];
            handler = args[1];
        }
        
        this.routes.push({
            method: 'get',
            path,
            handler,
            middlewares
        });
        return this;
    }

    /**
     * Registra uma rota POST
     * @param {string} path 
     * @param {Function} handler 
     * @param {Array} middlewares 
     */
    post(path, ...args) {
        let handler, middlewares = [];
        
        if (args.length === 1) {
            handler = args[0];
        } else if (args.length === 2) {
            middlewares = Array.isArray(args[0]) ? args[0] : [args[0]];
            handler = args[1];
        }
        
        this.routes.push({
            method: 'post',
            path,
            handler,
            middlewares
        });
        return this;
    }

    /**
     * Registra uma rota PUT
     * @param {string} path 
     * @param {Function} handler 
     * @param {Array} middlewares 
     */
    put(path, ...args) {
        let handler, middlewares = [];
        
        if (args.length === 1) {
            handler = args[0];
        } else if (args.length === 2) {
            middlewares = Array.isArray(args[0]) ? args[0] : [args[0]];
            handler = args[1];
        }
        
        this.routes.push({
            method: 'put',
            path,
            handler,
            middlewares
        });
        return this;
    }

    /**
     * Registra uma rota DELETE
     * @param {string} path 
     * @param {Function} handler 
     * @param {Array} middlewares 
     */
    delete(path, ...args) {
        let handler, middlewares = [];
        
        if (args.length === 1) {
            handler = args[0];
        } else if (args.length === 2) {
            middlewares = Array.isArray(args[0]) ? args[0] : [args[0]];
            handler = args[1];
        }
        
        this.routes.push({
            method: 'delete',
            path,
            handler,
            middlewares
        });
        return this;
    }

    /**
     * Registra uma rota PATCH
     * @param {string} path 
     * @param {Function} handler 
     * @param {Array} middlewares 
     */
    patch(path, ...args) {
        let handler, middlewares = [];
        
        if (args.length === 1) {
            handler = args[0];
        } else if (args.length === 2) {
            middlewares = Array.isArray(args[0]) ? args[0] : [args[0]];
            handler = args[1];
        }
        
        this.routes.push({
            method: 'patch',
            path,
            handler,
            middlewares
        });
        return this;
    }

    /**
     * Registra um grupo de rotas
     * @param {string} prefix 
     * @param {Array} middlewares 
     * @param {Function} callback 
     */
    group(prefix, middlewares = [], callback) {
        const groupRouter = new BaseRoutes();
        callback(groupRouter);

        groupRouter.routes.forEach(route => {
            this.routes.push({
                method: route.method,
                path: `${prefix}${route.path}`,
                handler: route.handler,
                middlewares: [...middlewares, ...route.middlewares]
            });
        });

        return this;
    }

    /**
     * Registra um recurso REST
     * @param {string} path 
     * @param {Object} controller 
     * @param {Array} middlewares 
     */
    resource(path, controller, middlewares = []) {
        this.get(path, controller.index, middlewares);
        this.get(`${path}/:id`, controller.show, middlewares);
        this.post(path, controller.store, middlewares);
        this.put(`${path}/:id`, controller.update, middlewares);
        this.delete(`${path}/:id`, controller.destroy, middlewares);
        return this;
    }

    /**
     * Registra todas as rotas no router
     */
    register() {
        this.routes.forEach(route => {
            this.router[route.method](
                route.path,
                ...route.middlewares,
                route.handler
            );
        });
        return this.router;
    }
}

module.exports = BaseRoutes; 