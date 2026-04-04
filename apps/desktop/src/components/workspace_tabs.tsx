"use client";

import { useWorkspaceContext } from "../context/workspace_context";
import { Briefcase, Users } from "lucide-react";
import { cn } from "../lib/utils";

export function WorkspaceTabs() {
  const { groups, activeGroupId, setActiveGroupId } = useWorkspaceContext();

  if (!groups || groups.length === 0) {
    return null; // Apenas renderize se existirem grupos
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-4 mb-2 scrollbar-none animate-in fade-in slide-in-from-top-4">
      {/* Aba Pessoal */}
      <button
        onClick={() => setActiveGroupId(null)}
        className={cn(
          "px-5 py-2.5 rounded-t-xl rounded-b-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all border-b-2",
          activeGroupId === null
            ? "bg-[#013750] text-white border-[#F23E02] dark:bg-slate-800 dark:border-orange-500"
            : "bg-white/50 text-slate-500 hover:bg-slate-100 border-transparent dark:bg-slate-900/50 dark:text-slate-400 dark:hover:bg-slate-800"
        )}
      >
        <Briefcase size={18} className={activeGroupId === null ? "text-[#F23E02] dark:text-orange-400" : ""} /> Pessoal
      </button>

      {/* Abas dos Grupos */}
      {groups.map((group) => (
        <button
          key={group.id}
          onClick={() => setActiveGroupId(group.id)}
          className={cn(
            "px-5 py-2.5 rounded-t-xl rounded-b-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all border-b-2",
            activeGroupId === group.id
              ? "bg-[#eef2ff] text-[#013750] border-[#00988D] dark:bg-indigo-950/30 dark:text-indigo-200 dark:border-teal-400"
              : "bg-white/50 text-slate-500 hover:bg-slate-100 border-transparent dark:bg-slate-900/50 dark:text-slate-400 dark:hover:bg-slate-800"
          )}
        >
          <Users size={18} className={activeGroupId === group.id ? "text-[#00988D] dark:text-teal-400" : ""} /> {group.name}
        </button>
      ))}
    </div>
  );
}
