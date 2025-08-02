/**
 * Helper de segurança do framework FWE
 *
 * ATENÇÃO: Este helper é exportado já instanciado.
 * Use diretamente: Security.hashPassword(...)
 * NÃO use: new Security().hashPassword(...)
 */
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Event = require('./Event');

/**
 * Classe para manipulação de segurança
 */
class Security {
    constructor() {
        this.event = Event;
    }

    /**
     * Gera um hash
     * @param {string} data Dados
     * @param {string} algorithm Algoritmo (opcional)
     * @returns {string} Hash
     */
    hash(data, algorithm = 'sha256') {
        return crypto.createHash(algorithm).update(data).digest('hex');
    }

    /**
     * Gera um hash de senha
     * @param {string} password Senha
     * @param {number} saltRounds Rodadas de salt (opcional)
     * @returns {Promise<string>} Hash
     */
    async hashPassword(password, saltRounds = 10) {
        const hash = await bcrypt.hash(password, saltRounds);
        this.event.emit('security:password:hashed', hash);
        return hash;
    }

    /**
     * Verifica uma senha
     * @param {string} password Senha
     * @param {string} hash Hash
     * @returns {Promise<boolean>} true se válida
     */
    async verifyPassword(password, hash) {
        const isValid = await bcrypt.compare(password, hash);
        this.event.emit('security:password:verified', isValid);
        return isValid;
    }

    /**
     * Gera um token JWT
     * @param {Object} payload Dados
     * @param {string} secret Chave secreta
     * @param {Object} options Opções (opcional)
     * @returns {string} Token
     */
    generateToken(payload, secret, options = {}) {
        const token = jwt.sign(payload, secret, options);
        this.event.emit('security:token:generated', token);
        return token;
    }

    /**
     * Verifica um token JWT
     * @param {string} token Token
     * @param {string} secret Chave secreta
     * @returns {Object|null} Dados
     */
    verifyToken(token, secret) {
        try {
            const payload = jwt.verify(token, secret);
            this.event.emit('security:token:verified', payload);
            return payload;
        } catch (err) {
            this.event.emit('security:token:invalid', err);
            return null;
        }
    }

    /**
     * Gera uma chave aleatória
     * @param {number} length Tamanho (opcional)
     * @returns {string} Chave
     */
    generateKey(length = 32) {
        return crypto.randomBytes(length).toString('hex');
    }

    /**
     * Criptografa dados
     * @param {string} data Dados
     * @param {string} key Chave
     * @param {string} algorithm Algoritmo (opcional)
     * @returns {string} Dados criptografados
     */
    encrypt(data, key, algorithm = 'aes-256-cbc') {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(algorithm, key, iv);
        const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
        const result = iv.toString('hex') + ':' + encrypted.toString('hex');
        this.event.emit('security:data:encrypted', result);
        return result;
    }

    /**
     * Descriptografa dados
     * @param {string} data Dados criptografados
     * @param {string} key Chave
     * @param {string} algorithm Algoritmo (opcional)
     * @returns {string} Dados
     */
    decrypt(data, key, algorithm = 'aes-256-cbc') {
        const [ivHex, encryptedHex] = data.split(':');
        const iv = Buffer.from(ivHex, 'hex');
        const encrypted = Buffer.from(encryptedHex, 'hex');
        const decipher = crypto.createDecipheriv(algorithm, key, iv);
        const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
        const result = decrypted.toString();
        this.event.emit('security:data:decrypted', result);
        return result;
    }

    /**
     * Gera um salt
     * @param {number} length Tamanho (opcional)
     * @returns {string} Salt
     */
    generateSalt(length = 16) {
        return crypto.randomBytes(length).toString('hex');
    }

    /**
     * Gera um nonce
     * @param {number} length Tamanho (opcional)
     * @returns {string} Nonce
     */
    generateNonce(length = 16) {
        return crypto.randomBytes(length).toString('hex');
    }

    /**
     * Gera um HMAC
     * @param {string} data Dados
     * @param {string} key Chave
     * @param {string} algorithm Algoritmo (opcional)
     * @returns {string} HMAC
     */
    generateHmac(data, key, algorithm = 'sha256') {
        return crypto.createHmac(algorithm, key).update(data).digest('hex');
    }

    /**
     * Verifica um HMAC
     * @param {string} data Dados
     * @param {string} key Chave
     * @param {string} hmac HMAC
     * @param {string} algorithm Algoritmo (opcional)
     * @returns {boolean} true se o HMAC for válido
     */
    verifyHmac(data, key, hmac, algorithm = 'sha256') {
        const calculatedHmac = this.generateHmac(data, key, algorithm);
        return calculatedHmac === hmac;
    }

    /**
     * Gera um token CSRF
     * @returns {string} Token
     */
    generateCsrfToken() {
        const token = crypto.randomBytes(32).toString('hex');
        this.event.emit('security:csrf:generated', token);
        return token;
    }

    /**
     * Verifica um token CSRF
     * @param {string} token Token
     * @param {string} storedToken Token armazenado
     * @returns {boolean} true se válido
     */
    verifyCsrfToken(token, storedToken) {
        const isValid = token === storedToken;
        this.event.emit('security:csrf:verified', isValid);
        return isValid;
    }

    /**
     * Gera um token de redefinição de senha
     * @param {Object} payload Dados
     * @returns {string} Token
     */
    generatePasswordResetToken(payload) {
        const token = this.generateToken(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
        this.event.emit('security:password_reset:generated', token);
        return token;
    }

    /**
     * Verifica um token de redefinição de senha
     * @param {string} token Token
     * @returns {Object|null} Dados
     */
    verifyPasswordResetToken(token) {
        const payload = this.verifyToken(token, process.env.JWT_SECRET);
        this.event.emit('security:password_reset:verified', payload);
        return payload;
    }

    /**
     * Gera um token de verificação de email
     * @param {Object} payload Dados
     * @returns {string} Token
     */
    generateEmailVerificationToken(payload) {
        const token = this.generateToken(payload, process.env.JWT_SECRET, { expiresIn: '24h' });
        this.event.emit('security:email_verification:generated', token);
        return token;
    }

    /**
     * Verifica um token de verificação de email
     * @param {string} token Token
     * @returns {Object|null} Dados
     */
    verifyEmailVerificationToken(token) {
        const payload = this.verifyToken(token, process.env.JWT_SECRET);
        this.event.emit('security:email_verification:verified', payload);
        return payload;
    }

    /**
     * Gera um token de autenticação de dois fatores
     * @param {Object} payload Dados
     * @returns {string} Token
     */
    generateTwoFactorToken(payload) {
        const token = this.generateToken(payload, process.env.JWT_SECRET, { expiresIn: '5m' });
        this.event.emit('security:two_factor:generated', token);
        return token;
    }

    /**
     * Verifica um token de autenticação de dois fatores
     * @param {string} token Token
     * @returns {Object|null} Dados
     */
    verifyTwoFactorToken(token) {
        const payload = this.verifyToken(token, process.env.JWT_SECRET);
        this.event.emit('security:two_factor:verified', payload);
        return payload;
    }

    /**
     * Gera um token de sessão
     * @param {Object} payload Dados
     * @returns {string} Token
     */
    generateSessionToken(payload) {
        const token = this.generateToken(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
        this.event.emit('security:session:generated', token);
        return token;
    }

    /**
     * Verifica um token de sessão
     * @param {string} token Token
     * @returns {Object|null} Dados
     */
    verifySessionToken(token) {
        const payload = this.verifyToken(token, process.env.JWT_SECRET);
        this.event.emit('security:session:verified', payload);
        return payload;
    }

    /**
     * Gera um token de API
     * @param {Object} payload Dados
     * @returns {string} Token
     */
    generateApiToken(payload) {
        const token = this.generateToken(payload, process.env.JWT_SECRET, { expiresIn: '30d' });
        this.event.emit('security:api:generated', token);
        return token;
    }

    /**
     * Verifica um token de API
     * @param {string} token Token
     * @returns {Object|null} Dados
     */
    verifyApiToken(token) {
        const payload = this.verifyToken(token, process.env.JWT_SECRET);
        this.event.emit('security:api:verified', payload);
        return payload;
    }

    /**
     * Gera um token de acesso
     * @param {Object} payload Dados
     * @returns {string} Token
     */
    generateAccessToken(payload) {
        const token = this.generateToken(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
        this.event.emit('security:access:generated', token);
        return token;
    }

    /**
     * Verifica um token de acesso
     * @param {string} token Token
     * @returns {Object|null} Dados
     */
    verifyAccessToken(token) {
        const payload = this.verifyToken(token, process.env.JWT_SECRET);
        this.event.emit('security:access:verified', payload);
        return payload;
    }

    /**
     * Gera um token de atualização
     * @param {Object} payload Dados
     * @returns {string} Token
     */
    generateRefreshToken(payload) {
        const token = this.generateToken(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
        this.event.emit('security:refresh:generated', token);
        return token;
    }

    /**
     * Verifica um token de atualização
     * @param {string} token Token
     * @returns {Object|null} Dados
     */
    verifyRefreshToken(token) {
        const payload = this.verifyToken(token, process.env.JWT_SECRET);
        this.event.emit('security:refresh:verified', payload);
        return payload;
    }
}

module.exports = new Security(); 