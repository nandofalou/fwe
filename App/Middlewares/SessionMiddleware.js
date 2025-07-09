const Session = require('../Helpers/Session');
const cookie = require('cookie');

const SESSION_COOKIE = 'fwe_session_id';
const SESSION_TTL = 60 * 60 * 24; // 1 dia

module.exports = async function SessionMiddleware(req, res, next) {
    let sessionId = null;
    if (req.headers.cookie) {
        const cookies = cookie.parse(req.headers.cookie);
        sessionId = cookies[SESSION_COOKIE];
    }

    let session = null;
    if (sessionId) {
        session = await Session.get(sessionId);
    }

    if (!session) {
        // Cria nova sessão
        sessionId = await Session.create({
            ip_address: req.ip,
            user_agent: req.headers['user-agent'] || '',
            ttl: SESSION_TTL
        });
        // Seta cookie de sessão
        res.setHeader('Set-Cookie', cookie.serialize(SESSION_COOKIE, sessionId, {
            httpOnly: true,
            path: '/',
            maxAge: SESSION_TTL
        }));
        session = await Session.get(sessionId);
    }

    req.sessionId = sessionId;
    req.session = session;
    next();
}; 