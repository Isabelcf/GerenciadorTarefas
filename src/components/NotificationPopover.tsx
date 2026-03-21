import React from 'react';
import { 
  Bell, 
  Calendar, 
  Share2, 
  MessageSquare, 
  AlertCircle,
  Check,
  Trash2,
  X
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Notification } from "@/src/types";
import { cn } from "@/src/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface NotificationPopoverProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onNotificationClick?: (notification: Notification) => void;
  onClearAll: () => void;
  onRemove: (id: string) => void;
  onClose: () => void;
}

export function NotificationPopover({ 
  notifications, 
  onMarkAsRead, 
  onNotificationClick,
  onClearAll, 
  onRemove,
  onClose 
}: NotificationPopoverProps) {
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="absolute top-full right-0 mt-4 w-[320px] sm:w-[400px] bg-white rounded-[2rem] border-4 border-slate-100 shadow-2xl z-[100] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200 origin-top-right">
      {/* Header */}
      <div className="p-6 border-b-4 border-slate-50 flex items-center justify-between bg-slate-50/50">
        <div>
          <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter flex items-center gap-2">
            <Bell className="w-5 h-5 text-me-blue" />
            Notificações
          </h3>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
            {unreadCount > 0 ? `${unreadCount} novas mensagens` : 'Tudo em dia!'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {notifications.length > 0 && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClearAll}
              className="h-8 w-8 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50"
              title="Limpar tudo"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="h-8 w-8 rounded-lg text-slate-300 hover:text-slate-900 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto max-h-[400px] p-4 space-y-3 custom-scrollbar">
        {notifications.length === 0 ? (
          <div className="py-12 text-center space-y-4">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto border-2 border-slate-100">
              <Bell className="w-8 h-8 text-slate-200" />
            </div>
            <p className="text-sm font-bold text-slate-300 italic">Nenhuma notificação por aqui...</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div 
              key={notification.id}
              onClick={() => {
                if (onNotificationClick) {
                  onNotificationClick(notification);
                } else {
                  onMarkAsRead(notification.id);
                }
              }}
              className={cn(
                "group relative p-4 rounded-2xl border-2 border-b-4 transition-all cursor-pointer",
                notification.read 
                  ? "bg-white border-slate-100 border-b-slate-200 opacity-60" 
                  : "bg-me-blue/5 border-me-blue/20 border-b-me-blue/30"
              )}
            >
              <div className="flex gap-4">
                {/* Icon based on type */}
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm border-b-2",
                  notification.type === 'holiday' && "bg-duo-yellow text-white border-duo-yellow-dark",
                  notification.type === 'integration' && "bg-me-blue text-white border-blue-700",
                  notification.type === 'interaction' && "bg-me-purple text-white border-purple-700",
                  notification.type === 'system' && "bg-slate-900 text-white border-slate-950"
                )}>
                  {notification.type === 'holiday' && <Calendar className="w-5 h-5" />}
                  {notification.type === 'integration' && <Share2 className="w-5 h-5" />}
                  {notification.type === 'interaction' && <MessageSquare className="w-5 h-5" />}
                  {notification.type === 'system' && <AlertCircle className="w-5 h-5" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-black text-slate-900 truncate uppercase tracking-tight">
                      {notification.title}
                    </h4>
                    <span className="text-[8px] font-bold text-slate-300 whitespace-nowrap">
                      {format(notification.createdAt, "HH:mm", { locale: ptBR })}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-500 mt-1 leading-tight italic">
                    {notification.message}
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(notification.id);
                  }}
                  className="h-6 w-6 rounded-md text-slate-300 hover:text-red-500 hover:bg-red-50"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>

              {!notification.read && (
                <div className="absolute top-2 right-2 w-2 h-2 bg-me-blue rounded-full animate-pulse group-hover:hidden" />
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-4 bg-slate-50/50 border-t-2 border-slate-100">
          <Button 
            variant="ghost" 
            className="w-full text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 h-8"
            onClick={() => notifications.forEach(n => onMarkAsRead(n.id))}
          >
            Marcar todas como lidas
          </Button>
        </div>
      )}
    </div>
  );
}
