# Migrations do banco de dados

- Os arquivos devem ser nomeados com prefixo numérico crescente, por exemplo: 001_create_table.sql, 002_seed_data.sql
- Cada arquivo deve conter apenas um comando ou grupo de comandos relacionados
- Para criar uma nova migration, adicione um novo arquivo .sql nesta pasta
- As migrations são aplicadas em ordem crescente de nome 