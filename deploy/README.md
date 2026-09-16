# Deploy do Seneb (tudo gratuito)

| Peça | Onde | Como sobe |
|---|---|---|
| Backend (FastAPI, Docker) | Render (plano Free) | Blueprint `render.yaml` na raiz; deploy automático a cada push na `main` |
| Banco | MongoDB Atlas M0 | já existente; só liberar acesso de rede |
| Landing (`apps/web`) | Vercel (Hobby) | integração Vercel ↔ GitHub |
| App desktop | GitHub Releases | workflow `release-desktop.yml` ao criar tag `v*` |
| E-mail transacional | Resend (SMTP) | variáveis `MAIL_*` no Render |

## 1. MongoDB Atlas

1. Database > Connect > Drivers: copie a `MONGO_URI` (com usuário/senha).
2. Network Access > Add IP Address > **Allow access from anywhere** (`0.0.0.0/0`).
   O Render Free não tem IP fixo; sem isso o backend não conecta.

## 2. Backend no Render

1. Crie conta em https://render.com (GitHub login). Não precisa cartão.
2. Dashboard > **New** > **Blueprint** > escolha o repositório `MatheusAmorimm/seneb`.
3. O Render lê `render.yaml` e pede os valores `sync: false`:
   - `MONGO_URI` — do passo 1
   - `MAIL_PASSWORD` — API key do Resend (passo 4). Pode deixar vazio por enquanto:
     sem SMTP, o backend **registra o código OTP no log** em vez de enviar e-mail.
4. Aguarde o primeiro deploy. Teste: `https://<nome>.onrender.com/health` → `{"status":"ok"}`.
5. **Domínio:** Settings > Custom Domains > `api.seneb.com.br`. O Render mostra o
   CNAME; crie-o no DNS do domínio. TLS é automático.
   - O app desktop é compilado apontando para `https://api.seneb.com.br/api/v1`.
     Se preferir usar a URL `*.onrender.com`, defina a variável `API_URL` no
     GitHub (Settings > Secrets and variables > Actions > Variables) antes de
     gerar a release. O CSP do app já libera `https://*.onrender.com`.

Limitações do plano Free: o serviço hiberna após 15 min sem requisições e o
primeiro acesso leva até ~1 min (o app avisa o usuário). 512 MB de RAM
(`WEB_CONCURRENCY=1`).

### Alternativa: qualquer VM Linux (ex.: Oracle Cloud Always Free)

```bash
# na VM, com Docker instalado
mkdir -p ~/seneb && cd ~/seneb
# copie deploy/docker-compose.prod.yml, deploy/Caddyfile e crie .env (base: backend/.env.example)
docker compose -f docker-compose.prod.yml up -d
```

Aponte o DNS `api.seneb.com.br` para o IP da VM; o Caddy emite o certificado.
O Watchtower atualiza a imagem `ghcr.io/matheusamorimm/seneb-backend:latest`
publicada pelo workflow `backend-image.yml` a cada push na `main`.
(O pacote no GHCR precisa estar **público**: GitHub > Packages > seneb-backend > Package settings > Change visibility.)

## 3. Landing na Vercel

1. https://vercel.com > **Add New** > **Project** > importe `MatheusAmorimm/seneb`.
2. **Root Directory:** `apps/web`. Framework: Next.js (detectado).
3. Environment Variables: `ENABLE_EXPERIMENTAL_COREPACK=1` (para o Yarn 4 do `packageManager`).
4. Deploy. Depois, Settings > Domains > `seneb.com.br` (e `www`): a Vercel mostra os
   registros A/CNAME para criar no DNS.

Todo push na `main` redeploya a landing automaticamente.

## 4. E-mail (Resend)

1. https://resend.com > crie conta (gratuito: 3.000 e-mails/mês, 100/dia).
2. **Domains** > Add `seneb.com.br` > crie os registros DNS (DKIM/SPF) indicados > Verify.
3. **API Keys** > Create > copie a chave.
4. No Render: `MAIL_PASSWORD` = a chave. Os demais (`MAIL_SERVER=smtp.resend.com`,
   `MAIL_PORT=587`, `MAIL_USERNAME=resend`, `MAIL_FROM=no-reply@seneb.com.br`) já estão no Blueprint.

Alternativas com o mesmo mecanismo (SMTP): Brevo (300/dia, sem verificar domínio)
ou Gmail com senha de app (500/dia). Basta trocar as variáveis `MAIL_*`.

## 5. GitHub (releases do desktop)

Settings > Secrets and variables > Actions:

| Tipo | Nome | Valor |
|---|---|---|
| Secret | `TAURI_SIGNING_PRIVATE_KEY` | conteúdo do arquivo `seneb.key` (chave privada do updater) |
| Secret | `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` | senha da chave (vazio se não tiver) |
| Variable | `API_URL` | opcional; padrão `https://api.seneb.com.br/api/v1` |

> A chave pública correspondente está em `apps/desktop/src-tauri/tauri.conf.json`.
> Se a chave privada se perder, gere um par novo (`yarn tauri signer generate`),
> troque a `pubkey` no `tauri.conf.json` e os usuários precisarão reinstalar uma vez.

### Lançar uma versão

1. Atualize a versão em `apps/desktop/package.json`, `apps/desktop/src-tauri/tauri.conf.json`
   e `apps/desktop/src-tauri/Cargo.toml` (as três iguais).
2. Adicione a entrada no changelog da landing (`apps/web/components/LandingPage.tsx`).
3. Commit na `main`, depois:
   ```bash
   git tag v0.5.0
   git push origin main --tags
   ```
4. Acompanhe em Actions > Release Desktop (~15–25 min). Ao terminar, a release
   terá `Seneb_0.5.0_x64_en-US.msi`, `.AppImage`, `.deb`, os `.sig`, o
   `latest.json` e as cópias `Seneb-Setup.*`.
5. Apps instalados detectam a nova versão na próxima abertura.

## 6. Desenvolvimento local

```bash
corepack enable && yarn install
cp backend/.env.example backend/.env      # preencha MONGO_URI e SECRET_KEY
docker compose up --build                 # backend em http://localhost:8000
# ou, com Mongo local:  docker compose --profile local-db up --build
yarn dev:desktop                          # app Tauri
yarn dev:web                              # landing em http://localhost:3001
cd backend && python -m pytest            # testes
```
