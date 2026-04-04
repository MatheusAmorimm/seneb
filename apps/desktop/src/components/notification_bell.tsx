"use client";

import { Bell, Check, X } from "lucide-react";
import { useNotificationContext } from "../context/notification_context";
import { useState, useRef, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, acceptInvite, rejectInvite } = useNotificationContext();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fechar dropdown clicando fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative cursor-pointer"
        title="Notificações"
      >
        <Bell className="text-slate-600 dark:text-slate-300" size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[9px] text-white font-bold items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden animate-in slide-in-from-top-2">
          <div className="bg-slate-50 dark:bg-slate-950 px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 font-serif">Notificações</h3>
            <span className="text-xs font-semibold bg-brand-deepBlue text-white px-2 py-1 rounded-full">{unreadCount} novas</span>
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                <Bell className="mx-auto mb-2 opacity-50" size={32} />
                <p className="text-sm">Nenhuma notificação</p>
              </div>
            ) : (
                notifications.map((notif) => (
                  <div 
                    key={notif.id} 
                    className={`p-4 border-b border-slate-100 dark:border-slate-800 last:border-0 transition-colors ${
                      notif.read ? 'opacity-60 bg-white dark:bg-slate-950' : 'bg-blue-50/50 dark:bg-blue-900/10'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4 className={`text-sm font-bold ${notif.read ? 'text-slate-600 dark:text-slate-400' : 'text-slate-800 dark:text-slate-100'}`}>
                        {notif.title}
                      </h4>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">
                        {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: ptBR })}
                      </span>
                    </div>
                    <p className={`text-xs mb-3 ${notif.read ? 'text-slate-500 dark:text-slate-500' : 'text-slate-600 dark:text-slate-300'}`}>
                      {notif.message}
                    </p>

                    {notif.type === 'group_invite' && !notif.read && (
                      <div className="flex gap-2 mt-2">
                        <button 
                          onClick={() => acceptInvite(notif.id)}
                          className="flex-1 bg-brand-turquoise hover:bg-teal-600 text-white text-xs font-bold py-1.5 rounded-lg flex items-center justify-center gap-1 transition-colors"
                        >
                          <Check size={14} /> Aceitar
                        </button>
                        <button 
                          onClick={() => rejectInvite(notif.id)}
                          className="flex-1 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold py-1.5 rounded-lg flex items-center justify-center gap-1 transition-colors"
                        >
                          <X size={14} /> Recusar
                        </button>
                      </div>
                    )}
                    
                    {!notif.read && notif.type !== 'group_invite' && (
                       <button 
                         onClick={() => markAsRead(notif.id)}
                         className="text-xs text-brand-blue hover:underline"
                       >
                         Marcar como lida
                       </button>
                    )}
                  </div>
                ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
