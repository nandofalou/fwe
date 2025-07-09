const BaseController = require('./BaseController');

class DashboardController extends BaseController {
    static async index(req, res) {
        // Verifica se o usuário está logado
        const sessionData = BaseController.loadSession(req);
        if (!sessionData.user) {
            return res.redirect('/auth');
        }

        return BaseController.view('dashboard/index', {
            title: 'Dashboard - FWE'
        }, res, req);
    }
}

module.exports = DashboardController; 