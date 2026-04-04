"use client";

import { useState } from "react";
import { Users, Plus, Mail, ArrowLeft, X, Trash2, LogOut, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { AxiosError } from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "../../../../services/api";
import { useWorkspaceContext } from "../../../../context/workspace_context";

export default function GruposPage() {
  const router = useRouter();
  const { groups, isLoadingGroups, refreshGroups, setActiveGroupId, currentUserId, activeGroupId } = useWorkspaceContext();
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteGroupId, setInviteGroupId] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("guest");
  const [isInviting, setIsInviting] = useState(false);

  const [deleteGroupData, setDeleteGroupData] = useState<{ id: string, name: string, isOwner: boolean } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const getErrorMessage = (error: unknown): string => {
    if (error instanceof AxiosError) {
      const detail = error.response?.data?.detail;
      return typeof detail === "string" ? detail : "Erro na operação.";
    }
    return "Erro de conexão com o servidor.";
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    
    setIsCreating(true);
    try {
      const resp = await api.post("/groups", { name: newGroupName });
      toast.success("Grupo criado com sucesso!");
      setShowCreateModal(false);
      setNewGroupName("");
      
      await refreshGroups();
      
      // Auto-redirect para Lancamentos
      setActiveGroupId(resp.data.id);
      router.push("/lancamentos");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsCreating(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setIsInviting(true);
    try {
      await api.post(`/groups/${inviteGroupId}/members`, { email: inviteEmail, role: inviteRole });
      toast.success("Membro adicionado com sucesso!");
      setShowInviteModal(false);
      setInviteEmail("");
      setInviteRole("guest");
      await refreshGroups();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsInviting(false);
    }
  };

  const handleDeleteOrLeave = async () => {
    if (!deleteGroupData) return;
    setIsDeleting(true);
    try {
      if (deleteGroupData.isOwner) {
        await api.delete(`/groups/${deleteGroupData.id}`);
        toast.success("Grupo excluído com sucesso.");
      } else {
        await api.post(`/groups/${deleteGroupData.id}/leave`);
        toast.success("Você saiu do grupo com sucesso.");
      }
      
      // Auto redireciona se estiver no mesmo grupo
      if (activeGroupId === deleteGroupData.id) {
          setActiveGroupId(null);
          router.push("/");
      }

      await refreshGroups();
      setDeleteGroupData(null);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href="/"
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400 dark:text-slate-500 hover:text-[#013750] dark:hover:text-slate-100 cursor-pointer"
            title="Voltar para Home"
          >
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-2xl font-serif font-bold text-[#013750] dark:text-slate-100 transition-colors">Meus Grupos</h1>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="bg-[#00988D] text-white px-4 py-2 rounded-xl font-bold hover:bg-[#007f76] transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
        >
          <Plus size={18} /> Criar Grupo
        </button>
      </div>

      {isLoadingGroups ? (
         <div className="flex items-center justify-center h-64 text-slate-400">Carregando grupos...</div>
      ) : groups.length === 0 ? (
         <div className="bg-white dark:bg-[#012a3d] p-12 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 text-center flex flex-col items-center justify-center gap-4">
           <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-full inline-flex text-slate-400 dark:text-slate-500">
             <Users size={48} />
           </div>
           <div>
             <h2 className="text-xl font-bold text-[#013750] dark:text-slate-100">Nenhum grupo encontrado</h2>
             <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-2 text-sm">
               Você ainda não participa de nenhum Controle Compartilhado. Crie um novo grupo para gerenciar finanças em conjunto!
             </p>
           </div>
           <button onClick={() => setShowCreateModal(true)} className="mt-4 text-[#00988D] font-bold underline cursor-pointer">
             Criar meu primeiro grupo
           </button>
         </div>
      ) : (
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {groups.map((group) => {
             return (
               <div key={group.id} className="bg-white dark:bg-[#012a3d] p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors flex flex-col justify-between h-full">
                 <div>
                   <h2 className="text-xl font-bold text-[#013750] dark:text-slate-100 flex items-center gap-2 mb-4">
                     <Users size={20} className="text-[#F23E02]" /> 
                     {group.name}
                   </h2>
                   
                   <h3 className="text-xs font-bold text-[#2C6B74] dark:text-slate-400 uppercase mb-3">Membros:</h3>
                   <div className="space-y-3 mb-6">
                    {group.members.map((member) => (
                      <div key={member.user_id} className="flex items-center justify-between text-sm bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                        <span className="text-slate-600 dark:text-slate-300 font-medium">
                          Usuário ID: <span className="opacity-60 text-xs">{member.user_id.slice(-6)}</span>
                        </span>
                        <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded border ${member.role === 'admin' ? 'bg-[#e0f7fa] text-[#00988D] border-[#00988D]/20 dark:bg-teal-950/40 dark:text-teal-400' : 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'}`}>
                          {member.role}
                        </span>
                      </div>
                    ))}
                  </div>
                 </div>

                 <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-auto flex flex-col gap-2">
                   <button 
                     onClick={() => {
                        setInviteGroupId(group.id);
                        setShowInviteModal(true);
                     }}
                     className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 text-[#013750] dark:text-slate-200 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                   >
                     <Mail size={16} /> Convidar Membro
                   </button>
                   
                   {currentUserId === group.owner_id ? (
                     <button 
                       onClick={() => setDeleteGroupData({ id: group.id, name: group.name, isOwner: true })}
                       className="w-full py-2.5 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 font-bold rounded-xl hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2 cursor-pointer hover:shadow-sm"
                     >
                       <Trash2 size={16} /> Excluir Grupo
                     </button>
                   ) : (
                     <button 
                       onClick={() => setDeleteGroupData({ id: group.id, name: group.name, isOwner: false })}
                       className="w-full py-2.5 bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 font-bold rounded-xl hover:bg-yellow-100 dark:hover:bg-yellow-500/20 transition-colors flex items-center justify-center gap-2 cursor-pointer hover:shadow-sm"
                     >
                       <LogOut size={16} /> Sair do Grupo
                     </button>
                   )}
                 </div>
               </div>
             )
           })}
         </div>
      )}

      {/* --- CREATE MODAL --- */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#012a3d] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 dark:border-slate-800">
            <div className="bg-[#013750] p-6 flex items-center justify-between">
              <h3 className="text-lg font-serif font-bold text-white">Criar Novo Grupo</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-white/60 hover:text-white transition-colors cursor-pointer"><X size={20} /></button>
            </div>
            <div className="p-6">
              <form onSubmit={handleCreateGroup} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#2C6B74] dark:text-slate-400 uppercase mb-1.5">Nome do Grupo</label>
                  <input type="text" value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)}
                    className="w-full p-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 rounded-xl focus:outline-none focus:border-[#00988D] dark:focus:border-teal-400 transition-all font-medium"
                    placeholder="Ex: Finanças de Casa" autoFocus required />
                </div>
                <button type="submit" disabled={isCreating || !newGroupName.trim()}
                  className="w-full py-3 bg-[#00988D] text-white font-bold rounded-xl hover:bg-[#007f76] transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70">
                  {isCreating ? "Criando..." : "Criar Grupo"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* --- INVITE MODAL --- */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#012a3d] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 dark:border-slate-800">
            <div className="bg-[#F23E02] p-6 flex items-center justify-between">
              <h3 className="text-lg font-serif font-bold text-white">Convidar Membro</h3>
              <button onClick={() => setShowInviteModal(false)} className="text-white/60 hover:text-white transition-colors cursor-pointer"><X size={20} /></button>
            </div>
            <div className="p-6">
              <form onSubmit={handleInvite} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[rgba(242,62,2,0.8)] dark:text-orange-400/80 uppercase mb-1.5">E-mail do Usuário</label>
                  <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full p-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 rounded-xl focus:outline-none focus:border-[#F23E02] transition-all font-medium"
                    placeholder="email@exemplo.com" autoFocus required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2C6B74] dark:text-slate-400 uppercase mb-1.5">Permissão</label>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setInviteRole("guest")}
                      className={`flex-1 py-3 text-sm font-bold rounded-xl border-2 transition-colors cursor-pointer ${inviteRole === "guest" ? "border-[#00988D] bg-[#e0f7fa] text-[#00988D] dark:bg-teal-950/30 dark:border-teal-500" : "border-slate-200 text-slate-500 dark:border-slate-700 dark:bg-slate-800"}`}
                    >
                      🗣️ Visualizador (Guest)
                    </button>
                    <button type="button" onClick={() => setInviteRole("admin")}
                     className={`flex-1 py-3 text-sm font-bold rounded-xl border-2 transition-colors cursor-pointer ${inviteRole === "admin" ? "border-[#F23E02] bg-[#fff0e6] text-[#F23E02] dark:bg-orange-950/30 dark:border-orange-500" : "border-slate-200 text-slate-500 dark:border-slate-700 dark:bg-slate-800"}`}
                    >
                      👑 Administrador
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-2 text-center">
                    {inviteRole === "guest" ? "O convidado poderá apenas ver os saldos, mas não poderá editar lançamentos." : "O administrador tem controle total: visualizar, editar e deletar."}
                  </p>
                </div>
                <button type="submit" disabled={isInviting || !inviteEmail.trim()}
                  className="w-full mt-4 py-3 bg-[#013750] dark:bg-slate-100 text-white dark:text-[#013750] font-bold rounded-xl hover:bg-[#022a3d] dark:hover:bg-white transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70">
                  {isInviting ? "Adicionando..." : "Enviar Convite Direto"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* --- CONFIRM MODAL (DELETE/LEAVE) --- */}
      {deleteGroupData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-[#012a3d] rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-red-500/30 animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
                 <div className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-full inline-flex mb-4">
                   {deleteGroupData.isOwner ? <Trash2 size={32} /> : <LogOut size={32} />}
                 </div>
                 <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                   {deleteGroupData.isOwner ? "Excluir Grupo?" : "Sair do Grupo?"}
                 </h3>
                 <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 px-2">
                   {deleteGroupData.isOwner ? 
                     `Tem certeza que deseja excluir o grupo "${deleteGroupData.name}"? Esta ação desabilitará o acesso de todos os membros e impedirá novos lançamentos.` : 
                     `Tem certeza que deseja sair do grupo "${deleteGroupData.name}"? Você perderá o acesso instantaneamente aos dados.`
                   }
                 </p>
                 <div className="flex gap-3">
                   <button 
                     disabled={isDeleting}
                     onClick={() => setDeleteGroupData(null)}
                     className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                   >
                     Cancelar
                   </button>
                   <button 
                     onClick={handleDeleteOrLeave}
                     disabled={isDeleting}
                     className="flex-1 py-3 bg-[#F23E02] hover:bg-[#d63802] text-white font-bold rounded-xl shadow-lg disabled:opacity-50 transition-colors flex justify-center items-center gap-2 cursor-pointer"
                   >
                     {isDeleting ? "Aguarde..." : (deleteGroupData.isOwner ? "Sim, Excluir" : "Sim, Sair")}
                   </button>
                 </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
