const Database = require('./App/Helpers/Database');

async function checkEvents() {
    try {
        console.log('Inicializando conexão com banco de dados...');
        await Database.connect();
        
        console.log('Verificando eventos no banco de dados...');
        
        // Verifica se a tabela existe
        const tableExists = await Database.query("SHOW TABLES LIKE 'event'");
        console.log('Tabela event existe:', tableExists.length > 0);
        
        if (tableExists.length > 0) {
            // Conta total de eventos
            const countResult = await Database.query("SELECT COUNT(*) as total FROM event");
            console.log('Total de eventos:', countResult[0].total);
            
            // Lista os eventos
            const events = await Database.query("SELECT * FROM event ORDER BY created_at DESC LIMIT 5");
            console.log('Últimos 5 eventos:');
            events.forEach(event => {
                console.log(`- ID: ${event.id}, Nome: ${event.name}, Ativo: ${event.active}, Criado: ${event.created_at}`);
            });
        } else {
            console.log('Tabela event não encontrada. Verificando se é SQLite...');
            
            // Para SQLite, verifica de forma diferente
            const tables = await Database.query("SELECT name FROM sqlite_master WHERE type='table' AND name='event'");
            console.log('Tabela event no SQLite:', tables.length > 0);
            
            if (tables.length > 0) {
                const countResult = await Database.query("SELECT COUNT(*) as total FROM event");
                console.log('Total de eventos:', countResult[0].total);
                
                const events = await Database.query("SELECT * FROM event ORDER BY created_at DESC LIMIT 5");
                console.log('Últimos 5 eventos:');
                events.forEach(event => {
                    console.log(`- ID: ${event.id}, Nome: ${event.name}, Ativo: ${event.active}, Criado: ${event.created_at}`);
                });
            }
        }
        
        // Verifica se há usuários (necessário para criar eventos)
        try {
            const users = await Database.query("SELECT COUNT(*) as total FROM users");
            console.log('Total de usuários:', users[0].total);
        } catch (error) {
            console.log('Tabela users não encontrada ou erro ao consultar:', error.message);
        }
        
    } catch (error) {
        console.error('Erro ao verificar eventos:', error.message);
    } finally {
        await Database.close();
        process.exit(0);
    }
}

checkEvents(); 