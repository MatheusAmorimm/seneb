import pytest
from pydantic import ValidationError

from backend.application.dtos.auth_dtos import ResetPasswordInput, SignupInput
from backend.application.dtos.user_dtos import ChangePasswordConfirmInput
from backend.application.policies.password_policy import (
    PASSWORD_SYMBOLS,
    validate_password_strength,
)


@pytest.mark.parametrize(
    "password",
    ["Senha@123", "Minha_senha1", "Senha-forte", "Ação#Forte", "AbcdefG!", "x.Y" + "z" * 125],
)
def test_accepts_strong_passwords(password):
    assert validate_password_strength(password) == password


@pytest.mark.parametrize(
    ("password", "reason"),
    [
        ("senha@123", "maiúscula"),
        ("SENHA@123", "minúscula"),
        ("Senha1234", "símbolos"),
        ("Senha@ 123", "letras, números"),
        ('Senha@"123', "letras, números"),
        ("Senha@<123>", "letras, números"),
        ("Senha@{123}", "letras, números"),
    ],
)
def test_rejects_weak_or_disallowed_passwords(password, reason):
    with pytest.raises(ValueError, match=reason):
        validate_password_strength(password)


def test_every_listed_symbol_counts():
    for symbol in PASSWORD_SYMBOLS:
        assert validate_password_strength(f"Senha{symbol}12")


def _signup(password: str) -> dict:
    return {
        "full_name": "Fulano",
        "email": "fulano@example.com",
        "password": password,
        "confirm_password": password,
        "verification_code": "12345678",
    }


@pytest.mark.parametrize(
    ("model", "build"),
    [
        (SignupInput, _signup),
        (
            ResetPasswordInput,
            lambda p: {"email": "a@b.com", "code": "1", "new_password": p, "confirm_password": p},
        ),
        (
            ChangePasswordConfirmInput,
            lambda p: {"code": "1", "new_password": p, "confirm_password": p},
        ),
    ],
)
def test_every_new_password_input_enforces_the_policy(model, build):
    assert model(**build("Senha@123"))
    for weak in ("senha@123", "Senha123", "Se@1", "Senha@ 123"):
        with pytest.raises(ValidationError):
            model(**build(weak))
