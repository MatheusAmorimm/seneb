"use client";

import { useEffect, useRef } from "react";
import Lottie from "lottie-react";
import { X, Target, Calendar } from "lucide-react";
import { Goal } from "../types";
import api from "../services/api";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const trophyAnimation = require("../../public/animations/Trophy.json");

interface GoalCompletionOverlayProps {
  goal: Goal;
  onClose: () => void;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function formatDeadline(deadline: string) {
  const [year, month, day] = deadline.split("-");
  return `${day}/${month}/${year}`;
}

function playSound() {
  try {
    const ctx = new (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
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
    // AudioContext not available
  }
}

export function GoalCompletionOverlay({ goal, onClose }: GoalCompletionOverlayProps) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;

    playSound();
    api.patch(`/goals/${goal.id}/celebrate`).catch(() => {});
  }, [goal.id]);

  return (
    <div
      className="fixed inset-0 z-200 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-sm bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-90 duration-500">

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 p-1.5 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors cursor-pointer"
        >
          <X size={16} />
        </button>

        {/* Image / gradient header */}
        <div className="relative h-52 w-full overflow-hidden">
          {goal.image_base64 ? (
            <img
              src={`data:image/jpeg;base64,${goal.image_base64}`}
              alt={goal.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-linear-to-br from-amber-400 to-amber-600 flex items-center justify-center">
              <Target size={72} className="text-white/40" />
            </div>
          )}
          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />

          {/* Lottie trophy animation centered at bottom */}
          <div className="absolute bottom-0 inset-x-0 flex justify-center">
            <Lottie
              animationData={trophyAnimation}
              loop={false}
              className="w-28 h-28 drop-shadow-xl"
            />
          </div>
        </div>

        {/* Body */}
        <div className="px-6 pt-5 pb-6 space-y-4 text-center">
          <div>
            <p className="text-[11px] font-bold text-amber-500 uppercase tracking-widest mb-1">
              🎉 Meta concluída!
            </p>
            <h2 className="text-2xl font-serif font-bold text-slate-800 dark:text-slate-100 leading-tight">
              {goal.name}
            </h2>
          </div>

          {/* Amounts */}
          <div className="flex justify-center gap-10">
            <div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-0.5">Acumulado</p>
              <p className="text-xl font-bold text-amber-500">{formatCurrency(goal.current_amount)}</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-0.5">Meta</p>
              <p className="text-xl font-bold text-slate-700 dark:text-slate-300">
                {formatCurrency(goal.target_amount)}
              </p>
            </div>
          </div>

          {/* Full progress bar */}
          <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full w-full rounded-full bg-linear-to-r from-amber-400 to-yellow-300" />
          </div>

          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Calendar size={12} />
            <span>Prazo: {formatDeadline(goal.deadline)}</span>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl font-semibold text-white text-sm transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
            style={{ backgroundColor: "#f59e0b" }}
          >
            Parabéns! Continuar
          </button>
        </div>
      </div>
    </div>
  );
}
