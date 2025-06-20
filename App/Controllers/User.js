const BaseController = require('./BaseController');
const UserModel = require('../Models/User');

class User extends BaseController {
    constructor() {
        super();
        this.model = new UserModel();
    }

    /**
     * @swagger
     * /users:
     *   get:
     *     summary: Lista todos os usuários
     *     tags: [Users]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Lista de usuários
     */
    async index(req, res) {
        try {
            const users = await this.model.findAll();
            return this.successResponse(res, { users });
        } catch (error) {
            console.error('Erro ao listar usuários:', error);
            return this.errorResponse(res, 500, 'Erro ao listar usuários');
        }
    }

    /**
     * @swagger
     * /users:
     *   post:
     *     summary: Cria um novo usuário
     *     tags: [Users]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - name
     *               - email
     *               - password
     *             properties:
     *               name:
     *                 type: string
     *               email:
     *                 type: string
     *                 format: email
     *               password:
     *                 type: string
     *     responses:
     *       201:
     *         description: Usuário criado com sucesso
     */
    async create(req, res) {
        try {
            const { name, email, password } = req.body;

            // Validação básica
            if (!name || !email || !password) {
                return this.errorResponse(res, 400, 'Nome, email e senha são obrigatórios');
            }

            // Verifica se email já existe
            const existingUser = await this.model.findByEmail(email);
            if (existingUser) {
                return this.errorResponse(res, 400, 'Email já cadastrado');
            }

            const user = await this.model.create({ name, email, pass });
            return this.successResponse(res, { user }, 'Usuário criado com sucesso', 201);
        } catch (error) {
            console.error('Erro ao criar usuário:', error);
            return this.errorResponse(res, 500, 'Erro ao criar usuário');
        }
    }

    /**
     * @swagger
     * /users/{id}:
     *   get:
     *     summary: Busca um usuário por ID
     *     tags: [Users]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *     responses:
     *       200:
     *         description: Usuário encontrado
     *       404:
     *         description: Usuário não encontrado
     */
    async show(req, res) {
        try {
            const user = await this.model.findById(req.params.id);
            if (!user) {
                return this.errorResponse(res, 404, 'Usuário não encontrado');
            }
            return this.successResponse(res, { user });
        } catch (error) {
            console.error('Erro ao buscar usuário:', error);
            return this.errorResponse(res, 500, 'Erro ao buscar usuário');
        }
    }

    /**
     * @swagger
     * /users/{id}:
     *   put:
     *     summary: Atualiza um usuário
     *     tags: [Users]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               name:
     *                 type: string
     *               email:
     *                 type: string
     *                 format: email
     *               password:
     *                 type: string
     *     responses:
     *       200:
     *         description: Usuário atualizado com sucesso
     *       404:
     *         description: Usuário não encontrado
     */
    async update(req, res) {
        try {
            const user = await this.model.findById(req.params.id);
            if (!user) {
                return this.errorResponse(res, 404, 'Usuário não encontrado');
            }

            const { name, email, password } = req.body;
            const updateData = {};

            if (name) updateData.name = name;
            if (email) updateData.email = email;
            if (password) updateData.pass = password;

            const updatedUser = await this.model.update(req.params.id, updateData);
            return this.successResponse(res, { user: updatedUser }, 'Usuário atualizado com sucesso');
        } catch (error) {
            console.error('Erro ao atualizar usuário:', error);
            return this.errorResponse(res, 500, 'Erro ao atualizar usuário');
        }
    }

    /**
     * @swagger
     * /users/{id}:
     *   delete:
     *     summary: Remove um usuário
     *     tags: [Users]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *     responses:
     *       200:
     *         description: Usuário removido com sucesso
     *       404:
     *         description: Usuário não encontrado
     */
    async delete(req, res) {
        try {
            const user = await this.model.findById(req.params.id);
            if (!user) {
                return this.errorResponse(res, 404, 'Usuário não encontrado');
            }

            await this.model.delete(req.params.id);
            return this.successResponse(res, null, 'Usuário removido com sucesso');
        } catch (error) {
            console.error('Erro ao remover usuário:', error);
            return this.errorResponse(res, 500, 'Erro ao remover usuário');
        }
    }
}

module.exports = User; 