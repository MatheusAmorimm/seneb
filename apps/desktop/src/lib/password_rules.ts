// Mesma regra de backend/application/policies/password_policy.py; as duas precisam andar juntas.
export const PASSWORD_SYMBOLS = '@#$%&*!?._-';

const SYMBOLS_TEXT = PASSWORD_SYMBOLS.split('').join(' ');

const isSymbol = (char: string) => PASSWORD_SYMBOLS.includes(char);
const isAllowed = (char: string) => /[\p{L}\p{Nd}]/u.test(char) || isSymbol(char);

export interface PasswordRule {
  id: string;
  label: string;
  test: (password: string) => boolean;
  /** Restrição: quando falha, a senha digitada já está errada (não só incompleta). */
  restriction?: boolean;
}

export const PASSWORD_RULES: PasswordRule[] = [
  { id: 'length', label: 'Pelo menos 8 caracteres', test: (p) => Array.from(p).length >= 8 },
  { id: 'upper', label: 'Uma letra maiúscula', test: (p) => /\p{Lu}/u.test(p) },
  { id: 'lower', label: 'Uma letra minúscula', test: (p) => /\p{Ll}/u.test(p) },
  { id: 'symbol', label: `Um destes símbolos: ${SYMBOLS_TEXT}`, test: (p) => Array.from(p).some(isSymbol) },
  { id: 'allowed', label: 'Só letras, números e esses símbolos', test: (p) => Array.from(p).every(isAllowed), restriction: true },
];

export const isPasswordValid = (password: string) =>
  PASSWORD_RULES.every((rule) => rule.test(password));
