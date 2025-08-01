const BaseController = require('./BaseController');
const Ticket = require('../Models/Ticket');
const Event = require('../Models/Event');
const Category = require('../Models/Category');
const Photo = require('../Models/Photo');
const TicketValidator = require('../Validations/TicketValidator');

class TicketController extends BaseController {
    /**
     * Lista todos os tickets (com filtros)
     */
    static async index(req, res) {
        const sessionData = BaseController.loadSession(req);
        if (!sessionData.user) {
            return res.redirect('/auth');
        }
        try {
            // Carregar eventos e categorias para os filtros
            const events = await Event.get();
            const categories = await Category.get();
            return BaseController.view('ticket/index', {
                title: 'Cadastro de Tickets',
                events,
                categories,
                filter: { event_id: '', category_id: '', status: '' }
            }, res, req);
        } catch (error) {
            TicketController.log.error('Erro ao carregar tela de tickets', { error: error.message });
            await BaseController.flashError(req, 'tickets', 'Erro ao carregar tela de tickets');
            return res.redirect('/dashboard');
        }
    }

    /**
     * Endpoint AJAX para DataTables: /ticket/search
     */
    static async search(req, res) {
        try {
            let page = 1;
            let start = parseInt(req.query.start) || 0;
            let perPage = parseInt(req.query.perPage) || 10;
            let draw = 0;
            let searchValue = '';

            // draw = parseInt(req.query.draw) || 0;
            const builder = Ticket.dataTableQuery();
                
            perPage = parseInt(req.query.length) || 10;
            page = Math.floor((parseInt(req.query.start) || 0) / perPage) + 1;
            draw = parseInt(req.query.draw) || 0;

            if (req.query.search && req.query.search.value) {
                searchValue = req.query.search.value.trim();
                builder.like('concat(ticket.code,ticket.fullname,ticket.extrafield1)', searchValue)
            }

            if (req.query.order && req.query.columns) {
                const colIdx = parseInt(req.query.order[0].column);
                const colName = req.query.columns[colIdx].data || req.query.columns[colIdx].name;
                const dir = req.query.order[0].dir && req.query.order[0].dir.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
                if (colName) {
                    const columnsOrder = [
                        'ticket.id',
                        'ticket.code',
                        'event.name',
                        'category.name',
                        'ticket.active',
                        'ticket.master'
                    ];
                    const orderBy = columnsOrder[colName];
                    builder.orderBy(orderBy, dir);
                }
            }

            const event_id = req.query.event_id || null;
            const category_id = req.query.category_id || null;
            const status = req.query.status || null;
                
            if(event_id) {
                builder.where({ 'event.id': event_id })
            }

            if(category_id) {
                builder.where({ 'category.id': category_id })
            }

            if(status) {
                builder.where({ 'ticket.active': status })
            }

            // 2. Executa a paginação
            const count = await builder.countQuery("ticket.id", perPage);

            builder.limit(perPage, req.query.start);

            const tickets = await builder.get();
            
            const columns = ['id', 'code', 'eventName', 'active', 'master'];
            
            const data = tickets.map(item => {
                const row = columns.map(col => {
                    if (col === 'eventName') {
                        return `${item.eventName}<br/>${item.categoryName}`;
                    }
                    if (col === 'active') {
                        if(item.active === 1) {
                            return `<span class="badge bg-success">Ativo</span>`
                        } else {
                            return `<span class="badge bg-danger">inativo</span>`
                        }
                    }
                    if (col === 'master') {
                        if(item.master === 1) {
                            return `<span class="badge bg-success">Ativo</span>`
                        } else {
                            return `<span class="badge bg-danger">inativo</span>`
                        }
                    }
                    return item[col];
                });
                row.push(`<div class="btn-group" role="group">
                            <a href="${BaseController.base_url('ticket/edit')}/${item.id}" class="btn btn-sm btn-outline-primary btn-edit">
                                <i class="fi fi-pencil"></i>
                            </a>
                            <button type="button" class="btn btn-sm btn-danger js-ajax-confirm" title="Excluir" onclick="confirmDelete(1, 'teste abc')">
                                <i class="fi fi-thrash"></i>
                            </button>
                        </div>`);
                return row;
            });

            // 3. Retorna para a view/API com objeto pager
            return res.json({
                data,
                recordsFiltered: count.rows,
                recordsTotal: count.rows,
                perPage: count.perPage,
                pagination: count.pages
            });
        } catch (error) {
            TicketController.log.error('Erro ao buscar tickets (DataTables)', { error: error.message });
            return res.status(500).json({ error: 'Erro ao buscar tickets' });
        }
    }

    /**
     * Exibe formulário para criar/editar ticket
     */
    static async edit(req, res) {
        const sessionData = BaseController.loadSession(req);
        if (!sessionData.user) {
            return res.redirect('/auth');
        }
        try {
            let ticket = null;
            let isEdit = false;
            let photoBase64 = null;
            const events = await Event.get();
            const categories = await Category.get();

            if (req.params.id) {
                const validation = TicketValidator.validateId(req.params.id);
                if (!validation.isValid) {
                    await BaseController.flashError(req, 'tickets', 'ID inválido');
                    return res.redirect('/ticket');
                }
                ticket = await Ticket.find(req.params.id);
                if (!ticket) {
                    await BaseController.flashError(req, 'tickets', 'Ticket não encontrado');
                    return res.redirect('/ticket');
                }
                isEdit = true;
                // Buscar foto base64 se existir
                const photo = await Photo.where({ ticket_id: ticket.id }).first();
                if (photo && photo.base64) {
                    photoBase64 = photo.base64;
                }
            }

            return BaseController.view('ticket/edit', {
                title: isEdit ? 'Editar Ticket' : 'Novo Ticket',
                ticket,
                isEdit,
                events,
                categories,
                photoBase64
            }, res, req);
        } catch (error) {
            TicketController.log.error('Erro ao carregar formulário de ticket', { error: error.message });
            await BaseController.flashError(req, 'tickets', 'Erro ao carregar formulário');
            return res.redirect('/ticket');
        }
    }

    /**
     * Exibe formulário para geração de tickets
     */
    static async import(req, res) {
        
        const sessionData = BaseController.loadSession(req);
        if (!sessionData.user) {
            return res.redirect('/auth');
        }
        try {
            const events = await Event.get();
            const categories = await Category.get();
            return BaseController.view('ticket/import', {
                title: 'Importar Tickets',
                events,
                categories
            }, res, req);
        } catch (error) {
            TicketController.log.error('Erro ao carregar tela de importação de tickets', { error: error.message });
            await BaseController.flashError(req, 'tickets', 'Erro ao carregar tela de importação de tickets');
            return res.redirect('/');
        }
    }

    /**
     * Processa geração de tickets
     */
    static async importTickets(req, res) {
        const sessionData = BaseController.loadSession(req);
        if (!sessionData.user) {
            return res.redirect('/auth');
        }

        if (!req.files || Object.keys(req.files).length === 0) {
            await BaseController.flashError(req, 'tickets', 'Nenhum arquivo foi enviado.');
            return res.status(400).send('Nenhum arquivo foi enviado.');
        }
        
        try {
            const { event_id, category_id, active, master } = req.body;

            if (!event_id || !category_id || !req.files.file) {
                await BaseController.flashError(req, 'tickets', 'Preencha todos os campos obrigatórios e envie um arquivo CSV.');
                return res.redirect('/ticket/import');
            }

            const arquivo = req.files.file;
            const buffer = arquivo.data;
            const filePath = buffer.toString('utf-8');

            const content = filePath;
            const linhas = content.split(/\r?\n/).filter(l => l.trim().length > 0);
            let total = linhas.length;
            let importados = 0;
            let erros = 0;

            // Preparar dados para inserção em lote
            const ticketsToInsert = [];
            
            for (let linha of linhas) {
                // Esperado: Ticket;Nome;Email;RG;CPF;CE1;Status;Mestre
                // Exemplo: "03254521";"Fulano";"";"";"campoExtra1";"1";"0"
                const campos = linha.split(',').map(c => c.replace(/^"|"$/g, '').trim());
                if (campos.length < 1) {
                    erros++;
                    continue;
                }
                const code = campos[0];
                if (!code) {
                    erros++;
                    continue;
                }
                
                // Verifica duplicidade usando prioridade crítica
                const existe = (await Ticket.where({ code }).get()).length > 0;
                if (existe) {
                    erros++;
                    continue;
                }
                
                const data = {
                    event_id,
                    category_id,
                    code,
                    active: typeof active !== 'undefined' ? (active ? 1 : 0) : (campos[6] ? parseInt(campos[6]) : 1),
                    master: typeof master !== 'undefined' ? (master ? 1 : 0) : (campos[7] ? parseInt(campos[7]) : 0),
                    extrafield1: campos[5] || '',
                    user_id: sessionData.user.id,
                    fullname: campos[1] || '',
                    email: campos[2] || '',
                    extrafield2: campos[3] || '', // RG
                    extrafield3: campos[4] || ''  // CPF
                };
                
                ticketsToInsert.push(data);
            }

            // Inserir em lote usando transação
            if (ticketsToInsert.length > 0) {
                try {
                    await Ticket.insertBatch(ticketsToInsert);
                    importados = ticketsToInsert.length;
                } catch (e) {
                    erros += ticketsToInsert.length;
                    TicketController.log.error('Erro na inserção em lote', { error: e.message });
                }
            }

            await BaseController.flashWarning(req, 'tickets', `Arquivo: ${total} linhas. Tickets importados: ${importados}. Não importados: ${erros}.`);
            return res.redirect('/ticket/import');
        } catch (error) {
            TicketController.log.error('Erro ao importar tickets', { error: error.message });
            await BaseController.flashError(req, 'tickets', 'Erro ao importar tickets');
            return res.redirect('/ticket/import');
        }
    }

    /**
     * Gera código aleatório de ticket
     */
    static generateCode(size = 8) {
        let codigo = '';
        while (codigo.length < size) {
            codigo += Math.floor(Math.random() * 10);
        }
        // Remove zeros à esquerda
        codigo = codigo.replace(/^0+/, '');
        // Se ficou vazio, força um dígito diferente de zero no início
        if (!codigo || codigo.length < size) {
            codigo = (Math.floor(Math.random() * 9) + 1) + codigo;
            codigo = codigo.slice(0, size);
        }
        return codigo;
    }

    /**
     * Exibe formulário para geração de tickets
     */
    static async generate(req, res) {
        
        const sessionData = BaseController.loadSession(req);
        if (!sessionData.user) {
            return res.redirect('/auth');
        }
        try {
            const events = await Event.get();
            const categories = await Category.get();
            return BaseController.view('ticket/generate', {
                title: 'Gerar Tickets',
                events,
                categories
            }, res, req);
        } catch (error) {
            TicketController.log.error('Erro ao carregar tela de geração de tickets', { error: error.message });
            await BaseController.flashError(req, 'tickets', 'Erro ao carregar tela de geração de tickets');
            return res.redirect('/');
        }
    }

    /**
     * Processa geração de tickets
     */
    static async generateTickets(req, res) {
       
        const sessionData = BaseController.loadSession(req);
        if (!sessionData.user) {
            return res.redirect('/auth');
        }
        try {
            const { event_id, category_id, quantidade, tamanho, active, master, campoextra1 } = req.body;
            const qtd = parseInt(quantidade) || 0;
            const size = parseInt(tamanho) || 8;
            if (!event_id || !category_id || qtd <= 0 || size <= 0) {
                await BaseController.flashError(req, 'tickets', 'Preencha todos os campos obrigatórios corretamente.');
                return res.redirect('/ticket/generate');
            }
            let contErros = 0;
            let gerados = 0;

            // Preparar dados para inserção em lote
            const ticketsToInsert = [];
            
            for (let i = 0; i < qtd; i++) {
                let codigo;
                let tentativas = 0;
                let jaExiste = false;
                do {
                    codigo = TicketController.generateCode(size);
                    tentativas++;
                    // Não pode começar com zero
                    const resultado = await Ticket.where({code: codigo}).get();
                    jaExiste = resultado.length > 0;
                } while ((codigo.startsWith('0') || jaExiste) && tentativas < 10);
                if (tentativas >= 10) {
                    contErros++;
                    continue;
                }
                const data = {
                    event_id,
                    category_id,
                    code: codigo,
                    active: active ? 1 : 0,
                    master: master ? 1 : 0,
                    extrafield1: campoextra1 || '',
                    user_id: sessionData.user.id
                };
                ticketsToInsert.push(data);
            }

            // Inserir em lote usando transação
            if (ticketsToInsert.length > 0) {
                try {
                    await Ticket.insertBatch(ticketsToInsert);
                    gerados = ticketsToInsert.length;
                } catch (e) {
                    contErros += ticketsToInsert.length;
                    TicketController.log.error('Erro na inserção em lote', { error: e.message });
                }
            }

            if (contErros > 0) {
                await BaseController.flashWarning(req, 'tickets', `${gerados} tickets gerados com sucesso. ${contErros} não foram gerados por duplicidade ou erro.`);
            } else {
                await BaseController.flashSuccess(req, 'tickets', `${gerados} tickets gerados com sucesso!`);
            }
            return res.redirect('/ticket/generate');
        } catch (error) {
            TicketController.log.error('Erro ao gerar tickets', { error: error.message });
            await BaseController.flashError(req, 'tickets', 'Erro ao gerar tickets');
            return res.redirect('/ticket/generate');
        }
    }

    /**
     * Gera código aleatório de ticket
     */
    static generateCode(size = 8) {
        let codigo = '';
        while (codigo.length < size) {
            codigo += Math.floor(Math.random() * 10);
        }
        // Remove zeros à esquerda
        codigo = codigo.replace(/^0+/, '');
        // Se ficou vazio, força um dígito diferente de zero no início
        if (!codigo || codigo.length < size) {
            codigo = (Math.floor(Math.random() * 9) + 1) + codigo;
            codigo = codigo.slice(0, size);
        }
        return codigo;
    }

    

    /**
     * Busca ticket por código
     */
    static async findByCode(code) {
        return await Ticket.where({ code }).first();
    }

    /**
     * Cria um novo ticket
     */
    static async store(req, res) {
        const sessionData = BaseController.loadSession(req);
        if (!sessionData.user) {
            return res.redirect('/auth');
        }
        try {
            const validation = TicketValidator.validateCreate(req.body);
            if (!validation.isValid) {
                await BaseController.flashError(req, 'tickets', 'Dados inválidos');
                return res.redirect('/ticket/edit');
            }
            const data = req.body;
            // Usar prioridade crítica para operações de edição
            await Ticket.insert(data, 'critical');
            await BaseController.flashSuccess(req, 'tickets', 'Ticket criado com sucesso!');
            return res.redirect('/ticket');
        } catch (error) {
            TicketController.log.error('Erro ao criar ticket', { error: error.message });
            await BaseController.flashError(req, 'tickets', 'Erro ao criar ticket');
            return res.redirect('/ticket/edit');
        }
    }

    /**
     * Atualiza um ticket existente
     */
    static async update(req, res) {
        const sessionData = BaseController.loadSession(req);
        if (!sessionData.user) {
            return res.redirect('/auth');
        }
        try {
            const validation = TicketValidator.validateUpdate(req.body);
            if (!validation.isValid) {
                await BaseController.flashError(req, 'tickets', 'Dados inválidos');
                return res.redirect(`/ticket/edit/${req.params.id}`);
            }
            const data = req.body;
            // Usar prioridade crítica para operações de edição
            await Ticket.update(req.params.id, data, 'critical');
            await BaseController.flashSuccess(req, 'tickets', 'Ticket atualizado com sucesso!');
            return res.redirect('/ticket');
        } catch (error) {
            TicketController.log.error('Erro ao atualizar ticket', { error: error.message });
            await BaseController.flashError(req, 'tickets', 'Erro ao atualizar ticket');
            return res.redirect(`/ticket/edit/${req.params.id}`);
        }
    }
}

module.exports = TicketController; 