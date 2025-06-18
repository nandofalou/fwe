const jwt = require('jsonwebtoken');
const config = require('../Config/config');

class AuthMiddleware {
    /**
     * Middleware para verificar se o usuário está autenticado
     * @param {Object} req - Requisição
     * @param {Object} res - Resposta
     * @param {Function} next - Próximo middleware
     */
    static async handle(req, res, next) {
        try {
            const authHeader = req.headers.authorization;

            if (!authHeader) {
                return res.status(401).json({
                    error: true,
                    message: 'Token não fornecido'
                });
            }

            const parts = authHeader.split(' ');

            if (parts.length !== 2) {
                return res.status(401).json({
                    error: true,
                    message: 'Token mal formatado'
                });
            }

            const [scheme, token] = parts;

            if (!/^Bearer$/i.test(scheme)) {
                return res.status(401).json({
                    error: true,
                    message: 'Token mal formatado'
                });
            }

            try {
                const decoded = jwt.verify(token, config.jwt.secret);
                req.user = decoded;
                return next();
            } catch (error) {
                return res.status(401).json({
                    error: true,
                    message: 'Token inválido'
                });
            }
        } catch (error) {
            return res.status(500).json({
                error: true,
                message: 'Erro interno do servidor'
            });
        }
    }
}

module.exports = AuthMiddleware; 