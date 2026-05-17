"use client";

import { useEffect, useRef, useState } from "react";
import { X, ImagePlus, Target } from "lucide-react";
import { Goal } from "../types";
import { AppDateInput } from "./ui/app_date_input";

interface GoalFormModalProps {
  initialData?: Goal | null;
  onSave: (data: { name: string; target_amount: number; deadline: string; image_base64?: string }) => Promise<void>;
  onClose: () => void;
}

function formatCurrencyInput(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  const num = parseInt(digits.slice(0, 12), 10);
  return (num / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function parseCurrency(masked: string): number {
  return parseFloat(masked.replace(/\./g, "").replace(",", ".")) || 0;
}

export function GoalFormModal({ initialData, onSave, onClose }: GoalFormModalProps) {
  const [name, setName] = useState(initialData?.name ?? "");
  const [amountStr, setAmountStr] = useState(
    initialData ? formatCurrencyInput(String(Math.round(initialData.target_amount * 100))) : ""
  );
  const [deadline, setDeadline] = useState(initialData?.deadline ?? "");
  const [imageBase64, setImageBase64] = useState<string | undefined>(initialData?.image_base64);
  const [imagePreview, setImagePreview] = useState<string | undefined>(
    initialData?.image_base64 ? `data:image/jpeg;base64,${initialData.image_base64}` : undefined
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // Fecha no Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  async function handleImagePick() {
    try {
      // Tenta usar o dialog nativo do Tauri
      const { open } = await import("@tauri-apps/plugin-dialog");
      const selected = await open({
        filters: [{ name: "Imagem", extensions: ["jpg", "jpeg", "png", "webp"] }],
        multiple: false,
      });
      if (!selected || typeof selected !== "string") return;

      const { readFile } = await import("@tauri-apps/plugin-fs");
      const bytes = await readFile(selected);
      const base64 = btoa(String.fromCharCode(...bytes));
      setImageBase64(base64);
      setImagePreview(`data:image/jpeg;base64,${base64}`);
    } catch {
      // Fallback: input file HTML
      fileRef.current?.click();
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError("Imagem deve ter menos de 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      const base64 = result.split(",")[1];
      setImageBase64(base64);
      setImagePreview(result);
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amount = parseCurrency(amountStr);
    if (!name.trim()) { setError("Nome da meta é obrigatório."); return; }
    if (amount <= 0) { setError("Valor da meta deve ser maior que zero."); return; }
    if (!deadline) { setError("Prazo é obrigatório."); return; }
    if (new Date(deadline) <= new Date()) { setError("O prazo deve ser uma data futura."); return; }

    setError("");
    setLoading(true);
    try {
      await onSave({ name: name.trim(), target_amount: amount, deadline, image_base64: imageBase64 });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#78350f] to-[#d97706]">
          <div className="flex items-center gap-2 text-white">
            <Target size={20} />
            <h2 className="font-bold text-lg">{initialData ? "Editar Meta" : "Nova Meta"}</h2>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors cursor-pointer">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Imagem */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Imagem (opcional)
            </label>
            <button
              type="button"
              onClick={handleImagePick}
              className="w-full h-32 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-amber-400 dark:hover:border-amber-500 transition-colors overflow-hidden cursor-pointer"
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
                  <ImagePlus size={28} />
                  <span className="text-sm">Clique para escolher uma imagem</span>
                </div>
              )}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </div>

          {/* Nome */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Nome da meta <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Viagem para Europa"
              maxLength={100}
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all"
            />
          </div>

          {/* Valor */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Valor alvo <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 text-sm font-medium">R$</span>
              <input
                type="text"
                inputMode="numeric"
                value={amountStr}
                onChange={(e) => setAmountStr(formatCurrencyInput(e.target.value))}
                placeholder="0,00"
                className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all"
              />
            </div>
          </div>

          {/* Prazo */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Prazo <span className="text-red-500">*</span>
            </label>
            <AppDateInput
              value={deadline}
              onChange={setDeadline}
              min={new Date().toISOString().split("T")[0]}
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-lg text-white font-semibold transition-all hover:scale-[1.02] disabled:opacity-70 cursor-pointer"
              style={{ backgroundColor: "#f59e0b" }}
            >
              {loading ? "Salvando..." : initialData ? "Salvar alterações" : "Criar meta"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
