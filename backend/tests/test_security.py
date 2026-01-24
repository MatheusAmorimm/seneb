from backend.core.security import get_password_hash, verify_password

def test_password_hashing():
    password = "minha_senha_secreta"
    hashed = get_password_hash(password)
    assert hashed != password
    assert isinstance(hashed, str)
    assert len(hashed) > 0

def test_password_verification():
    password = "senha123"
    hashed = get_password_hash(password)
    assert verify_password(password, hashed) is True
    assert verify_password("senha_errada", hashed) is False
