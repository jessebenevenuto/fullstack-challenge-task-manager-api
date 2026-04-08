<p align="center">
 <img src="https://img.shields.io/static/v1?label=PRs&message=welcome&color=F7B733&labelColor=000000" alt="PRs welcome!" />

  <img alt="License" src="https://img.shields.io/static/v1?label=license&message=MIT&color=F7B733&labelColor=000000">
</p>

## Descrição

API para um sistema de Gerenciamento de Tarefas com Node.js.

## Instalação

```bash
$ npm install
```

## Configuração o ambiente

Crie um arquivo `.env` na raiz com as variáveis:
   ```
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/gerenciadortarefas?schema=public"
   JWT_SECRET="sua_chave_secreta"
   PORT=3333
   ```

## Inicialize o banco de dados (Docker)

 ```bash
   docker-compose up -d ou docker compose up -d
   ```

## Execute as migrations

 ```bash
   npx prisma migrate deploy
   ```

## Inicialize o servidor

```bash
   npm run dev
   ```

## Test

```bash
npm run test:dev
```

## License

[MIT licensed](LICENSE).
