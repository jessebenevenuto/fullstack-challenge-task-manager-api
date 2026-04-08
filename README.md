<p align="center">
  <img src=".github/preview.png" width="200" alt="Nest Logo" />
</p>

<p align="center">
 <img src="https://img.shields.io/static/v1?label=PRs&message=welcome&color=5DC147&labelColor=000000" alt="PRs welcome!" />

  <img alt="License" src="https://img.shields.io/static/v1?label=license&message=MIT&color=5DC147&labelColor=000000">
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

## 📝 Licença

Esse projeto está sob a licença MIT. Veja o arquivo [LICENSE](.github/LICENSE.md) para mais detalhes.

---

Feito com 💜 by Rocketseat :wave: [Participe da nossa comunidade!](https://discordapp.com/invite/gCRAFhc)

<!--START_SECTION:footer-->

<br />
<br />

<p align="center">
  <a href="https://discord.gg/rocketseat" target="_blank">
    <img align="center" src="https://storage.googleapis.com/golden-wind/comunidade/rodape.svg" alt="banner"/>
  </a>
