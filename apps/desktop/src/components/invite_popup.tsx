"use client";

import { useNotificationContext } from "../context/notification_context";
import { Users, Check, X } from "lucide-react";

export function InvitePopup() {
  const { notifications, acceptInvite, rejectInvite } = useNotificationContext();

  // Procurar o primeiro convite de grupo pendente (não lido)
  const pendingInvite = notifications.find(n => n.type === 'group_invite' && !n.read);

  if (!pendingInvite) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white dark:bg-[#012a3d] rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-300 scale-100 border border-slate-100 dark:border-slate-800">
        
        <div className="bg-gradient-to-r from-[#013750] to-[#00988D] p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
          <div className="bg-white/20 p-4 rounded-full mb-3 backdrop-blur-sm border border-white/30 shadow-inner">
            <Users className="text-white w-8 h-8" />
          </div>
          <h3 className="text-2xl font-serif font-bold text-white">{pendingInvite.title}</h3>
        </div>

        <div className="p-8 bg-white dark:bg-[#012a3d] text-center">
          <p className="text-slate-600 dark:text-slate-300 mb-8 text-base">
            {pendingInvite.message}
          </p>

          <div className="flex flex-col gap-3">
            <button 
              onClick={() => acceptInvite(pendingInvite.id)}
              className="w-full py-3 bg-[#F23E02] hover:bg-[#d63802] text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95"
            >
              <Check size={20} /> Participar do Grupo
            </button>
            <button 
              onClick={() => rejectInvite(pendingInvite.id)}
              className="w-full py-3 bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              <X size={20} /> Recusar Convite
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
