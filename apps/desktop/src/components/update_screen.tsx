"use client";

import { useState, useEffect } from "react";
import { check } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";
import { DownloadCloud } from "lucide-react";

export function UpdateScreen({ children }: { children: React.ReactNode }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [version, setVersion] = useState("");

  useEffect(() => {
    async function checkForUpdates() {
      // Garante que só rode dentro do Tauri (ignora no navegador comum)
      if (typeof window === "undefined" || !window.__TAURI_INTERNALS__) return;

      try {
        const update = await check();
        
        if (update) {
          setIsUpdating(true);
          setVersion(update.version);
          
          let downloaded = 0;
          let contentLength = 0; // 🚀 Nova variável para guardar o tamanho

          await update.downloadAndInstall((event) => {
            switch (event.event) {
              case 'Started':
                // 🚀 Pega o tamanho total assim que o download inicia
                contentLength = event.data.contentLength || 0;
                break;
              case 'Progress':
                // 🚀 Soma os chunks (pedaços) que estão chegando
                downloaded += event.data.chunkLength;
                if (contentLength > 0) {
                  setProgress(Math.round((downloaded / contentLength) * 100));
                }
                break;
              case 'Finished':
                // 🚀 Garante que a barra bata 100% no fim
                setProgress(100);
                break;
            }
          });

          // Reinicia o app com a versão nova magicamente
          await relaunch();
        }
      } catch (error) {
        console.error("Erro ao atualizar OTA:", error);
        // Se der erro (ex: sem internet), apenas ignora e deixa o app abrir normalmente
        setIsUpdating(false); 
      }
    }

    checkForUpdates();
  }, []);

  if (!isUpdating) return <>{children}</>;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center text-white" style={{ background: 'linear-gradient(135deg, #013750 0%, #2C6B74 100%)' }}>
      <div className="bg-white/10 p-4 rounded-full backdrop-blur-sm animate-pulse mb-6">
        <DownloadCloud className="w-12 h-12 text-[#F2B705]" />
      </div>
      <h1 className="text-3xl font-serif font-bold mb-2">Atualizando o Seneb</h1>
      <p className="text-white/80 mb-8">Baixando versão {version}... Por favor, não feche o aplicativo.</p>

      {/* Barra de Progresso Customizada */}
      <div className="w-64 h-3 bg-slate-800 rounded-full overflow-hidden shadow-inner">
        <div 
          className="h-full bg-[#00988D] transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="mt-3 text-sm font-bold">{progress}%</span>
    </div>
  );
}