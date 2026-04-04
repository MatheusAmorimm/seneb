"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import api from "../services/api";
import { Group } from "../types";
import { usePathname } from "next/navigation";

interface WorkspaceContextType {
  activeGroupId: string | null;
  activeGroup: Group | null;
  groups: Group[];
  isLoadingGroups: boolean;
  isGuestActive: boolean;
  currentUserId: string | null;
  setActiveGroupId: (id: string | null) => void;
  refreshGroups: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType>({} as WorkspaceContextType);

// Cache keys
const WORKSPACE_CACHE_KEY = "seneb_active_group_id";

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [activeGroupId, setActiveGroupIdState] = useState<string | null>(null);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    // Restaurar cache de workspace
    const cached = sessionStorage.getItem(WORKSPACE_CACHE_KEY);
    if (cached && cached !== "personal") {
      setActiveGroupIdState(cached);
    }
    
    // Obter user info para checar permissão
    api.get("/users/me").then(res => {
      if (res.data && res.data.id) setCurrentUserId(res.data.id);
    }).catch(() => {});
  }, []);

  const refreshGroups = useCallback(async () => {
    try {
      setIsLoadingGroups(true);
      const res = await api.get("/groups");
      setGroups(res.data);
    } catch (err) {
      console.error("Erro ao buscar grupos", err);
    } finally {
      setIsLoadingGroups(false);
    }
  }, []);

  useEffect(() => {
    const isPublicRoute = ["/login", "/cadastro"].includes(pathname);
    if (!isPublicRoute) {
      refreshGroups();
    }
  }, [pathname, refreshGroups]);

  const setActiveGroupId = (id: string | null) => {
    setActiveGroupIdState(id);
    if (id) {
      sessionStorage.setItem(WORKSPACE_CACHE_KEY, id);
    } else {
      sessionStorage.setItem(WORKSPACE_CACHE_KEY, "personal");
    }
  };

  const activeGroup = groups.find((g) => g.id === activeGroupId) || null;
  const isGuestActive = activeGroup && currentUserId ? activeGroup.members.find(m => m.user_id === currentUserId)?.role === "guest" : false;

  return (
    <WorkspaceContext.Provider
      value={{
        activeGroupId,
        activeGroup,
        groups,
        isLoadingGroups,
        isGuestActive: isGuestActive || false,
        currentUserId,
        setActiveGroupId,
        refreshGroups,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export const useWorkspaceContext = () => useContext(WorkspaceContext);
