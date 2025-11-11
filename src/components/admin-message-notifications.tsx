'use client';
import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, MessageSquare, X } from 'lucide-react';
import {
  useGetUnreadMessagesQuery,
  useMarkAsReadMutation,
} from '@/app/queries/useMessage';
import { toast } from 'react-toastify';
import { useAppStore } from '@/components/app-provider';
import { formatDateTimeToLocaleString } from '@/lib/utils';

export default function AdminMessageNotifications() {
  const [open, setOpen] = useState(false);
  const [selectedMessageIds, setSelectedMessageIds] = useState<number[]>([]);
  const socket = useAppStore((state) => state.socket);

  const { data: unreadData, refetch } = useGetUnreadMessagesQuery();
  const markAsRead = useMarkAsReadMutation();

  const unreadMessages = unreadData?.payload?.messages || [];
  const initialUnreadCount = Array.isArray(unreadMessages)
    ? unreadMessages.filter((m: any) => !m?.readAt).length
    : 0;
  const [unreadCountLocal, setUnreadCountLocal] =
    useState<number>(initialUnreadCount);

  // Sync local counter when server data changes (e.g., after marking read elsewhere)
  useEffect(() => {
    setUnreadCountLocal(initialUnreadCount);
  }, [initialUnreadCount]);

  // Listen for new messages via WebSocket
  useEffect(() => {
    if (!socket?.connected) return;

    function playMessageSoundOnce() {
      try {
        const audio = new Audio('/message.mp3');
        audio.volume = 0.8;
        const tryPlay = () =>
          audio.play().catch((err) => {
            // Autoplay blocked -> wait for first user interaction then play once
            const onInteract = () => {
              audio.play().catch(() => {});
              document.removeEventListener('click', onInteract);
              document.removeEventListener('keydown', onInteract);
            };
            document.addEventListener('click', onInteract, { once: true });
            document.addEventListener('keydown', onInteract, { once: true });
          });
        if (audio.readyState >= 2) {
          tryPlay();
        } else {
          audio.addEventListener(
            'canplaythrough',
            () => {
              tryPlay();
            },
            { once: true },
          );
          audio.load();
        }
      } catch {}
    }

    function onNewMessage(data: any) {
      console.log('💬 New message from guest:', data);

      // Play message sound once (with autoplay fallback)
      playMessageSoundOnce();

      toast.info(`Tin nhắn mới từ ${data.guestName || 'khách hàng'}`, {
        hideProgressBar: true,
        autoClose: 3000,
      });

      // Increment local unread counter; không gọi refetch danh sách
      setUnreadCountLocal((prev) => prev + 1);
    }

    socket.on('guest-message-to-admin', onNewMessage);

    return () => {
      socket.off('guest-message-to-admin', onNewMessage);
    };
  }, [socket, refetch]);

  const handleMarkAsRead = async (messageId?: number) => {
    try {
      const messageIds = messageId ? [messageId] : selectedMessageIds;

      if (messageIds.length === 0) {
        toast.warning('Vui lòng chọn tin nhắn để đánh dấu đã đọc');
        return;
      }

      await markAsRead.mutateAsync({ messageIds });

      toast.success('Đã đánh dấu đã đọc!');

      // Refresh messages
      refetch();
      setSelectedMessageIds([]);
    } catch (error) {
      toast.error('Không thể đánh dấu đã đọc');
    }
  };

  const toggleMessageSelection = (messageId: number) => {
    setSelectedMessageIds((prev) =>
      prev.includes(messageId)
        ? prev.filter((id) => id !== messageId)
        : [...prev, messageId],
    );
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Tin nhắn từ khách hàng</span>
              <Badge variant="secondary">{unreadCountLocal} chưa đọc</Badge>
            </DialogTitle>
            <DialogDescription>
              Các tin nhắn yêu cầu hỗ trợ từ khách hàng
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto py-4">
            {unreadMessages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Không có tin nhắn mới</p>
              </div>
            ) : (
              <div className="space-y-3">
                {unreadMessages.map((message: any) => (
                  <div
                    key={message.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedMessageIds.includes(message.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => toggleMessageSelection(message.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold">
                            {message.guest?.name || 'Khách hàng'}
                          </span>
                          {message.guest?.tableNode?.name && (
                            <Badge variant="outline" className="text-xs">
                              {message.guest.tableNode.name}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 mb-2">
                          {message.content}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDateTimeToLocaleString(message.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-2 pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              Đã chọn: {selectedMessageIds.length} tin nhắn
            </div>
            <div className="flex gap-2">
              {selectedMessageIds.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleMarkAsRead()}
                  disabled={markAsRead.isPending}
                >
                  Đánh dấu đã đọc
                </Button>
              )}
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setOpen(false)}
              >
                Đóng
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Notification Bell */}
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setOpen(true)}
      >
        <Bell className="h-5 w-5" />
        {unreadCountLocal > 0 && (
          <Badge
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0"
            variant="destructive"
          >
            {unreadCountLocal > 9 ? '9+' : unreadCountLocal}
          </Badge>
        )}
      </Button>
    </>
  );
}
