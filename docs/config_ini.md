# Manual do config.ini

O arquivo `config.ini` é o principal arquivo de configuração do framework. Ele centraliza as opções de banco de dados, logging, e outros parâmetros do sistema.

---

## Onde o config.ini é criado?

- O arquivo é criado automaticamente no diretório do usuário na primeira execução do sistema.
- O caminho padrão é algo como:
  - **Windows:** `C:\Users\<seu-usuario>\fwe\config.ini`
  - **Linux/Mac:** `/home/<seu-usuario>/fwe/config.ini`
- Você pode editar esse arquivo manualmente para ajustar as configurações do sistema.

---

## Estrutura Básica do config.ini

O arquivo é dividido em seções, cada uma iniciada por um nome entre colchetes, por exemplo `[database]`.

### Exemplo completo:
```ini
[database]
driver = sqlite ; ou mysql

[database.sqlite]
path = ./database.sqlite

[database.mysql]
host = localhost
user = seu_usuario
password = sua_senha
database = seu_banco
port = 3306 ; (opcional, padrão 3306)
charset = utf8mb4

[logging]
console = true
file = true
path = ./logs

[autostart]
enabled = false
```

---

## Seções e Opções Comuns

### `[database]`
- **driver**: `sqlite` ou `mysql` (define o tipo de banco de dados)

### `[database.sqlite]`
- **path**: Caminho do arquivo do banco SQLite

### `[database.mysql]`
- **host**: Endereço do servidor MySQL
- **user**: Usuário do banco
- **password**: Senha do banco
- **database**: Nome do banco
- **port**: Porta (opcional, padrão 3306)
- **charset**: Charset (opcional, padrão utf8mb4)

### `[logging]`
- **console**: `true` ou `false` — Exibe logs no console
- **file**: `true` ou `false` — Salva logs em arquivos
- **path**: Caminho dos arquivos de log (padrão: ./logs)

### `[autostart]`
- **enabled**: `true` ou `false` — Inicia o servidor automaticamente ao abrir o app

---

## Dicas e Boas Práticas

- Sempre reinicie o sistema após alterar o `config.ini` para garantir que as novas configurações sejam aplicadas.
- Mantenha o arquivo seguro, especialmente se contiver senhas de banco de dados.
- Para ambientes de produção, utilize caminhos absolutos e revise permissões de acesso ao arquivo.
- O sistema detecta automaticamente se deve usar SQLite ou MySQL conforme o driver configurado.

---

## Exemplo de uso prático

**Configuração para SQLite:**
```ini
[database]
driver = sqlite

[database.sqlite]
path = ./database.sqlite
```

**Configuração para MySQL:**
```ini
[database]
driver = mysql

[database.mysql]
host = localhost
user = root
password = minha_senha
database = meu_banco
port = 3306
charset = utf8mb4
```

**Configuração de logging:**
```ini
[logging]
console = true
file = true
path = ./logs
```

---

## Resumo

- O `config.ini` é essencial para o funcionamento do sistema.
- Permite configurar banco de dados, logging, autostart e outros recursos.
- Fica salvo no diretório do usuário e pode ser editado manualmente.

Mantenha sempre um backup do seu `config.ini` para evitar perda de configurações importantes! 