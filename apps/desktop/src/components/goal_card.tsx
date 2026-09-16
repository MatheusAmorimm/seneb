"use client";

import { useCallback, useEffect, useRef } from "react";
import { Pencil, Trash2, Trophy, Target, Calendar, TrendingUp } from "lucide-react";
import { Goal } from "../types";
import api from "../services/api";

interface GoalCardProps {
  goal: Goal;
  onEdit: (goal: Goal) => void;
  onDelete: (goalId: string) => void;
  onCelebrated: (goalId: string) => void;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function calcMonthlyNeeded(target: number, current: number, deadline: string): number | null {
  const now = new Date();
  const end = new Date(deadline + "T00:00:00");
  const diffMs = end.getTime() - now.getTime();
  if (diffMs <= 0) return null;
  const months = diffMs / (1000 * 60 * 60 * 24 * 30.44);
  const remaining = target - current;
  if (remaining <= 0) return 0;
  return remaining / months;
}

function formatDeadline(deadline: string) {
  const [year, month, day] = deadline.split("-");
  return `${day}/${month}/${year}`;
}

function playGoalSound() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.value = freq;
      const t = ctx.currentTime + i * 0.14;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.25, t + 0.04);
      gain.gain.linearRampToValueAtTime(0, t + 0.28);
      osc.start(t);
      osc.stop(t + 0.3);
    });
  } catch {
    // AudioContext não disponível
  }
}

export function GoalCard({ goal, onEdit, onDelete, onCelebrated }: GoalCardProps) {
  const progress = goal.target_amount > 0
    ? Math.min((goal.current_amount / goal.target_amount) * 100, 100)
    : 0;

  const isComplete = progress >= 100;
  const monthlyNeeded = calcMonthlyNeeded(goal.target_amount, goal.current_amount, goal.deadline);
  const hasFirework = useRef(false);

  const triggerCelebration = useCallback(async () => {
    playGoalSound();

    const { default: confetti } = await import("canvas-confetti");
    confetti({
      particleCount: 180,
      spread: 80,
      origin: { y: 0.6 },
      colors: ["#00988D", "#F23E02", "#013750", "#FFD700", "#ffffff"],
    });
    setTimeout(() => confetti({ particleCount: 80, spread: 50, origin: { y: 0.5 } }), 400);

    try {
      await api.patch(`/goals/${goal.id}/celebrate`);
      onCelebrated(goal.id);
    } catch {
      // silently ignore
    }
  }, [goal.id, onCelebrated]);

  useEffect(() => {
    if (isComplete && !goal.is_celebrated && !hasFirework.current) {
      hasFirework.current = true;
      triggerCelebration();
    }
  }, [isComplete, goal.is_celebrated, triggerCelebration]);

  return (
    <div className={`
      relative rounded-2xl overflow-hidden shadow-lg border transition-all duration-300 hover:shadow-xl hover:-translate-y-1
      ${isComplete
        ? "border-amber-400 dark:border-amber-700 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20"
        : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
      }
    `}>
      {/* Trophy badge quando concluída */}
      {isComplete && (
        <div className="absolute top-3 right-3 z-10 bg-[#f59e0b] text-white rounded-full p-1.5 shadow-md animate-bounce">
          <Trophy size={16} />
        </div>
      )}

      {/* Imagem */}
      <div className="h-40 w-full overflow-hidden bg-gradient-to-br from-[#013750] to-[#2C6B74] flex items-center justify-center">
        {goal.image_base64 ? (
          <img
            src={`data:image/jpeg;base64,${goal.image_base64}`}
            alt={goal.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <Target className="text-white/40 w-16 h-16" />
        )}
      </div>

      <div className="p-5 space-y-4">
        {/* Nome */}
        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 leading-tight line-clamp-2">
          {goal.name}
        </h3>

        {/* Valores */}
        <div className="flex justify-between items-end">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Acumulado</p>
            <p className="text-xl font-bold text-amber-600 dark:text-amber-400">{formatCurrency(goal.current_amount)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500 dark:text-slate-400">Meta</p>
            <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">{formatCurrency(goal.target_amount)}</p>
          </div>
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>{progress.toFixed(1)}%</span>
            <span className="flex items-center gap-1">
              <Calendar size={11} />
              {formatDeadline(goal.deadline)}
            </span>
          </div>
          <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                isComplete
                  ? "bg-gradient-to-r from-amber-400 to-yellow-300"
                  : "bg-gradient-to-r from-[#013750] to-amber-400"
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Mensagem de quanto guardar por mês */}
        <div className="flex items-center gap-2 text-xs rounded-lg px-3 py-2 bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400">
          <TrendingUp size={13} className="shrink-0 text-amber-500" />
          {isComplete ? (
            <span className="font-semibold text-amber-600 dark:text-amber-400">Meta atingida! Parabéns!</span>
          ) : monthlyNeeded === null ? (
            <span className="text-red-500">Prazo expirado</span>
          ) : (
            <span>Guardar <strong className="text-slate-700 dark:text-slate-200">{formatCurrency(monthlyNeeded)}/mês</strong> para atingir</span>
          )}
        </div>

        {/* Ações */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => onEdit(goal)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <Pencil size={14} /> Editar
          </button>
          <button
            onClick={() => onDelete(goal.id)}
            className="flex items-center justify-center gap-1.5 px-3 py-2 text-sm rounded-lg border border-red-200 dark:border-red-800/50 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
