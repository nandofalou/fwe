const Session = require('../Helpers/Session');
const cookie = require('cookie');

const SESSION_COOKIE = 'fwe_session_id';
const SESSION_TTL = 60 * 60 * 24; // 1 dia

module.exports = async function SessionMiddleware(req, res, next) {
    let sessionId = null;
    
    // Verifica se há cookies na requisição
    if (req.headers.cookie) {
        try {
            const cookies = cookie.parse(req.headers.cookie);
            sessionId = cookies[SESSION_COOKIE];
        } catch (error) {
            // Erro ao parsear cookies - continua sem sessão
        }
    }

    let session = null;
    if (sessionId) {
        try {
            session = await Session.get(sessionId);
        } catch (error) {
            // Erro ao recuperar sessão - continua sem sessão
            session = null;
        }
    }

    if (!session) {
        try {
            // Cria nova sessão apenas se não existir cookie válido
            sessionId = await Session.create({
                ip_address: req.ip,
                user_agent: req.headers['user-agent'] || '',
                ttl: SESSION_TTL
            });
            
            // Seta cookie de sessão com configurações mais robustas
            const cookieOptions = {
                httpOnly: true,
                path: '/',
                maxAge: SESSION_TTL,
                secure: process.env.NODE_ENV === 'production', // HTTPS apenas em produção
                sameSite: 'lax'
            };
            
            res.setHeader('Set-Cookie', cookie.serialize(SESSION_COOKIE, sessionId, cookieOptions));
            session = await Session.get(sessionId);
        } catch (error) {
            // Em caso de erro, continua sem sessão
            sessionId = null;
            session = null;
        }
    } else {
        try {
            // Se a sessão existe, atualiza o timestamp de acesso
            await Session.updateLastAccess(sessionId);
        } catch (error) {
            // Erro ao atualizar sessão - continua mesmo assim
        }
    }

    req.sessionId = sessionId;
    req.session = session;
    next();
}; 