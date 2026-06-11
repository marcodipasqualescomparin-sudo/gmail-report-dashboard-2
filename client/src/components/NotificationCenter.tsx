import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Bell, X, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";
import { sendBrowserNotification, requestNotificationPermission } from "@/lib/browserNotifications";

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [playSound, setPlaySound] = useState(true);
  const [lastUnreadCount, setLastUnreadCount] = useState(0);

  const unreadCount = trpc.notifications.count.useQuery(undefined, {
    refetchInterval: 5000, // Poll every 5 seconds
  });

  const unreadNotifications = trpc.notifications.unread.useQuery(undefined, {
    refetchInterval: 5000,
  });

  const markAsRead = trpc.notifications.markAsRead.useMutation();
  const markAllAsRead = trpc.notifications.markAllAsRead.useMutation();
  const deleteNotification = trpc.notifications.delete.useMutation();

  // Play sound and send browser notification when new notifications arrive
  useEffect(() => {
    if (playSound && unreadCount.data && unreadCount.data > lastUnreadCount) {
      playNotificationSound();
      
      // Send browser notification for new notifications
      const newNotifications = unreadNotifications.data?.filter(n => !n.isRead) || [];
      if (newNotifications.length > 0) {
        const latest = newNotifications[0];
        if (latest && latest.title) {
          sendBrowserNotification({
            title: latest.title,
            body: latest.message,
            icon: '/favicon.ico',
            tag: `notification-${latest.id}`,
            requireInteraction: true,
          });
        }
      }
    }
    setLastUnreadCount(unreadCount.data || 0);
  }, [unreadCount.data, playSound, lastUnreadCount, unreadNotifications.data]);

  // Request notification permission on first load
  useEffect(() => {
    const permissionRequested = localStorage.getItem('notification-permission-requested');
    if (!permissionRequested && 'Notification' in window) {
      requestNotificationPermission().then(() => {
        localStorage.setItem('notification-permission-requested', 'true');
      });
    }
  }, []);

  const playNotificationSound = () => {
    try {
      const audio = new Audio("data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA==");
      audio.play().catch(() => {
        // Silently fail if audio can't play
      });
    } catch (e) {
      // Silently fail
    }
  };

  const handleMarkAsRead = (notificationId: number) => {
    markAsRead.mutate({ notificationId }, {
      onSuccess: () => {
        unreadCount.refetch();
        unreadNotifications.refetch();
      },
    });
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate(undefined, {
      onSuccess: () => {
        unreadCount.refetch();
        unreadNotifications.refetch();
      },
    });
  };

  const handleDelete = (notificationId: number) => {
    deleteNotification.mutate({ notificationId }, {
      onSuccess: () => {
        unreadCount.refetch();
        unreadNotifications.refetch();
      },
    });
  };

  const getNotificationIcon = (type: string) => {
    if (type === "high_priority_email") {
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
    if (type === "ddt_alert") {
      return <AlertCircle className="w-4 h-4 text-orange-500" />;
    }
    return <Bell className="w-4 h-4 text-blue-500" />;
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-lg"
          aria-label="Notifiche"
        >
          <Bell className="h-5 w-5" />
          {unreadCount.data && unreadCount.data > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount.data > 9 ? "9+" : unreadCount.data}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex flex-col max-h-96">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold text-sm">Notifiche</h3>
            {unreadCount.data && unreadCount.data > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="text-xs"
              >
                Segna tutto come letto
              </Button>
            )}
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {unreadNotifications.isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Spinner className="w-5 h-5" />
              </div>
            ) : unreadNotifications.data && unreadNotifications.data.length > 0 ? (
              <div className="divide-y">
                {unreadNotifications.data.map((notification: any) => (
                  <div
                    key={notification.id}
                    className="p-4 hover:bg-accent/50 transition-colors group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm leading-tight">
                          {notification.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {formatDistanceToNow(new Date(notification.createdAt), {
                            addSuffix: true,
                            locale: it,
                          })}
                        </p>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="h-6 w-6 p-0"
                        >
                          <Check className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(notification.id)}
                          className="h-6 w-6 p-0"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Bell className="w-8 h-8 text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">
                  Nessuna notifica
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <Separator />
          <div className="p-3 flex items-center justify-between text-xs gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={playSound}
                onChange={(e) => setPlaySound(e.target.checked)}
                className="rounded"
              />
              <span>Suoni attivati</span>
            </label>
            {typeof Notification !== 'undefined' && Notification.permission !== 'granted' && (
              <Button
                variant="outline"
                size="sm"
                onClick={requestNotificationPermission}
                className="text-xs"
              >
                Abilita notifiche
              </Button>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
