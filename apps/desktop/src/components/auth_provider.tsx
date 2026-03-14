"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getStorageItem } from "../lib/storage";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      // O getStorageItem vai procurar na RAM (sessão) E no Disco (persistente)
      const token = await getStorageItem<string>("token");
      const isPublicRoute = ["/login", "/cadastro", "/recuperar-senha"].includes(pathname);

      if (!token) {
        // Se não tem token em lugar nenhum, manda pro Login
        if (!isPublicRoute) {
          router.replace("/login");
        } else {
          setIsReady(true); // Deixa ver a tela de login
        }
      } else {
        // Se TEM token (seja da RAM ou do Disco), deixa entrar
        if (isPublicRoute) {
          router.replace("/"); // Já tá logado, sai do login
        } else {
          setIsReady(true); // Mostra a Home
        }
      }
    }
    checkAuth();
  }, [pathname, router]);

  if (!isReady) return null;

  return <>{children}</>;
}