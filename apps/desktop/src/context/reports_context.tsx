"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { usePathname } from "next/navigation";
import api from "../services/api";
import { Report } from "../types";

interface ReportsContextType {
  reports: Report[];
  isLoading: boolean;
  refreshReports: () => Promise<void>;
}

const ReportsContext = createContext<ReportsContextType>({} as ReportsContextType);

export function ReportsProvider({ children }: { children: ReactNode }) {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();

  // 1. A função volta a ser "pura": Se for chamada, ela busca.
  const refreshReports = useCallback(async () => {
    try {
      setIsLoading(true);
      // Busca os relatórios no endpoint que já temos configurado
      const response = await api.get("/reports");
      setReports(response.data);
    } catch (err) {
      console.error("Erro ao buscar relatórios globais", err);
    } finally {
      setIsLoading(false);
    }
  }, []); // Sem dependência de pathname, ela não muda a cada navegação

  // 2. O useEffect controla a inteligência de "QUANDO" buscar
  useEffect(() => {
    const isPublicRoute = ["/login", "/cadastro"].includes(pathname);

    // Se NÃO for rota pública, pode buscar
    if (!isPublicRoute) {
      refreshReports();
    }
    // Se FOR rota pública, não faz nada (evita o erro 401 na tela de login)
    
  }, [pathname, refreshReports]);

  return (
    <ReportsContext.Provider value={{ reports, isLoading, refreshReports }}>
      {children}
    </ReportsContext.Provider>
  );
}

export const useReportsContext = () => useContext(ReportsContext);