"""Teste de integração do fluxo de autenticação (opt-in).

Precisa de um MongoDB real. Rode com:
    TEST_MONGO_URI="mongodb://localhost:27017" python -m pytest tests/test_auth_integration.py
O envio de e-mail é substituído por um coletor em memória para capturar o OTP.
"""

import os
import re
from uuid import uuid4

import pytest

pytestmark = pytest.mark.skipif(
    not os.getenv("TEST_MONGO_URI"),
    reason="Defina TEST_MONGO_URI para rodar os testes de integração.",
)

if os.getenv("TEST_MONGO_URI"):
    os.environ["MONGO_URI"] = os.environ["TEST_MONGO_URI"]
    os.environ["DATABASE_NAME"] = "seneb_test"
    os.environ["MAIL_DEV_LOG_CODES"] = "false"

_OTP_IN_HTML = re.compile(r">\s*(\d{8})\s*<")


@pytest.fixture
def sent_codes(monkeypatch):
    box: dict[str, str] = {}

    async def fake_send(subject: str, recipient: str, html: str) -> None:
        match = _OTP_IN_HTML.search(html)
        if match:
            box[recipient] = match.group(1)

    monkeypatch.setattr("backend.core.mail._send", fake_send)
    return box


@pytest.fixture
def client():
    from fastapi.testclient import TestClient

    from backend.main import app

    with TestClient(app) as c:
        yield c


def test_signup_login_and_wrong_password(client, sent_codes):
    email = f"test_{uuid4().hex[:8]}@seneb.test"

    r = client.post("/api/v1/auth/send-code", json={"email": email})
    assert r.status_code == 200
    assert email in sent_codes

    payload = {
        "full_name": "Robô Teste",
        "nickname": "Robô",
        "email": email,
        "password": "Senha@123",
        "confirm_password": "Senha@123",
        "verification_code": sent_codes[email],
    }
    r = client.post("/api/v1/auth/signup", json=payload)
    assert r.status_code == 201, r.text
    assert "access_token" in r.json() and "refresh_token" in r.json()

    r = client.post("/api/v1/auth/login", data={"username": email, "password": "Senha@123"})
    assert r.status_code == 200
    assert "access_token" in r.json()

    r = client.post("/api/v1/auth/login", data={"username": email, "password": "errada"})
    assert r.status_code == 401
