# Mesma lista em apps/desktop/src/lib/password_rules.ts; as duas precisam andar juntas.
PASSWORD_SYMBOLS = "@#$%&*!?._-"

_SYMBOLS_TEXT = " ".join(PASSWORD_SYMBOLS)


def _is_allowed(char: str) -> bool:
    return char.isalpha() or char.isdecimal() or char in PASSWORD_SYMBOLS


def validate_password_strength(password: str) -> str:
    """Regra de senha nova (cadastro, recuperação e troca).

    O tamanho (8 a 128) fica no Field de cada DTO. O login não passa por aqui,
    então senhas antigas fora desta regra continuam entrando.
    """
    if not any(c.isupper() for c in password):
        raise ValueError("A senha deve conter pelo menos uma letra maiúscula.")
    if not any(c.islower() for c in password):
        raise ValueError("A senha deve conter pelo menos uma letra minúscula.")
    if not any(c in PASSWORD_SYMBOLS for c in password):
        raise ValueError(f"A senha deve conter pelo menos um destes símbolos: {_SYMBOLS_TEXT}")
    if not all(_is_allowed(c) for c in password):
        raise ValueError(f"A senha só pode ter letras, números e os símbolos {_SYMBOLS_TEXT}")
    return password
