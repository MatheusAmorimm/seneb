from backend.core.security import get_password_hash, hash_otp, verify_otp, verify_password

# Hash gerado por passlib[bcrypt]==1.7.4 + bcrypt==3.2.2 (stack anterior) para "Senha@123".
LEGACY_PASSLIB_HASH = "$2b$12$uiMsvA6fDzDHd88HU1lvF.zJYkFH9CEbSOevL6wL9WF1nwUBO0sg."


def test_password_hashing():
    password = "minha_senha_secreta"
    hashed = get_password_hash(password)
    assert hashed != password
    assert isinstance(hashed, str)
    assert hashed.startswith("$2b$12$")


def test_password_verification():
    password = "senha123"
    hashed = get_password_hash(password)
    assert verify_password(password, hashed) is True
    assert verify_password("senha_errada", hashed) is False


def test_legacy_passlib_hash_still_verifies():
    assert verify_password("Senha@123", LEGACY_PASSLIB_HASH) is True
    assert verify_password("senha@123", LEGACY_PASSLIB_HASH) is False


def test_long_password_is_truncated_like_passlib_did():
    pwd = "a" * 100
    hashed = get_password_hash(pwd)
    assert verify_password(pwd, hashed) is True
    assert verify_password("a" * 72, hashed) is True


def test_malformed_hash_does_not_raise():
    assert verify_password("qualquer", "nao-e-um-hash") is False


def test_otp_hash_is_keyed_and_constant_time_compared():
    digest = hash_otp("12345678")
    assert digest != "12345678"
    assert verify_otp("12345678", digest) is True
    assert verify_otp("12345679", digest) is False
