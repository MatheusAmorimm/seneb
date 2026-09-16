"""Configuração comum dos testes.

Define variáveis mínimas antes de qualquer import de `backend.*`, para que
`Settings` valide sem depender de um arquivo `.env` local.
"""

import os

os.environ.setdefault("SECRET_KEY", "test-secret-key-with-at-least-32-chars!")
os.environ.setdefault("MONGO_URI", "mongodb://localhost:27017")
os.environ.setdefault("MAIL_DEV_LOG_CODES", "true")
