# PH.static

Portfólio em React + TypeScript + Vite, preparado para versionamento no GitHub e deploy no Cloudflare Pages.

## Stack

- React 18
- TypeScript
- Vite 6
- Cloudflare Pages

## Rodando localmente

### Pré-requisitos
- Node.js 20+ recomendado
- npm

### Instalação
```bash
npm install
```

### Ambiente local
Este projeto está configurado para **não versionar** arquivos `.env`.

Se você precisar de variáveis locais, crie um arquivo como:

```bash
.env.local
```

## Desenvolvimento
```bash
npm run dev
```

## Build de produção
```bash
npm run build
```

A saída final será gerada em:

```bash
dist/
```

## Compatibilidade com Cloudflare Pages

Este repositório já foi ajustado para funcionar corretamente no Cloudflare:

- `vite.config.ts` simplificado para build estático
- `wrangler.toml` configurado para deploy estático com SPA fallback via `[assets]`
- `.gitignore` atualizado para impedir envio de `.env`

## Deploy no Cloudflare Pages

### Opção 1 — via GitHub
Conecte este repositório no Cloudflare Pages com estas configurações:

- **Framework preset:** `Vite`
- **Build command:** `npm run build`
- **Build output directory:** `dist`

### Opção 2 — via Wrangler
```bash
npm run cf:deploy
```

Esse comando:
- roda o build com `npm run build`
- publica os arquivos estáticos de `dist/` usando `wrangler deploy`

Se preferir executar direto:
```bash
wrangler deploy
```

## Publicando no GitHub

Repositório de destino:

```bash
https://github.com/armazempreta13/ph.static13
```

Comandos para publicar:

```bash
git init
git branch -M main
git remote add origin https://github.com/armazempreta13/ph.static13.git
git add .
git commit -m "chore: prepare project for Cloudflare Pages deploy"
git push -u origin main
```

## Observações importantes

- Não envie `.env` para o GitHub.
- Segredos não devem ficar no frontend estático.
- Se no futuro houver integrações sensíveis, elas devem ir para funções serverless/Workers, não para o bundle do Vite.
