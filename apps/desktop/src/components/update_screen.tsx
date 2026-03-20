"use client";

import { useState, useEffect } from "react";
import { check } from "@tauri-apps/plugin-updater";
import { DownloadCloud, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export function UpdateScreen({ children }: { children: React.ReactNode }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    async function checkForUpdates() {
      if (typeof window === "undefined" || !window.__TAURI_INTERNALS__) return;

      // 1. Verifica se retornou de uma atualização concluída com sucesso
      const justUpdated = localStorage.getItem('seneb_updated');
      if (justUpdated) {
        localStorage.removeItem('seneb_updated');
        setShowSuccess(true);
        setIsUpdating(true);
        
        // Exibe a tela de sucesso ("Tudo pronto!") por 4 segundos
        setTimeout(() => {
          setIsUpdating(false);
          setShowSuccess(false);
        }, 4000);
      }

      try {
        const update = await check();
        
        if (update) {
          // Informa discretamente o usuário sobre o download em background
          toast.info(`Atualização v${update.version} encontrada. Baixando em segundo plano...`);
          
          await update.downloadAndInstall((event) => {
            switch (event.event) {
              case 'Started':
                break;
              case 'Progress':
                // Baixando em background, não travamos a UI com a tela de load
                break;
              case 'Finished':
                // Assim que termina de baixar, o instalador do Windows (MSI/NSIS) assumirá.
                // Salvamos uma flag para sabermos que ele atualizará. O instalador vai forçar o fechamento do app.
                localStorage.setItem('seneb_updated', 'true');
                break;
            }
          });
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        toast.error(`Erro ao verificar atualizações: ${errorMsg}`);
      }
    }

    checkForUpdates();
  }, []);

  if (!isUpdating) return <>{children}</>;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center text-white" style={{ background: 'linear-gradient(135deg, #013750 0%, #2C6B74 100%)' }}>
      <div className="bg-white/10 p-4 rounded-full backdrop-blur-sm animate-pulse mb-6">
        {showSuccess ? (
          <CheckCircle2 className="w-12 h-12 text-[#00988D]" />
        ) : (
          <DownloadCloud className="w-12 h-12 text-[#F2B705]" />
        )}
      </div>
      
      <h1 className="text-3xl font-serif font-bold mb-2">
        {showSuccess ? "Seneb Atualizado!" : "Atualizando o Seneb"}
      </h1>
      
      <p className="text-white/80 mb-8 px-4 text-center max-w-md">
        {showSuccess 
          ? "A nova versão foi instalada com sucesso. Aproveite as novidades!"
          : "Preparando a atualização. O instalador do sistema se encarregará do restante."}
      </p>

      {showSuccess && (
        <div className="w-64 h-2 bg-slate-800 rounded-full overflow-hidden shadow-inner mt-4">
          <div 
            className="h-full bg-[#00988D] transition-all duration-300 ease-out animate-[progress_4s_ease-out_forwards]"
            style={{ 
              animationName: 'progress',
              animationDuration: '4s',
              animationFillMode: 'forwards'
            }}
          />
        </div>
      )}
      
      <style>{`
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
}