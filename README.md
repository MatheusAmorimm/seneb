# Seneb — Controle Financeiro

Aplicativo **gratuito** de controle financeiro pessoal e em grupo. Desktop cross-platform (Windows / Linux) com **Tauri 2 + Next.js 16 + React 19**, backend **FastAPI + MongoDB Atlas**, landing page **Next.js** na Vercel. Distribuição e atualização automática via **GitHub Releases**.

> Documentação complementar: [`deploy/README.md`](deploy/README.md) (passo a passo de hospedagem).

---

## Stack

| Camada | Tecnologia | Hospedagem |
|---|---|---|
| Desktop | Tauri 2 · Next.js 16 (export estático) · React 19 · TailwindCSS 4 · Recharts 3 | PC do usuário (MSI / AppImage / DEB via GitHub Releases) |
| Landing page | Next.js 16 | Vercel (`seneb.com.br`) |
| Backend | FastAPI 0.128 · Python 3.12 · Docker | Render Free (`api.seneb.com.br`) ou qualquer VM (`deploy/`) |
| Banco de dados | MongoDB Atlas M0 (Motor async) | Atlas |
| Autenticação | JWT (HS256) + refresh token rotativo + bcrypt | — |
| E-mail | SMTP (Resend / Brevo / Gmail) via fastapi-mail | — |
| CI/CD | GitHub Actions | — |
| Pacotes JS | **Yarn 4** (workspaces) | — |

---

## Estrutura do Projeto

```
seneb/
├── package.json            # raiz do workspace Yarn 4 (husky, lint-staged, scripts)
├── render.yaml             # Blueprint do Render (backend Docker, plano Free)
├── docker-compose.yml      # dev local (backend + Mongo opcional via --profile local-db)
├── deploy/                 # alternativa em VM: compose de produção + Caddy + guia
├── .github/workflows/      # ci.yml · release-desktop.yml · backend-image.yml
├── apps/
│   ├── desktop/            # App Tauri (Next.js embutido)
│   └── web/                # Landing page Next.js
└── backend/                # FastAPI — Clean Architecture
    ├── core/               # Configs, DB, Security, Mail, Exceptions
    ├── domain/             # Regras de negócio puras
    │   ├── entities/       # Entidades (sem frameworks)
    │   └── interfaces/     # Contratos de repositório (ABCs)
    ├── application/        # Casos de uso + DTOs + políticas
    │   ├── gate.py         # Socratic Gate (validação de pré-condições)
    │   ├── policies/       # Regras de acesso reutilizáveis (ex.: relatórios)
    │   ├── dtos/           # Contratos HTTP (Input/Output)
    │   └── use_cases/      # auth · user · transaction · report · goal · group · notification · analytics
    ├── infrastructure/
    │   └── repositories/   # Implementações MongoDB dos contratos
    ├── api/v1/
    │   ├── controllers/    # Camada HTTP fina
    │   ├── middlewares/    # Rate limiting
    │   └── dependencies.py # Injeção de dependência FastAPI
    └── tests/              # unitários com repositórios fake + integração opt-in
```

---

## Arquitetura — Clean Architecture

O backend segue **Clean Architecture** com quatro camadas concêntricas. Dependências só apontam para dentro.

```
[ Controllers ] → [ Use Cases ] → [ Interfaces ] ← [ Repositories ]
                       ↓
                  [ Entities ]
```

### 1. Domain (núcleo)

Entidades puras em `domain/entities/`. Sem imports de FastAPI, Motor ou qualquer framework.

```python
# domain/entities/transaction.py
class TransactionEntity(BaseModel):
    id: Optional[str] = None
    type: Literal["income", "expense", "goal"]
    ...

    @property
    def effective_amount(self) -> float:
        """Parcela do mês para compras parceladas; valor cheio para o resto."""
```

Interfaces (contratos) em `domain/interfaces/`. Apenas ABCs.

### 2. Application (casos de uso)

Cada caso de uso é uma classe com `execute()`. Recebe DTOs e entidades, nunca objetos HTTP.

**Socratic Gate** valida pré-condições antes de executar lógica:

```python
Gate().require(condition, "mensagem").require(condition2, "mensagem2").check()
```

**Policies** concentram regras de acesso reutilizadas por vários casos de uso (ex.: `ReportAccessPolicy`: pessoal → só o dono; grupo → membro lê, admin altera).

### 3. Infrastructure (repositórios MongoDB)

Implementam os contratos do domínio e encapsulam a conversão entidade ↔ documento. Agregações (somas de metas, análises) vivem aqui, nunca nos casos de uso.

### 4. API (controllers)

Controllers são finos: recebem HTTP, chamam o caso de uso, mapeiam `DomainException` → HTTP.

---

## Como Criar uma Nova Feature

Siga **sempre** essa sequência (de dentro para fora):

1. **Entidade** em `domain/entities/` (se domínio novo).
2. **Interface** do repositório em `domain/interfaces/`.
3. **Implementação Mongo** em `infrastructure/repositories/`.
4. **DTOs** em `application/dtos/` (sempre `max_length` em textos, `Literal` em enums).
5. **Caso de uso** em `application/use_cases/<dominio>/` com `Gate()`.
6. **Injeção** em `api/v1/dependencies.py` (`get_<x>_repo`).
7. **Controller** em `api/v1/controllers/` com `_handle()`.
8. **Rota** em `api/v1/api.py`.
9. **Teste unitário** em `backend/tests/` usando os fakes de `tests/fakes.py` (adicione um fake ao criar uma interface nova).

O domínio `analytics` (`entities/analytics.py`, `interfaces/analytics_repository.py`, `use_cases/analytics/`, `mongo_analytics_repository.py`, `analytics_controller.py`) é o exemplo mais recente e completo desse fluxo.

---

## Regras de Desenvolvimento

### O que NUNCA fazer

- **Nunca** acessar `db.db.*` diretamente em controllers ou use cases novos. Toda query passa pelo repositório.
- **Nunca** importar FastAPI (`HTTPException`, `Request`) dentro de use cases ou domínio.
- **Nunca** colocar lógica de negócio nos controllers.
- **Nunca** usar `random` para OTP — usar sempre `secrets`.
- **Nunca** comparar códigos OTP com `==` — usar `hmac.compare_digest()` (via `verify_otp`).
- **Nunca** usar `bare except:`.
- **Nunca** retornar `404` em "e-mail não encontrado" em fluxos de recuperação de senha.
- **Nunca** somar `amount` direto em totais de período — usar `effective_amount` (Python) ou o estágio `_EFFECTIVE_AMOUNT_STAGE` (Mongo).

### O que SEMPRE fazer

- Validar pré-condições com `Gate()` nos use cases.
- `max_length` em todos os campos de texto nos DTOs; `Literal[...]` em enums.
- `created_at: datetime.now(timezone.utc)` em documentos OTP (TTL).
- Lançar `DomainException` (ou subclasses) nos use cases — nunca `HTTPException`.
- Mapear `DomainException` → `HTTPException` nos controllers (`_handle()`).
- `@limiter.limit("N/minute")` em endpoints de autenticação.
- Ao criar índice novo, adicioná-lo em `_ensure_indexes()` no `main.py`.

### Exceções de Domínio

| Exceção | HTTP | Quando usar |
|---|---|---|
| `DomainException` | 400 | Regra de negócio genérica |
| `NotFoundException` | 404 | Recurso não encontrado |
| `ForbiddenException` | 403 | Sem permissão |
| `ConflictException` | 409 | Recurso já existe |
| `UnauthorizedException` | 401 | Não autenticado |

---

## Segurança

- **Senhas:** bcrypt (12 rounds) via a lib `bcrypt`; hashes antigos gerados com passlib continuam válidos.
- **OTP:** 8 dígitos com `secrets`, armazenado como HMAC-SHA256 com `SECRET_KEY`, comparado em tempo constante; TTL de 15 min (30 min para troca de e-mail).
- **Tokens:** access token JWT curto (`ACCESS_TOKEN_EXPIRE_MINUTES`) + refresh token rotativo de 30 dias (hash SHA-256 no banco, índice único). `token_version` invalida sessões ao trocar senha/e-mail.
- **Rate limiting:** slowapi por IP real (`--proxy-headers` no uvicorn) em `/auth/*` e troca de senha/e-mail.
- **Headers:** `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, `Strict-Transport-Security`.
- **CORS:** `ALLOWED_ORIGINS` + origens do Tauri sempre permitidas.
- **OpenAPI:** `DISABLE_OPENAPI=true` em produção.

---

## Variáveis de Ambiente

Modelo completo em [`backend/.env.example`](backend/.env.example).

```env
# Obrigatórias
SECRET_KEY=<string_aleatória_mínimo_32_chars>
MONGO_URI=mongodb+srv://...

# Opcionais (com defaults)
DATABASE_NAME=finance_saas_dev
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=30
ALLOWED_ORIGINS=["http://localhost:3000","http://localhost:3001"]
DISABLE_OPENAPI=false

# E-mail (SMTP). Sem MAIL_SERVER, ou com MAIL_DEV_LOG_CODES=true, o código vai para o log.
MAIL_SERVER=smtp.resend.com
MAIL_PORT=587
MAIL_USERNAME=resend
MAIL_PASSWORD=<api key>
MAIL_FROM=no-reply@seneb.com.br
MAIL_STARTTLS=true
MAIL_SSL_TLS=false
MAIL_DEV_LOG_CODES=false

# Runtime (Docker)
PORT=8000
WEB_CONCURRENCY=1
```

> **Nunca** comitar `.env`.

---

## Setup Local

### Pré-requisitos

Node 22+ com Corepack, Python 3.12+, Rust (só para empacotar o desktop), Docker (opcional).

### Tudo de uma vez

```bash
corepack enable
yarn install                              # instala desktop + web + hooks do husky
cp backend/.env.example backend/.env      # preencha MONGO_URI e SECRET_KEY
```

### Backend

```bash
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r backend/requirements.txt
uvicorn backend.main:app --reload --port 8000       # a partir da raiz do repo
# ou: docker compose up --build   |   docker compose --profile local-db up --build
cd backend && python -m pytest                      # testes (integração só com TEST_MONGO_URI)
```

### Desktop (Tauri + Next.js)

```bash
yarn dev:desktop
```

### Landing Page

```bash
yarn dev:web        # porta 3001
```

### Qualidade

```bash
yarn lint && yarn typecheck
```

Os hooks do husky rodam `lint-staged` no pre-commit e `commitlint` (Conventional Commits) no commit-msg.

---

## Frontend — Padrões Tauri + Next.js

### Storage

`getStorageItem` / `setStorageItem` de `src/lib/storage` abstraem Tauri Store (desktop) e sessionStorage.

### API Client

`src/services/api.ts` injeta o Bearer token, renova o access token com o refresh token (fila de requisições) e adiciona `group_id` em `/transactions`, `/reports` e `/analytics` quando há grupo ativo.

### Context Providers

| Provider | Arquivo | Responsabilidade |
|---|---|---|
| `WorkspaceContext` | `context/workspace_context.tsx` | Workspace ativo (pessoal ou grupo) |
| `NotificationContext` | `context/notification_context.tsx` | Polling de notificações (10s) |
| `ReportsContext` | `context/reports_context.tsx` | Relatórios do workspace ativo |

### Análises

`src/services/analytics.ts` (cliente tipado) → `src/hooks/use_analytics.ts` → `src/components/analytics/*`. As cores de série em `chart_theme.ts` foram validadas para daltonismo e contraste nos temas claro e escuro; ao adicionar um gráfico, use apenas essas cores.

### Convenções

- Arquivos: `snake_case.tsx` · Componentes: `PascalCase` · Hooks: `useNomeDoHook` · Contexts: `NomeContext`
- Serviços: sempre via `src/services/api.ts`

---

## CI/CD — GitHub Actions

| Workflow | Gatilho | O que faz |
|---|---|---|
| `ci.yml` | push/PR | lint + typecheck + build das duas apps; pytest; build da imagem Docker |
| `release-desktop.yml` | tag `v*` | build Windows (MSI) e Linux (AppImage + DEB) com `tauri-action`, assina, cria a GitHub Release com `latest.json` e cópias `Seneb-Setup.*` |
| `backend-image.yml` | push em `main` (backend/) | publica `ghcr.io/matheusamorimm/seneb-backend` |

O Render e a Vercel fazem deploy sozinhos a cada push na `main`.

---

## Distribuição Desktop

- **Auto-update:** Tauri Updater com assinatura (minisign). Endpoint: `https://github.com/MatheusAmorimm/seneb/releases/latest/download/latest.json`.
- **Windows:** MSI (instalação passiva). **Linux:** AppImage (auto-atualiza) + DEB.
- **Nova versão:** bump em `apps/desktop/package.json`, `src-tauri/tauri.conf.json` e `src-tauri/Cargo.toml` → changelog na landing → `git tag vX.Y.Z && git push --tags`.
