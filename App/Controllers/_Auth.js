const BaseController = require('./BaseController');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const UserModel = require('../Models/User');

class Auth extends BaseController {
    constructor() {
        super();
        this.model = new UserModel();
    }

    /**
     * @swagger
     * /auth/login:
     *   post:
     *     summary: Autentica um usuário
     *     tags: [Auth]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - email
     *               - password
     *             properties:
     *               email:
     *                 type: string
     *                 format: email
     *               password:
     *                 type: string
     *     responses:
     *       200:
     *         description: Login realizado com sucesso
     *       401:
     *         description: Credenciais inválidas
     */
    async login(req, res) {
        try {
            const { email, password } = req.body;

            // Validação básica
            if (!email || !password) {
                return this.errorResponse(res, 400, 'Email e senha são obrigatórios');
            }

            // Busca usuário
            const user = await this.model.findByEmail(email);
            if (!user) {
                return this.errorResponse(res, 401, 'Credenciais inválidas');
            }

            // Verifica senha
            const isValidPassword = await bcrypt.compare(password, user.pass);
            if (!isValidPassword) {
                return this.errorResponse(res, 401, 'Credenciais inválidas');
            }

            // Gera token JWT
            const token = jwt.sign(
                { 
                    id: user.id,
                    email: user.email,
                    name: user.name
                },
                process.env.JWT_SECRET || 'your-secret-key',
                { expiresIn: '24h' }
            );

            return this.successResponse(res, {
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name
                }
            }, 'Login realizado com sucesso');
        } catch (error) {
            console.error('Erro no login:', error);
            return this.errorResponse(res, 500, 'Erro ao realizar login');
        }
    }

    /**
     * Middleware para verificar autenticação
     * @param {Request} req Objeto de requisição do Express
     * @param {Response} res Objeto de resposta do Express
     * @param {Function} next Função next do Express
     */
    static async verifyToken(req, res, next) {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ error: 'Token não fornecido' });
        }

        const token = authHeader.split(' ')[1];

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
            req.user = decoded;
            next();
        } catch (error) {
            return res.status(401).json({ error: 'Token inválido' });
        }
    }
}

module.exports = Auth; 