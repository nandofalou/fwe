const BaseModel = require('./BaseModel');
const bcrypt = require('bcryptjs');

class User extends BaseModel {
    constructor() {
        super();
        this.table = 'users';
    }

    /**
     * Inicializa a tabela de usuários se não existir
     */
    async initializeTable() {
        const query = `
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `;

        await this.db.query(query);

        // Verifica se existe usuário padrão
        const users = await this.findAll();
        if (users.length === 0) {
            await this.createDefaultUser();
        }
    }

    /**
     * Cria o usuário padrão
     */
    async createDefaultUser() {
        const defaultUser = {
            name: 'Administrador',
            email: 'admin@admin.com',
            password: 'admin123'
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
        if (data.password) {
            data.password = await bcrypt.hash(data.password, 10);
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
        if (data.password) {
            data.password = await bcrypt.hash(data.password, 10);
        }
        return super.update(id, data);
    }
}

module.exports = User; 