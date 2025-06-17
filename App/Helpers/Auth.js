const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Config = require('./Config');

/**
 * Classe para manipulação de autenticação
 */
class Auth {
    /**
     * Gera um token JWT
     * @param {Object} payload Dados do token
     * @returns {string} Token gerado
     */
    static generateToken(payload) {
        const secret = Config.get('server.jwt_secret', 'your-secret-key');
        const expiresIn = Config.get('server.jwt_expires', '24h');
        return jwt.sign(payload, secret, { expiresIn });
    }

    /**
     * Verifica um token JWT
     * @param {string} token Token a ser verificado
     * @returns {Object|null} Dados do token ou null
     */
    static verifyToken(token) {
        try {
            const secret = Config.get('server.jwt_secret', 'your-secret-key');
            return jwt.verify(token, secret);
        } catch (error) {
            return null;
        }
    }

    /**
     * Gera um hash de senha
     * @param {string} password Senha a ser hasheada
     * @returns {Promise<string>} Hash gerado
     */
    static async hashPassword(password) {
        const salt = await bcrypt.genSalt(10);
        return bcrypt.hash(password, salt);
    }

    /**
     * Verifica se uma senha corresponde a um hash
     * @param {string} password Senha a ser verificada
     * @param {string} hash Hash a ser comparado
     * @returns {Promise<boolean>} true se corresponder
     */
    static async verifyPassword(password, hash) {
        return bcrypt.compare(password, hash);
    }

    /**
     * Middleware de autenticação
     * @param {Object} req Objeto de requisição
     * @param {Object} res Objeto de resposta
     * @param {Function} next Função de callback
     */
    static middleware(req, res, next) {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                status: 401,
                message: 'Token não fornecido'
            });
        }

        const parts = authHeader.split(' ');

        if (parts.length !== 2) {
            return res.status(401).json({
                status: 401,
                message: 'Token mal formatado'
            });
        }

        const [scheme, token] = parts;

        if (!/^Bearer$/i.test(scheme)) {
            return res.status(401).json({
                status: 401,
                message: 'Token mal formatado'
            });
        }

        const decoded = this.verifyToken(token);

        if (!decoded) {
            return res.status(401).json({
                status: 401,
                message: 'Token inválido'
            });
        }

        req.user = decoded;
        return next();
    }

    /**
     * Middleware de autorização
     * @param {Array} roles Roles permitidas
     * @returns {Function} Middleware
     */
    static authorize(roles = []) {
        return (req, res, next) => {
            if (!req.user) {
                return res.status(401).json({
                    status: 401,
                    message: 'Não autorizado'
                });
            }

            if (roles.length && !roles.includes(req.user.role)) {
                return res.status(403).json({
                    status: 403,
                    message: 'Acesso negado'
                });
            }

            return next();
        };
    }

    /**
     * Gera um token de refresh
     * @param {Object} payload Dados do token
     * @returns {string} Token gerado
     */
    static generateRefreshToken(payload) {
        const secret = Config.get('server.jwt_refresh_secret', 'your-refresh-secret-key');
        const expiresIn = Config.get('server.jwt_refresh_expires', '7d');
        return jwt.sign(payload, secret, { expiresIn });
    }

    /**
     * Verifica um token de refresh
     * @param {string} token Token a ser verificado
     * @returns {Object|null} Dados do token ou null
     */
    static verifyRefreshToken(token) {
        try {
            const secret = Config.get('server.jwt_refresh_secret', 'your-refresh-secret-key');
            return jwt.verify(token, secret);
        } catch (error) {
            return null;
        }
    }

    /**
     * Gera um token de recuperação de senha
     * @param {Object} payload Dados do token
     * @returns {string} Token gerado
     */
    static generatePasswordResetToken(payload) {
        const secret = Config.get('server.jwt_reset_secret', 'your-reset-secret-key');
        const expiresIn = Config.get('server.jwt_reset_expires', '1h');
        return jwt.sign(payload, secret, { expiresIn });
    }

    /**
     * Verifica um token de recuperação de senha
     * @param {string} token Token a ser verificado
     * @returns {Object|null} Dados do token ou null
     */
    static verifyPasswordResetToken(token) {
        try {
            const secret = Config.get('server.jwt_reset_secret', 'your-reset-secret-key');
            return jwt.verify(token, secret);
        } catch (error) {
            return null;
        }
    }

    /**
     * Gera um token de verificação de email
     * @param {Object} payload Dados do token
     * @returns {string} Token gerado
     */
    static generateEmailVerificationToken(payload) {
        const secret = Config.get('server.jwt_verify_secret', 'your-verify-secret-key');
        const expiresIn = Config.get('server.jwt_verify_expires', '24h');
        return jwt.sign(payload, secret, { expiresIn });
    }

    /**
     * Verifica um token de verificação de email
     * @param {string} token Token a ser verificado
     * @returns {Object|null} Dados do token ou null
     */
    static verifyEmailVerificationToken(token) {
        try {
            const secret = Config.get('server.jwt_verify_secret', 'your-verify-secret-key');
            return jwt.verify(token, secret);
        } catch (error) {
            return null;
        }
    }
}

module.exports = Auth; 