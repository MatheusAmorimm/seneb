import { useReportsContext } from "../context/reports_context";

// Agora este hook é apenas um atalho para o Contexto Global.
// Isso mantém seu código limpo: os componentes não sabem que mudamos a lógica interna!
export function useReports() {
  const { reports, isLoading, refreshReports } = useReportsContext();

  return { 
    reports, 
    isLoading, 
    refetch: refreshReports // Mantemos o nome refetch para compatibilidade
  };
}