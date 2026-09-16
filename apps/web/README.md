# Seneb Landing

Landing page em Next.js 16, hospedada na Vercel (Root Directory `apps/web`). Faz parte do monorepo Yarn 4.

```bash
corepack enable && yarn install      # uma vez, na raiz
yarn dev:web                         # http://localhost:3001
yarn workspace web build
```

- Os botões de download apontam para o GitHub Releases (`Seneb-Setup.msi`, `.AppImage`, `.deb`).
- O changelog vive em `components/LandingPage.tsx`; adicione uma entrada a cada release.
- Deploy: todo push na `main` redeploya pela integração Vercel ↔ GitHub (ver `deploy/README.md`).
