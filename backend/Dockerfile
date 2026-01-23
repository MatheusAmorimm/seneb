# --- ESTÁGIO 1: Builder (Compilação) ---
FROM python:3.14-rc-slim as builder

WORKDIR /app

# Instala compiladores necessários para criptografia e libs pesadas
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libffi-dev \
    musl-dev \
    && rm -rf /var/lib/apt/lists/*

# Cria um ambiente virtual (venv) para isolar as bibliotecas
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copia e instala as dependências
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade -r requirements.txt

# --- ESTÁGIO 2: Runner (Imagem Final Leve) ---
FROM python:3.14-rc-slim

WORKDIR /app

# Cria usuário não-root por segurança
RUN addgroup --system financegroup && adduser --system --ingroup financegroup financeuser

# Copia apenas o ambiente virtual do estágio anterior
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copia o código fonte para dentro do container
COPY . /app/backend

# Ajusta permissões
RUN chown -R financeuser:financegroup /app

# Troca para o usuário seguro
USER financeuser

# Variáveis de ambiente
ENV PYTHONPATH=/app
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Expõe a porta
EXPOSE 8000

# Comando para rodar (com Reload ativado para desenvolvimento)
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]