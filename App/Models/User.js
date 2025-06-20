const BaseModel = require('./BaseModel');
const bcrypt = require('bcryptjs');

class User extends BaseModel {
    constructor() {
        super();
        this.table = 'users';
    }

    /**
     * Cria o usuário padrão
     */
    async createDefaultUser() {
        const pass = await bcrypt.hash('1234', 10);
        const defaultUser = {
            name: 'Administrador',
            email: 'admin@admin.com',
            pass: pass,
            permission_id: 1,
            active: 1
        };
        await this.create(defaultUser);
    }

    /**
     * Busca um usuário pelo email
     * @param {string} email Email do usuário
     * @returns {Promise} Usuário encontrado
     */
    async findByEmail(email) {
        const results = await this.db.query(
            `SELECT * FROM ${this.table} WHERE email = ?`,
            [email]
        );
        return results[0];
    }

    /**
     * Cria um novo usuário com senha criptografada
     * @param {Object} data Dados do usuário
     * @returns {Promise} Usuário criado
     */
    async create(data) {
        if (data.pass && !data.pass.startsWith('$2')) {
            data.pass = await bcrypt.hash(data.pass, 10);
        }
        return super.create(data);
    }

    /**
     * Atualiza um usuário com senha criptografada
     * @param {number} id ID do usuário
     * @param {Object} data Dados do usuário
     * @returns {Promise} Usuário atualizado
     */
    async update(id, data) {
        if (data.pass) {
            data.pass = await bcrypt.hash(data.pass, 10);
        }
        return super.update(id, data);
    }
}

module.exports = User; 