# Seneb — Controle Financeiro

SaaS de gestão financeira pessoal e colaborativa. Desktop cross-platform (Windows / Linux) construído com **Tauri + Next.js + React**. Backend em **FastAPI + MongoDB Atlas**.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Desktop | Tauri 2 · Next.js 16 · React 19 · TailwindCSS 4 |
| Landing page | Next.js 16 |
| Backend | FastAPI 0.128 · Python 3.12 |
| Banco de dados | MongoDB Atlas (Motor async) |
| Autenticação | JWT (HS256) + Bcrypt |
| CI/CD | GitLab CI → VPS Hostinger |

---

## Estrutura do Projeto

```
finance_control_saas/
├── apps/
│   ├── desktop/          # App Tauri (Next.js embutido)
│   └── web/              # Landing page Next.js
└── backend/              # FastAPI — Clean Architecture
    ├── core/             # Configs, DB, Security, Mail, Exceptions
    ├── domain/           # Regras de negócio puras
    │   ├── entities/     # Entidades de domínio (sem frameworks)
    │   └── interfaces/   # Contratos de repositório (ABCs)
    ├── application/      # Casos de uso + DTOs
    │   ├── gate.py       # Socratic Gate (validação de pré-condições)
    │   ├── dtos/         # Contratos HTTP (Input/Output)
    │   └── use_cases/    # Lógica de negócio por domínio
    ├── infrastructure/
    │   └── repositories/ # Implementações MongoDB dos contratos
    └── api/v1/
        ├── controllers/  # Camada HTTP fina (apenas recebe/responde)
        ├── middlewares/  # Rate limiting
        └── dependencies.py  # Injeção de dependência FastAPI
```

---

## Arquitetura — Clean Architecture

O backend segue **Clean Architecture** com quatro camadas concêntricas. Dependências só apontam para dentro (do externo ao interno).

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
    type: Literal["income", "expense"]
    ...
```

Interfaces (contratos) em `domain/interfaces/`. Apenas ABCs, sem implementação.

```python
# domain/interfaces/transaction_repository.py
class ITransactionRepository(ABC):
    @abstractmethod
    async def find_drafts(...) -> list[TransactionEntity]: ...
```

### 2. Application (casos de uso)

Cada caso de uso é uma classe com um método `execute()`. Recebe DTOs e entidades, nunca objetos HTTP.

```python
# application/use_cases/transaction/create_transaction.py
class CreateTransactionUseCase:
    def __init__(self, transaction_repo, group_repo): ...

    async def execute(self, data: TransactionInput, user_id: str) -> TransactionEntity:
        ...
```

**Socratic Gate** valida pré-condições antes de executar lógica:

```python
Gate().require(condition, "mensagem").require(condition2, "mensagem2").check()
```

O gate coleta violações e lança `DomainException` na primeira falha (ou todas com `check_all()`).

### 3. Infrastructure (repositórios MongoDB)

Implementam os contratos do domínio. Encapsulam toda conversão entre entidade e documento MongoDB.

```python
# infrastructure/repositories/mongo_transaction_repository.py
class MongoTransactionRepository(ITransactionRepository):
    def _to_entity(self, doc: dict) -> TransactionEntity:
        data = dict(doc)
        data["id"] = str(data.pop("_id"))
        return TransactionEntity(**data)
    ...
```

### 4. API (controllers)

Controllers são finos: recebem HTTP, chamam use case, tratam exceções de domínio → HTTP.

```python
# api/v1/controllers/transaction_controller.py
@router.post("")
async def create_transaction(data: TransactionInput, ...):
    try:
        entity = await CreateTransactionUseCase(repo, group_repo).execute(data, user_id)
        return TransactionOutput(**entity.model_dump())
    except DomainException as exc:
        _handle(exc)
```

---

## Como Criar uma Nova Feature

Siga **sempre** essa sequência de camadas (de dentro para fora):

### Passo 1 — Entidade (se domínio novo)

```python
# backend/domain/entities/meu_dominio.py
from pydantic import BaseModel
from typing import Optional, Literal

class MeuDominioEntity(BaseModel):
    id: Optional[str] = None
    campo: str
    tipo: Literal["a", "b"]
```

### Passo 2 — Interface do Repositório

```python
# backend/domain/interfaces/meu_dominio_repository.py
from abc import ABC, abstractmethod
from backend.domain.entities.meu_dominio import MeuDominioEntity

class IMeuDominioRepository(ABC):
    @abstractmethod
    async def create(self, entity: MeuDominioEntity) -> MeuDominioEntity: ...

    @abstractmethod
    async def find_by_id(self, id: str) -> Optional[MeuDominioEntity]: ...
```

### Passo 3 — Implementação MongoDB

```python
# backend/infrastructure/repositories/mongo_meu_dominio_repository.py
from backend.domain.interfaces.meu_dominio_repository import IMeuDominioRepository

class MongoMeuDominioRepository(IMeuDominioRepository):
    def __init__(self, db): self._col = db["meu_dominio"]

    def _to_entity(self, doc: dict) -> MeuDominioEntity:
        data = dict(doc)
        data["id"] = str(data.pop("_id"))
        return MeuDominioEntity(**data)

    async def create(self, entity: MeuDominioEntity) -> MeuDominioEntity:
        data = entity.model_dump(exclude={"id"})
        result = await self._col.insert_one(data)
        entity.id = str(result.inserted_id)
        return entity
```

### Passo 4 — DTOs (Input/Output HTTP)

```python
# backend/application/dtos/meu_dominio_dtos.py
from pydantic import BaseModel, Field

class MeuDominioInput(BaseModel):
    campo: str = Field(..., max_length=200)

class MeuDominioOutput(BaseModel):
    id: Optional[str]
    campo: str
```

### Passo 5 — Caso de Uso

```python
# backend/application/use_cases/meu_dominio/criar_meu_dominio.py
from backend.application.gate import Gate
from backend.core.exceptions import ConflictException
from backend.domain.interfaces.meu_dominio_repository import IMeuDominioRepository

class CriarMeuDominioUseCase:
    def __init__(self, repo: IMeuDominioRepository) -> None:
        self._repo = repo

    async def execute(self, data: MeuDominioInput, user_id: str) -> MeuDominioEntity:
        Gate().require(len(data.campo) > 0, "Campo obrigatório.").check()

        entity = MeuDominioEntity(user_id=user_id, campo=data.campo)
        return await self._repo.create(entity)
```

### Passo 6 — Injeção de Dependência

```python
# Adicionar em backend/api/v1/dependencies.py
def get_meu_dominio_repo(db=Depends(get_db)) -> IMeuDominioRepository:
    return MongoMeuDominioRepository(db)
```

### Passo 7 — Controller

```python
# backend/api/v1/controllers/meu_dominio_controller.py
from fastapi import APIRouter, Depends, HTTPException
from backend.core.exceptions import DomainException

router = APIRouter()

def _handle(exc: DomainException) -> None:
    raise HTTPException(status_code=400, detail=exc.message)

@router.post("", response_model=MeuDominioOutput)
async def criar(
    data: MeuDominioInput,
    current_user=Depends(get_current_user),
    repo=Depends(get_meu_dominio_repo),
):
    try:
        entity = await CriarMeuDominioUseCase(repo).execute(data, str(current_user.id))
        return MeuDominioOutput(**entity.model_dump())
    except DomainException as exc:
        _handle(exc)
```

### Passo 8 — Registrar no Router

```python
# backend/api/v1/api.py
from backend.api.v1.controllers import meu_dominio_controller

api_router.include_router(
    meu_dominio_controller.router,
    prefix="/meu-dominio",
    tags=["Meu Dominio"],
)
```

---

## Regras de Desenvolvimento

### O que NUNCA fazer

- **Nunca** acessar `db.db.*` diretamente em controllers ou use cases. Toda query passa pelo repositório.
- **Nunca** importar FastAPI (`HTTPException`, `Request`) dentro de use cases ou domínio.
- **Nunca** colocar lógica de negócio nos controllers (só receber, chamar use case, responder).
- **Nunca** usar `random` para OTP — usar sempre `secrets`.
- **Nunca** comparar códigos OTP com `==` — usar `hmac.compare_digest()`.
- **Nunca** usar `bare except:` — capturar exceções específicas.
- **Nunca** retornar `404` em "e-mail não encontrado" em fluxos de recuperação de senha (user enumeration).

### O que SEMPRE fazer

- Validar pré-condições com `Gate()` antes de executar lógica nos use cases.
- Adicionar `max_length` em todos os campos de texto nos DTOs.
- Usar `Literal[...]` em campos de enum nas entidades e DTOs.
- Adicionar `created_at: datetime.now(timezone.utc)` em todos os documentos OTP (necessário para TTL).
- Lançar `DomainException` (ou subclasses) nos use cases — nunca `HTTPException`.
- Mapear `DomainException` → `HTTPException` nos controllers (função `_handle()`).
- Aplicar `@limiter.limit("N/minute")` em endpoints de autenticação.

### Exceções de Domínio

| Exceção | HTTP Status | Quando usar |
|---|---|---|
| `DomainException` | 400 | Regra de negócio genérica |
| `NotFoundException` | 404 | Recurso não encontrado |
| `ForbiddenException` | 403 | Sem permissão |
| `ConflictException` | 409 | Recurso já existe |
| `UnauthorizedException` | 401 | Não autenticado |

---

## Segurança — Padrões Obrigatórios

### OTP (One-Time Passwords)

```python
import secrets
code = str(secrets.randbelow(90_000_000) + 10_000_000)  # 8 dígitos seguros
```

### Comparação Constant-Time

```python
import hmac
if not hmac.compare_digest(stored["code"], user_provided_code):
    raise DomainException("Código inválido.")
```

### TTL de Códigos

Todos os documentos OTP **devem** incluir `created_at` para o TTL index funcionar:

```python
await db.collection.update_one(
    {"email": email},
    {"$set": {"code": code, "created_at": datetime.now(timezone.utc)}},
    upsert=True,
)
```

TTLs configurados no `main.py`:
- `verification_codes`: 15 min
- `password_reset_codes`: 15 min
- `password_change_codes`: 15 min
- `email_change_codes`: 30 min
- `notifications`: 7 dias

### Invalidação de Token

O campo `token_version` no usuário é incrementado automaticamente ao trocar senha ou e-mail. O token antigo se torna inválido imediatamente.

### Rate Limiting

```python
from backend.api.v1.middlewares.rate_limit import limiter

@router.post("/minha-rota")
@limiter.limit("5/minute")
async def minha_rota(request: Request, ...):  # request obrigatório para slowapi
    ...
```

Limites atuais em `/auth`:
- `/send-code`: 5/min por IP
- `/signup`: 5/min por IP
- `/login`: 10/min por IP
- `/forgot-password`: 5/min por IP

### CORS

Configure via variável de ambiente:

```env
ALLOWED_ORIGINS=["https://app.seneb.com.br","https://seneb.com.br"]
```

---

## Variáveis de Ambiente

```env
# Obrigatórias
SECRET_KEY=<string_aleatória_mínimo_32_chars>
MONGO_URI=mongodb+srv://...

# Opcionais (com defaults)
DATABASE_NAME=finance_saas_dev
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
ALLOWED_ORIGINS=["http://localhost:3000","http://localhost:3001"]
DISABLE_OPENAPI=false

# E-mail
MAIL_USERNAME=suporte@seneb.com.br
MAIL_PASSWORD=...
MAIL_FROM=suporte@seneb.com.br
MAIL_PORT=587
MAIL_SERVER=smtp.hostinger.com
```

> **Nunca** comitar `.env` no repositório.

---

## Setup Local

### Backend

```bash
cd backend
python -m venv ../.venv
source ../.venv/bin/activate  # Windows: ..\.venv\Scripts\activate
pip install -r requirements.txt
uvicorn backend.main:app --reload --port 8000
```

### Desktop (Tauri + Next.js)

```bash
cd apps/desktop
npm install
npm run tauri dev
```

### Landing Page

```bash
cd apps/web
npm install
npm run dev   # porta 3001
```

---

## Frontend — Padrões Tauri + Next.js

### Storage

Use `getStorageItem` / `setStorageItem` de `src/lib/storage` — abstrai Tauri Store (desktop) e localStorage (web).

```typescript
import { getStorageItem, setStorageItem } from '@/lib/storage'

const token = await getStorageItem<string>('token')
await setStorageItem('token', newToken)
```

### API Client

O cliente Axios em `src/services/api.ts` injeta automaticamente:
- Bearer token no header `Authorization`
- `group_id` em queries/body quando há workspace de grupo ativo (via `sessionStorage`)

### Context Providers

| Provider | Arquivo | Responsabilidade |
|---|---|---|
| `WorkspaceContext` | `context/workspace_context.tsx` | Workspace ativo (pessoal ou grupo) |
| `NotificationContext` | `context/notification_context.tsx` | Polling de notificações (10s) |
| `ReportsContext` | `context/reports_context.tsx` | Relatório ativo |

### Convenções de Nomenclatura (Frontend)

- Arquivos: `snake_case.tsx`
- Componentes React: `PascalCase`
- Hooks: `useNomeDoHook`
- Contexts: `NomeContext`
- Serviços: sempre via `src/services/api.ts`

---

## CI/CD — GitLab

O pipeline tem 3 stages:

1. **build_tauri** (Windows runner) → MSI assinado
2. **build_tauri_linux** (Ubuntu 22.04) → AppImage + DEB
3. **deploy_vps_hostinger** (Alpine) → rsync para VPS + rebuild Next.js + restart PM2

Artefatos de atualização gerados: `update-windows.json`, `update-linux.json`.

---

## Distribuição Desktop

- **Auto-update**: Tauri Updater com assinatura criptográfica
- **Servidor de updates**: `https://seneb.com.br/update.json`
- **Windows**: MSI (instalação passiva)
- **Linux**: AppImage + DEB
