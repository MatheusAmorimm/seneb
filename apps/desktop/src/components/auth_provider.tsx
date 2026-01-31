"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getStorageItem, removeStorageItem } from "../lib/storage";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const token = await getStorageItem<string>("token");
        const rememberMe = await getStorageItem<boolean>("remember_me")

        const isPublicRoute = ["/login", "/cadastro"].includes(pathname);

        // Regra de Ouro: Só é válido se tem Token E RememberMe é estritamente TRUE
        const isAuthenticated = !!token && rememberMe === true;

        if (!isAuthenticated) {
          // Se não está autenticado (ou não pediu para lembrar), 
          // LIMPEZA FORÇADA para garantir que não sobrem resquícios
          if (token) {
            await removeStorageItem("token");
            await removeStorageItem("user");
            // Opcional: limpar o remember_me também para garantir estado limpo
            await removeStorageItem("remember_me");
          }

          if (!isPublicRoute) {
            router.replace("/login");
          } else {
            setIsReady(true);
          }
        } else {
          // Usuário autenticado e pediu para lembrar
          if (isPublicRoute) {
            router.replace("/");
          } else {
            setIsReady(true);
          }
        }
      } catch (err) {
        router.replace("/login");
      }
    }
    
    checkAuth();
  }, [pathname, router]);

  // Enquanto verifica, não renderiza nada para evitar "piscada" de tela errada
  if (!isReady) return null;

  return <>{children}</>;
}