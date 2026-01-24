import pytest
from fastapi.testclient import TestClient
from backend.main import app
from uuid import uuid4

# Fixture do Cliente (Gerencia o ciclo de vida startup/shutdown)
@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c

# Fixture de Dados
@pytest.fixture
def sample_user_data():
    random_id = str(uuid4())[:8]
    return {
        "email": f"test_{random_id}@finance.com",
        "password": "senha_teste_123",
        "confirm_password": "senha_teste_123",
        "full_name": "Test Robot",
        "nickname": f"Robo_{random_id}"
    }

# Fixture de Usuário Criado
@pytest.fixture
def created_user(client, sample_user_data):
    response = client.post("/api/v1/auth/signup", json=sample_user_data)
    assert response.status_code == 201
    return sample_user_data

# --- TESTES ---

def test_signup_flow(client, sample_user_data):
    response = client.post("/api/v1/auth/signup", json=sample_user_data)
    assert response.status_code == 201
    assert "_id" in response.json()

def test_login_flow(client, created_user):
    login_data = {
        "username": created_user["email"],
        "password": created_user["password"]
    }
    response = client.post("/api/v1/auth/login", data=login_data)
    assert response.status_code == 200
    assert "access_token" in response.json()

def test_login_wrong_password(client, created_user):
    login_data = {
        "username": created_user["email"],
        "password": "senha_errada"
    }
    response = client.post("/api/v1/auth/login", data=login_data)
    assert response.status_code == 401