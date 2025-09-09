const BaseController = require('./BaseController');
const ServiceManager = require('../Services/ServiceManager');
const Service = require('../Models/Service');

class ServicesController extends BaseController {
    /**
     * Lista todos os serviços disponíveis e em execução
     */
    static async index(req, res) {
        const sessionData = BaseController.loadSession(req);
        if (!sessionData.user) {
            return res.redirect('/auth');
        }

        try {
            // Inicializar gerenciador se necessário
            const serviceManager = ServiceManager.getInstance();
            if (!serviceManager.isInitialized) {
                ServicesController.log.info('Inicializando ServiceManager...');
                try {
                    await serviceManager.initialize();
                    ServicesController.log.info('ServiceManager inicializado com sucesso');
                } catch (initError) {
                    ServicesController.log.error('Erro ao inicializar ServiceManager', { error: initError.message });
                    // Continuar mesmo com erro de inicialização
                }
            }

            let availableServices = [];
            let runningServices = [];
            let allServicesStats = [];

            try {
                availableServices = serviceManager.getAvailableServices() || [];
                runningServices = serviceManager.getRunningServices() || [];
                allServicesStats = serviceManager.getAllServicesStats() || [];
            } catch (dataError) {
                ServicesController.log.error('Erro ao carregar dados dos serviços', { error: dataError.message });
            }

            ServicesController.log.info('Dados carregados para view', {
                availableServices: availableServices.length,
                runningServices: runningServices.length,
                allServicesStats: allServicesStats.length
            });

            return BaseController.view('services/index', {
                title: 'Gerenciamento de Serviços',
                availableServices,
                runningServices,
                allServicesStats
            }, res, req);

        } catch (error) {
            ServicesController.log.error('Erro ao carregar tela de serviços', { error: error.message });
            await BaseController.flashError(req, 'services', 'Erro ao carregar serviços');
            return res.redirect('/dashboard');
        }
    }

    /**
     * Endpoint AJAX para listar serviços
     */
    static async list(req, res) {
        try {
            // Inicializar gerenciador se necessário
            const serviceManager = ServiceManager.getInstance();
            if (!serviceManager.isInitialized) {
                await serviceManager.initialize();
            }

            const availableServices = serviceManager.getAvailableServices();
            const runningServices = serviceManager.getRunningServices();
            const allServicesStats = serviceManager.getAllServicesStats();

            return res.json({
                success: true,
                data: {
                    available: availableServices,
                    running: runningServices,
                    stats: allServicesStats
                }
            });

        } catch (error) {
            ServicesController.log.error('Erro ao listar serviços', { error: error.message });
            return res.status(500).json({ 
                success: false, 
                error: 'Erro ao listar serviços' 
            });
        }
    }

    /**
     * Endpoint AJAX para DataTables: /services/search
     */
    static async search(req, res) {
        try {
            let page = 1;
            let start = parseInt(req.query.start) || 0;
            let perPage = parseInt(req.query.perPage) || 10;
            let draw = 0;
            let searchValue = '';

            const builder = Service.dataTableQuery();
                
            perPage = parseInt(req.query.length) || 10;
            page = Math.floor((parseInt(req.query.start) || 0) / perPage) + 1;
            draw = parseInt(req.query.draw) || 0;

            if (req.query.search && req.query.search.value) {
                searchValue = req.query.search.value.trim();
                builder.like('services.name', searchValue);
            }

            if (req.query.order && req.query.columns) {
                const colIdx = parseInt(req.query.order[0].column);
                const colName = req.query.columns[colIdx].data || req.query.columns[colIdx].name;
                const dir = req.query.order[0].dir && req.query.order[0].dir.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
                if (colName) {
                    const columnsOrder = [
                        'services.id',
                        'services.name',
                        'services.status',
                        'services.started_at',
                        'services.stopped_at',
                        'services.memory_usage',
                        'services.cpu_usage'
                    ];
                    const orderBy = columnsOrder[colIdx];
                    if (orderBy) {
                        builder.orderBy(orderBy, dir);
                    }
                }
            }

            // 2. Executa a paginação
            const count = await builder.countQuery("services.id", perPage);

            builder.limit(perPage, req.query.start);

            const services = await builder.get();
            
            const columns = ['id', 'name', 'status', 'started_at', 'stopped_at', 'memory_usage', 'cpu_usage'];
            
            const data = services.map(item => {
                const row = columns.map(col => {
                    if (col === 'status') {
                        if(item.status === 'running') {
                            return `<span class="badge bg-success">Em Execução</span>`;
                        } else if(item.status === 'stopped') {
                            return `<span class="badge bg-secondary">Parado</span>`;
                        } else if(item.status === 'error') {
                            return `<span class="badge bg-danger">Erro</span>`;
                        } else {
                            return `<span class="badge bg-warning">${item.status}</span>`;
                        }
                    }
                    if (col === 'started_at') {
                        return item.started_at ? new Date(item.started_at).toLocaleString() : '-';
                    }
                    if (col === 'stopped_at') {
                        return item.stopped_at ? new Date(item.stopped_at).toLocaleString() : '-';
                    }
                    if (col === 'memory_usage') {
                        return item.memory_usage ? (item.memory_usage / 1024 / 1024).toFixed(2) + ' MB' : '-';
                    }
                    if (col === 'cpu_usage') {
                        return item.cpu_usage ? item.cpu_usage.toFixed(2) + 's' : '-';
                    }
                    return item[col];
                });
                
                // Adicionar coluna de ações
                let actionsHtml = '';
                if (item.status === 'running') {
                    actionsHtml += `<button onclick="stopServiceById('${item.id}')" class="btn btn-sm btn-danger" title="Parar">
                        <i class="fi fi-close"></i>
                    </button>`;
                }
                row.push(actionsHtml);
                
                return row;
            });

            // 3. Retorna para a view/API com objeto pager
            return res.json({
                draw: draw,
                data,
                recordsFiltered: count.rows,
                recordsTotal: count.rows,
                perPage: count.perPage,
                pagination: count.pages
            });
        } catch (error) {
            ServicesController.log.error('Erro ao buscar serviços (DataTables)', { error: error.message });
            return res.status(500).json({ error: 'Erro ao buscar serviços' });
        }
    }

    /**
     * Inicia um serviço
     */
    static async run(req, res) {
        const sessionData = BaseController.loadSession(req);
        if (!sessionData.user) {
            return res.redirect('/auth');
        }

        try {
            const { serviceName } = req.params;
            const parameters = req.query;

            // Inicializar gerenciador se necessário
            const serviceManager = ServiceManager.getInstance();
            if (!serviceManager.isInitialized) {
                await serviceManager.initialize();
            }

            const result = await serviceManager.startService(serviceName, parameters);

            // Verificar se é uma requisição AJAX
            if (req.headers['x-requested-with'] === 'XMLHttpRequest' || req.method === 'POST') {
                return res.json({
                    success: result.success,
                    message: result.success ? 
                        `Serviço ${serviceName} iniciado com sucesso!` : 
                        result.message || 'Erro ao iniciar serviço'
                });
            }

            if (result.success) {
                await BaseController.flashSuccess(req, 'services', 
                    `Serviço ${serviceName} iniciado com sucesso!`
                );
            } else {
                await BaseController.flashWarning(req, 'services', result.message);
            }

            return res.redirect('/services');

        } catch (error) {
            ServicesController.log.error('Erro ao iniciar serviço', { error: error.message });
            
            // Verificar se é uma requisição AJAX
            if (req.headers['x-requested-with'] === 'XMLHttpRequest' || req.method === 'POST') {
                return res.status(500).json({
                    success: false,
                    message: 'Erro ao iniciar serviço'
                });
            }
            
            await BaseController.flashError(req, 'services', 'Erro ao iniciar serviço');
            return res.redirect('/services');
        }
    }

    /**
     * Para um serviço
     */
    static async stop(req, res) {
        const sessionData = BaseController.loadSession(req);
        if (!sessionData.user) {
            return res.redirect('/auth');
        }

        try {
            const { serviceName } = req.params;

            const serviceManager = ServiceManager.getInstance();
            const result = await serviceManager.stopService(serviceName);

            // Verificar se é uma requisição AJAX
            if (req.headers['x-requested-with'] === 'XMLHttpRequest' || req.method === 'POST') {
                return res.json({
                    success: result.success,
                    message: result.success ? 
                        `Serviço ${serviceName} parado com sucesso!` : 
                        result.message || 'Erro ao parar serviço'
                });
            }

            if (result.success) {
                await BaseController.flashSuccess(req, 'services', 
                    `Serviço ${serviceName} parado com sucesso!`
                );
            } else {
                await BaseController.flashWarning(req, 'services', result.message);
            }

            return res.redirect('/services');

        } catch (error) {
            ServicesController.log.error('Erro ao parar serviço', { error: error.message });
            
            // Verificar se é uma requisição AJAX
            if (req.headers['x-requested-with'] === 'XMLHttpRequest' || req.method === 'POST') {
                return res.status(500).json({
                    success: false,
                    message: 'Erro ao parar serviço'
                });
            }
            
            await BaseController.flashError(req, 'services', 'Erro ao parar serviço');
            return res.redirect('/services');
        }
    }

    /**
     * Para um serviço por ID
     */
    static async stopById(req, res) {
        const sessionData = BaseController.loadSession(req);
        if (!sessionData.user) {
            return res.redirect('/auth');
        }

        try {
            const { id } = req.params;

            const serviceManager = ServiceManager.getInstance();
            const result = await serviceManager.stopServiceById(id);

            // Verificar se é uma requisição AJAX
            if (req.headers['x-requested-with'] === 'XMLHttpRequest' || req.method === 'POST') {
                return res.json({
                    success: result.success,
                    message: result.success ? 
                        'Serviço parado com sucesso!' : 
                        result.message || 'Erro ao parar serviço'
                });
            }

            if (result.success) {
                await BaseController.flashSuccess(req, 'services', 
                    'Serviço parado com sucesso!'
                );
            } else {
                await BaseController.flashWarning(req, 'services', result.message);
            }

            return res.redirect('/services');

        } catch (error) {
            ServicesController.log.error('Erro ao parar serviço por ID', { error: error.message });
            
            // Verificar se é uma requisição AJAX
            if (req.headers['x-requested-with'] === 'XMLHttpRequest' || req.method === 'POST') {
                return res.status(500).json({
                    success: false,
                    message: 'Erro ao parar serviço'
                });
            }
            
            await BaseController.flashError(req, 'services', 'Erro ao parar serviço');
            return res.redirect('/services');
        }
    }

    /**
     * Para todos os serviços
     */
    static async stopAll(req, res) {
        const sessionData = BaseController.loadSession(req);
        if (!sessionData.user) {
            return res.redirect('/auth');
        }

        try {
            const serviceManager = ServiceManager.getInstance();
            const result = await serviceManager.stopAllServices();

            // Verificar se é uma requisição AJAX
            if (req.headers['x-requested-with'] === 'XMLHttpRequest' || req.method === 'POST') {
                return res.json({
                    success: result.success,
                    message: result.success ? 
                        'Todos os serviços foram parados com sucesso!' : 
                        'Alguns serviços não puderam ser parados'
                });
            }

            if (result.success) {
                await BaseController.flashSuccess(req, 'services', 
                    'Todos os serviços foram parados com sucesso!'
                );
            } else {
                await BaseController.flashWarning(req, 'services', 'Alguns serviços não puderam ser parados');
            }

            return res.redirect('/services');

        } catch (error) {
            ServicesController.log.error('Erro ao parar todos os serviços', { error: error.message });
            
            // Verificar se é uma requisição AJAX
            if (req.headers['x-requested-with'] === 'XMLHttpRequest' || req.method === 'POST') {
                return res.status(500).json({
                    success: false,
                    message: 'Erro ao parar serviços'
                });
            }
            
            await BaseController.flashError(req, 'services', 'Erro ao parar serviços');
            return res.redirect('/services');
        }
    }

    /**
     * Reinicia um serviço
     */
    static async restart(req, res) {
        const sessionData = BaseController.loadSession(req);
        if (!sessionData.user) {
            return res.redirect('/auth');
        }

        try {
            const { serviceName } = req.params;
            const parameters = req.query;

            const serviceManager = ServiceManager.getInstance();
            const result = await serviceManager.restartService(serviceName, parameters);

            // Verificar se é uma requisição AJAX
            if (req.headers['x-requested-with'] === 'XMLHttpRequest' || req.method === 'POST') {
                return res.json({
                    success: result.success,
                    message: result.success ? 
                        `Serviço ${serviceName} reiniciado com sucesso!` : 
                        result.message || 'Erro ao reiniciar serviço'
                });
            }

            if (result.success) {
                await BaseController.flashSuccess(req, 'services', 
                    `Serviço ${serviceName} reiniciado com sucesso!`
                );
            } else {
                await BaseController.flashWarning(req, 'services', result.message);
            }

            return res.redirect('/services');

        } catch (error) {
            ServicesController.log.error('Erro ao reiniciar serviço', { error: error.message });
            
            // Verificar se é uma requisição AJAX
            if (req.headers['x-requested-with'] === 'XMLHttpRequest' || req.method === 'POST') {
                return res.status(500).json({
                    success: false,
                    message: 'Erro ao reiniciar serviço'
                });
            }
            
            await BaseController.flashError(req, 'services', 'Erro ao reiniciar serviço');
            return res.redirect('/services');
        }
    }

    /**
     * Mostra status dos serviços
     */
    static async status(req, res) {
        try {
            // Inicializar gerenciador se necessário
            const serviceManager = ServiceManager.getInstance();
            if (!serviceManager.isInitialized) {
                await serviceManager.initialize();
            }

            const runningServices = serviceManager.getRunningServices();
            const allServicesStats = serviceManager.getAllServicesStats();
            const servicesFromDb = await serviceManager.getServicesFromDatabase();

            return res.json({
                success: true,
                data: {
                    running: runningServices,
                    stats: allServicesStats,
                    database: servicesFromDb,
                    timestamp: new Date().toISOString()
                }
            });

        } catch (error) {
            ServicesController.log.error('Erro ao obter status dos serviços', { error: error.message });
            return res.status(500).json({ 
                success: false, 
                error: 'Erro ao obter status dos serviços' 
            });
        }
    }

    /**
     * Obtém informações detalhadas de um serviço
     */
    static async info(req, res) {
        try {
            const { serviceName } = req.params;

            const serviceManager = ServiceManager.getInstance();
            const info = serviceManager.getServiceInfo(serviceName);
            const stats = serviceManager.getServiceStats(serviceName);

            if (!info) {
                return res.status(404).json({ 
                    success: false, 
                    error: 'Serviço não encontrado' 
                });
            }

            return res.json({
                success: true,
                data: {
                    info,
                    stats
                }
            });

        } catch (error) {
            ServicesController.log.error('Erro ao obter informações do serviço', { error: error.message });
            return res.status(500).json({ 
                success: false, 
                error: 'Erro ao obter informações do serviço' 
            });
        }
    }

    /**
     * Recarrega todos os serviços
     */
    static async reload(req, res) {
        const sessionData = BaseController.loadSession(req);
        if (!sessionData.user) {
            return res.redirect('/auth');
        }

        try {
            const serviceManager = ServiceManager.getInstance();
            await serviceManager.reloadServices();
            
            // Verificar se é uma requisição AJAX
            if (req.headers['x-requested-with'] === 'XMLHttpRequest' || req.method === 'POST') {
                return res.json({
                    success: true,
                    message: 'Serviços recarregados com sucesso!'
                });
            }
            
            await BaseController.flashSuccess(req, 'services', 'Serviços recarregados com sucesso!');
            return res.redirect('/services');

        } catch (error) {
            ServicesController.log.error('Erro ao recarregar serviços', { error: error.message });
            
            // Verificar se é uma requisição AJAX
            if (req.headers['x-requested-with'] === 'XMLHttpRequest' || req.method === 'POST') {
                return res.status(500).json({
                    success: false,
                    message: 'Erro ao recarregar serviços'
                });
            }
            
            await BaseController.flashError(req, 'services', 'Erro ao recarregar serviços');
            return res.redirect('/services');
        }
    }

    /**
     * Limpa registros antigos
     */
    static async cleanup(req, res) {
        const sessionData = BaseController.loadSession(req);
        if (!sessionData.user) {
            return res.redirect('/auth');
        }

        try {
            const serviceManager = ServiceManager.getInstance();
            await serviceManager.cleanupOldRecords();
            
            // Verificar se é uma requisição AJAX
            if (req.headers['x-requested-with'] === 'XMLHttpRequest' || req.method === 'POST') {
                return res.json({
                    success: true,
                    message: 'Registros antigos limpos com sucesso!'
                });
            }
            
            await BaseController.flashSuccess(req, 'services', 'Registros antigos limpos com sucesso!');
            return res.redirect('/services');

        } catch (error) {
            ServicesController.log.error('Erro ao limpar registros antigos', { error: error.message });
            
            // Verificar se é uma requisição AJAX
            if (req.headers['x-requested-with'] === 'XMLHttpRequest' || req.method === 'POST') {
                return res.status(500).json({
                    success: false,
                    message: 'Erro ao limpar registros'
                });
            }
            
            await BaseController.flashError(req, 'services', 'Erro ao limpar registros');
            return res.redirect('/services');
        }
    }
}

module.exports = ServicesController; 