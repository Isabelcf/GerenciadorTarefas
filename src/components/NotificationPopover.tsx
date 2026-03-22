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
import { ptBR, enUS, es } from "date-fns/locale";
import { useLanguage } from '../contexts/LanguageContext';

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
  const { t, language } = useLanguage();
  const unreadCount = notifications.filter(n => !n.read).length;

  const locale = language === 'pt' ? ptBR : language === 'en' ? enUS : es;

  return (
    <div className="absolute top-full right-0 mt-4 w-[320px] sm:w-[400px] bg-card rounded-[2rem] border-4 border-border shadow-2xl z-[100] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200 origin-top-right">
      {/* Header */}
      <div className="p-6 border-b-4 border-background flex items-center justify-between bg-background/50">
        <div>
          <h3 className="text-xl font-black text-foreground uppercase italic tracking-tighter flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            {t('notifications')}
          </h3>
          <p className="text-[10px] font-black text-foreground-muted uppercase tracking-widest mt-1">
            {unreadCount > 0 ? t('newMessages', { count: unreadCount }) : t('allCaughtUp')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {notifications.length > 0 && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClearAll}
              className="h-8 w-8 rounded-lg text-foreground-muted/50 hover:text-red-500 hover:bg-red-50"
              title={t('clearAll')}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="h-8 w-8 rounded-lg text-foreground-muted/50 hover:text-foreground hover:bg-background"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto max-h-[400px] p-4 space-y-3 custom-scrollbar">
        {notifications.length === 0 ? (
          <div className="py-12 text-center space-y-4">
            <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mx-auto border-2 border-border">
              <Bell className="w-8 h-8 text-foreground-muted/30" />
            </div>
            <p className="text-sm font-bold text-foreground-muted/50 italic">{t('noNotifications')}</p>
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
                  ? "bg-card border-border border-b-border/50 opacity-60" 
                  : "bg-primary/5 border-primary/20 border-b-primary/30"
              )}
            >
              <div className="flex gap-4">
                {/* Icon based on type */}
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm border-b-2",
                  notification.type === 'holiday' && "bg-duo-yellow text-white border-duo-yellow-dark",
                  notification.type === 'integration' && "bg-primary text-white border-primary-dark",
                  notification.type === 'interaction' && "bg-accent text-white border-accent-dark",
                  notification.type === 'system' && "bg-foreground text-background border-foreground-muted"
                )}>
                  {notification.type === 'holiday' && <Calendar className="w-5 h-5" />}
                  {notification.type === 'integration' && <Share2 className="w-5 h-5" />}
                  {notification.type === 'interaction' && <MessageSquare className="w-5 h-5" />}
                  {notification.type === 'system' && <AlertCircle className="w-5 h-5" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-black text-foreground truncate uppercase tracking-tight">
                      {notification.title}
                    </h4>
                    <span className="text-[8px] font-bold text-foreground-muted/50 whitespace-nowrap">
                      {format(notification.createdAt, "HH:mm", { locale })}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-foreground-muted mt-1 leading-tight italic">
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
                  className="h-6 w-6 rounded-md text-foreground-muted/50 hover:text-red-500 hover:bg-red-50"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>

              {!notification.read && (
                <div className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full animate-pulse group-hover:hidden" />
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-4 bg-background/50 border-t-2 border-border">
          <Button 
            variant="ghost" 
            className="w-full text-[10px] font-black uppercase tracking-widest text-foreground-muted hover:text-foreground h-8"
            onClick={() => notifications.forEach(n => onMarkAsRead(n.id))}
          >
            {t('markAllAsRead')}
          </Button>
        </div>
      )}
    </div>
  );
}
