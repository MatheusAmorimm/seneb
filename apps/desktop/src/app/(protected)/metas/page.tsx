"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Target, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Header } from "../../../components/header";
import { Sidebar } from "../../../components/sidebar";
import { GoalCard } from "../../../components/goal_card";
import { GoalFormModal } from "../../../components/goal_form_modal";
import api from "../../../services/api";
import { Goal } from "../../../types";
import { useTheme } from "../../../components/theme_provider";

export default function MetasPage() {
  const router = useRouter();
  const { isSidebarOpen, setIsSidebarOpen, setIsHome } = useTheme();

  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    setIsHome(false);
  }, [setIsHome]);

  const fetchGoals = useCallback(async () => {
    try {
      const res = await api.get("/goals");
      setGoals(res.data);
    } catch {
      toast.error("Não foi possível carregar as metas.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchGoals(); }, [fetchGoals]);

  async function handleSave(data: {
    name: string;
    target_amount: number;
    deadline: string;
    image_base64?: string;
  }) {
    try {
      if (editingGoal) {
        const res = await api.put(`/goals/${editingGoal.id}`, data);
        setGoals((prev) => prev.map((g) => (g.id === editingGoal.id ? res.data : g)));
        toast.success("Meta atualizada!");
      } else {
        const res = await api.post("/goals", data);
        setGoals((prev) => [res.data, ...prev]);
        toast.success("Meta criada!");
      }
      setShowForm(false);
      setEditingGoal(null);
    } catch {
      toast.error("Erro ao salvar a meta.");
      throw new Error("save failed");
    }
  }

  async function handleDelete(goalId: string) {
    if (deleteConfirm !== goalId) {
      setDeleteConfirm(goalId);
      toast.warning("Clique em excluir novamente para confirmar.", { duration: 3000 });
      setTimeout(() => setDeleteConfirm(null), 3500);
      return;
    }
    try {
      await api.delete(`/goals/${goalId}`);
      setGoals((prev) => prev.filter((g) => g.id !== goalId));
      setDeleteConfirm(null);
      toast.success("Meta excluída.");
    } catch {
      toast.error("Erro ao excluir a meta.");
    }
  }

  function handleCelebrated(goalId: string) {
    setGoals((prev) =>
      prev.map((g) => (g.id === goalId ? { ...g, is_celebrated: true } : g))
    );
  }

  function openCreate() {
    setEditingGoal(null);
    setShowForm(true);
  }

  function openEdit(goal: Goal) {
    setEditingGoal(goal);
    setShowForm(true);
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 transition-colors">
      <Header onMenuClick={() => setIsSidebarOpen(true)} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-8">

          {/* Header da página */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/")}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400 dark:text-slate-500 hover:text-brand-deepBlue dark:hover:text-slate-100"
                title="Voltar para Home"
              >
                <ArrowLeft size={24} />
              </button>
              <div>
                <h1 className="text-3xl font-serif font-bold text-brand-deepBlue dark:text-slate-100 flex items-center gap-3">
                  <Target className="text-amber-500" size={32} />
                  Minhas Metas
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                  Acompanhe seus objetivos financeiros e celebre cada conquista.
                </p>
              </div>
            </div>
            <button
              onClick={openCreate}
              className="flex items-center gap-2 px-5 py-3 rounded-xl text-white font-semibold shadow-md hover:scale-[1.03] transition-transform cursor-pointer"
              style={{ backgroundColor: "#f59e0b" }}
            >
              <Plus size={18} />
              Nova Meta
            </button>
          </div>

          {/* Carregando */}
          {isLoading && (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-400" />
            </div>
          )}

          {/* Sem metas */}
          {!isLoading && goals.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="p-6 rounded-full bg-slate-100 dark:bg-slate-800 mb-6">
                <Target className="text-slate-300 dark:text-slate-600 w-16 h-16" />
              </div>
              <h2 className="text-xl font-semibold text-slate-600 dark:text-slate-400 mb-2">
                Nenhuma meta ainda
              </h2>
              <p className="text-slate-400 dark:text-slate-500 mb-6 max-w-sm">
                Crie sua primeira meta financeira e comece a transformar seus sonhos em planos reais.
              </p>
              <button
                onClick={openCreate}
                className="px-6 py-3 rounded-xl text-white font-semibold cursor-pointer"
                style={{ backgroundColor: "#f59e0b" }}
              >
                Criar primeira meta
              </button>
            </div>
          )}

          {/* Grid de metas */}
          {!isLoading && goals.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {goals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                  onCelebrated={handleCelebrated}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {showForm && (
        <GoalFormModal
          initialData={editingGoal}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditingGoal(null); }}
        />
      )}
    </div>
  );
}
