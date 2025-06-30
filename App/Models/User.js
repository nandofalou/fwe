const BaseModel = require('./BaseModel');
const bcrypt = require('bcryptjs');

class User extends BaseModel {
    constructor() {
        super();
        this.table = 'users';
        this.primaryKey = 'id';
        this.allowedFields = ['name', 'email', 'pass', 'active', 'permission_id'];
    }

    /**
     * Cria o usuário padrão
     */
    static async createDefaultUser() {
        const pass = await bcrypt.hash('1234', 10);
        const defaultUser = {
            name: 'Administrador',
            email: 'admin@admin.com',
            pass: pass,
            permission_id: 1,
            active: 1
        };
        return await this.insert(defaultUser);
    }

    /**
     * Busca um usuário pelo email
     * @param {string} email Email do usuário
     * @returns {Promise} Usuário encontrado
     */
    static async findByEmail(email) {
        return await this.where({ email }).first();
    }

    /**
     * Cria um novo usuário com senha criptografada
     * @param {Object} data Dados do usuário
     * @returns {Promise} Usuário criado
     */
    static async insert(data) {
        if (data.pass && !data.pass.startsWith('$2')) {
            data.pass = await bcrypt.hash(data.pass, 10);
        }
        return await super.insert(data);
    }

    /**
     * Atualiza um usuário com senha criptografada
     * @param {number} id ID do usuário
     * @param {Object} data Dados do usuário
     * @returns {Promise} Usuário atualizado
     */
    static async update(id, data) {
        if (data.pass && !data.pass.startsWith('$2')) {
            data.pass = await bcrypt.hash(data.pass, 10);
        }
        return await super.update(id, data);
    }
}

module.exports = User; 