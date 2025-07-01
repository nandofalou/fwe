const User = require('../Models/User');
const Permission = require('../Models/Permission');

const InstallController = {
    async install(req, res) {
        try {
            // Verifica se a tabela users está vazia
            const total = await User.count();
            if (total > 0) {
                return res.status(400).json({ message: 'Já existe usuário cadastrado.' });
            }
            // Busca o id da permissão MASTER
            const perm = await Permission.where({ name: 'MASTER' }).first();
            if (!perm) {
                return res.status(400).json({ message: 'Permissão MASTER não encontrada.' });
            }
            // Cria usuário admin
            await User.insert({
                email: 'admin@admin.com',
                name: 'Administrador',
                pass: '123456',
                active: 1,
                permission_id: perm.id
            });
            return res.json({ message: 'Usuário admin criado com sucesso.' });
        } catch (error) {
            return res.status(500).json({ message: 'Erro ao criar usuário admin.', error: error.message });
        }
    }
};

module.exports = InstallController; 