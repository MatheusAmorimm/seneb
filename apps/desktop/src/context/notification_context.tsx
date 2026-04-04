"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import api from "../services/api";
import { toast } from "sonner";
import { useWorkspaceContext } from "./workspace_context";

export interface SenebNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  meta_data?: any;
  created_at: string;
}

interface NotificationContextType {
  notifications: SenebNotification[];
  unreadCount: number;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  acceptInvite: (id: string) => Promise<void>;
  rejectInvite: (id: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType>({} as NotificationContextType);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<SenebNotification[]>([]);
  const { refreshGroups } = useWorkspaceContext();

  const fetchNotifications = useCallback(async () => {
    try {
      const { data } = await api.get("/notifications");
      setNotifications(data);
    } catch (err) {
      console.error("Erro ao buscar notificações", err);
    }
  }, []);

  useEffect(() => {
    // Busca inicial
    fetchNotifications();
    
    // Polling a cada 30 segundos para aparecer "dinamicamente"
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAsRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const acceptInvite = async (id: string) => {
    try {
      await api.post(`/notifications/${id}/accept-invite`);
      toast.success("Convite aceito! Você entrou no grupo.");
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      refreshGroups(); // Refresh the sidebar naturally
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Erro ao aceitar convite");
    }
  };

  const rejectInvite = async (id: string) => {
    try {
      await api.post(`/notifications/${id}/reject-invite`);
      toast.info("Convite recusado.");
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Erro ao recusar convite");
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, fetchNotifications, markAsRead, acceptInvite, rejectInvite }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotificationContext = () => useContext(NotificationContext);
