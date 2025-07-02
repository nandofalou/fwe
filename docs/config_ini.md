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

[server]
baseUrl = http://localhost:9000
port = 9000
cors = true
autostart = true
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

### `[server]`
- **baseUrl**: URL base da aplicação. Se não definido ou estiver em branco, o sistema monta dinamicamente a URL base a partir do endereço do request (ex: http://192.168.1.1:9000). Se definido, sempre será usado o valor do config.ini.
- **port**: Porta do servidor (padrão: 9000)
- **cors**: Habilita CORS
- **autostart**: Inicia o servidor automaticamente

#### Exemplo:
```ini
[server]
baseUrl = http://localhost:9000
port = 9000
cors = true
autostart = true
```

#### Comportamento do base_url()
- Se `baseUrl` estiver preenchido no config.ini, será usado esse valor.
- Se estiver em branco ou não existir, a função `base_url(path, req)` monta a URL base dinamicamente a partir do request (ex: `http://192.168.1.1:9000`).
- Se não houver request disponível, usa `http://localhost:{porta}` como fallback.

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

**Configuração de servidor:**
```ini
[server]
baseUrl = http://localhost:9000
port = 9000
cors = true
autostart = true
```

---

## Resumo

- O `config.ini` centraliza todas as configurações essenciais do sistema.
- Sempre revise e mantenha seguro este arquivo, especialmente em produção.
- Utilize as seções e exemplos deste manual para configurar corretamente seu ambiente.
- Em caso de dúvidas, consulte também os outros manuais em `/docs`.

---

Mantenha o padrão e consulte este guia sempre que precisar ajustar configurações!