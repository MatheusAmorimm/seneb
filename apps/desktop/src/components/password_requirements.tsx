"use client";

import { Check, Circle, X } from 'lucide-react';
import { PASSWORD_RULES } from '../lib/password_rules';

type ItemState = 'ok' | 'pending' | 'error';

const STATE_STYLE: Record<ItemState, string> = {
  ok: 'text-emerald-600 dark:text-emerald-400',
  pending: 'text-slate-500 dark:text-slate-400',
  error: 'text-red-500 dark:text-red-400',
};

const STATE_TEXT: Record<ItemState, string> = {
  ok: 'atendido',
  pending: 'pendente',
  error: 'não atendido',
};

function Item({ state, label }: { state: ItemState; label: string }) {
  const Icon = state === 'ok' ? Check : state === 'error' ? X : Circle;
  return (
    <li className={`flex items-center gap-2 transition-colors ${STATE_STYLE[state]}`}>
      <Icon size={state === 'pending' ? 12 : 16} strokeWidth={state === 'pending' ? 2 : 3} className="shrink-0 w-4" aria-hidden="true" />
      <span>{label}</span>
      <span className="sr-only">({STATE_TEXT[state]})</span>
    </li>
  );
}

/** Lista dos requisitos da senha, marcados conforme o usuário digita. */
export function PasswordRequirements({ password }: { password: string }) {
  return (
    <ul className="mt-3 space-y-1.5 text-sm" aria-label="Requisitos da senha">
      {PASSWORD_RULES.map((rule) => {
        const state: ItemState = !password ? 'pending' : rule.test(password) ? 'ok' : rule.restriction ? 'error' : 'pending';
        return <Item key={rule.id} label={rule.label} state={state} />;
      })}
    </ul>
  );
}

/** Aparece quando o usuário começa a preencher a confirmação. */
export function PasswordMatchHint({ password, confirmPassword }: { password: string; confirmPassword: string }) {
  if (!confirmPassword) return null;
  const match = password === confirmPassword;
  return (
    <ul className="mt-3 text-sm">
      <Item state={match ? 'ok' : 'error'} label={match ? 'As senhas coincidem' : 'As senhas não coincidem'} />
    </ul>
  );
}
