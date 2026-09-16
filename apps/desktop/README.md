# Seneb Desktop

App Tauri 2 + Next.js 16 (export estático). Faz parte do monorepo Yarn 4; rode os comandos a partir da raiz do repositório.

```bash
corepack enable && yarn install      # uma vez, na raiz
yarn dev:desktop                     # abre o app apontando para http://localhost:8000/api/v1
yarn workspace desktop typecheck
yarn workspace desktop lint
yarn build:desktop                   # instalador local (precisa do Rust)
```

- A URL da API é fixada no build por `NEXT_PUBLIC_API_URL` (padrão local: `http://localhost:8000/api/v1`).
- O updater lê `https://github.com/MatheusAmorimm/seneb/releases/latest/download/latest.json`.
- Convenções: arquivos `snake_case.tsx`, componentes `PascalCase`, serviços sempre via `src/services/api.ts`.
- Veja o [README principal](../../README.md) para arquitetura, padrões e distribuição.
