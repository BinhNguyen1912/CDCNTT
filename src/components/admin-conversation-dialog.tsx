'use client';
import { useEffect, useRef, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { MessageSquare, Send, User } from 'lucide-react';
import {
  useGetConversationWithGuestQuery,
  useGetUnreadMessagesQuery,
  useGetReceivedMessagesQuery,
  useReplyToGuestMutation,
  useSendAdminToGuestMessageMutation,
} from '@/app/queries/useMessage';
import { toast } from 'react-toastify';
import { formatDateTimeToTimeString } from '@/lib/utils';
import { ConversationResponseType } from '@/app/ValidationSchemas/message.schema';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/components/app-provider';

export default function AdminConversationDialog() {
  const [open, setOpen] = useState(false);
  const [selectedGuestId, setSelectedGuestId] = useState<number | null>(null);
  const [messageContent, setMessageContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: unreadData, refetch: refetchUnread } =
    useGetUnreadMessagesQuery();
  const { data: receivedMessagesData, refetch: refetchReceived } =
    useGetReceivedMessagesQuery();
  const { data: conversation, isLoading: isLoadingConversation } =
    useGetConversationWithGuestQuery(selectedGuestId);
  const sendMessageMutation = useSendAdminToGuestMessageMutation();
  const socket = useAppStore((state) => state.socket);

  const unreadMessages = unreadData?.payload?.messages || [];
  const initialUnreadCount = Array.isArray(unreadMessages)
    ? unreadMessages.filter((m: any) => !m?.readAt).length
    : 0;
  const [unreadCountLocal, setUnreadCountLocal] =
    useState<number>(initialUnreadCount);

  useEffect(() => {
    setUnreadCountLocal(initialUnreadCount);
  }, [initialUnreadCount]);

  // Extract received messages
  const receivedMessages = Array.isArray(receivedMessagesData?.payload)
    ? receivedMessagesData.payload
    : Array.isArray(receivedMessagesData)
      ? receivedMessagesData
      : [];

  // Debug logs
  console.log('Unread messages:', unreadMessages);
  console.log('Received messages:', receivedMessages);
  console.log('Received messages count:', receivedMessages.length);

  // Extract unique guests from received messages
  const guestsWithMessages = receivedMessages.reduce(
    (acc: any[], message: any) => {
      if (
        message.fromGuest &&
        !acc.find((g) => g.id === message.fromGuest.id)
      ) {
        acc.push({
          id: message.fromGuest.id,
          name: message.fromGuest.name,
          tableNode: message.fromGuest.tableNode,
          unreadCount: receivedMessages.filter(
            (m: any) => m.fromGuest?.id === message.fromGuest.id && !m.readAt,
          ).length,
        });
      }
      return acc;
    },
    [],
  );

  // Debug log
  console.log('Guests with messages:', guestsWithMessages);

  // Listen for new messages via WebSocket
  useEffect(() => {
    if (!socket?.connected) return;

    function playMessageSoundOnce() {
      try {
        const audio = new Audio('/message.mp3');
        audio.volume = 0.8;
        const tryPlay = () =>
          audio.play().catch(() => {
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
  }, [socket, refetchUnread, refetchReceived]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  // Focus input when dialog opens
  useEffect(() => {
    if (open && selectedGuestId) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [open, selectedGuestId]);

  const handleSendMessage = async () => {
    if (!messageContent.trim() || !selectedGuestId) {
      return;
    }

    console.log('Sending message:', {
      guestId: selectedGuestId,
      content: messageContent.trim(),
    });

    try {
      const result = await sendMessageMutation.mutateAsync({
        guestId: selectedGuestId,
        data: {
          content: messageContent.trim(),
          guestId: selectedGuestId,
        },
      });

      console.log('Message sent successfully:', result);
      setMessageContent('');
      inputRef.current?.focus();
    } catch (error) {
      console.error('Send message error:', error);
      toast.error('Không thể gửi tin nhắn');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const selectedGuest = guestsWithMessages.find(
    (g) => g.id === selectedGuestId,
  );

  // Extract messages from response
  // The API returns { status, payload } where payload is an array
  let messages: ConversationResponseType = [];

  if (conversation) {
    if (Array.isArray(conversation.payload)) {
      messages = conversation.payload;
    } else if (Array.isArray(conversation)) {
      messages = conversation;
    }
  }

  // Debug logs
  console.log('Selected Guest ID:', selectedGuestId);
  console.log('Conversation response:', conversation);
  console.log('Extracted messages:', messages);
  console.log('Messages count:', messages.length);

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl h-[80vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle className="flex items-center justify-between">
              <span>Tin nhắn với khách hàng</span>
              <Badge variant="secondary">{unreadCountLocal} chưa đọc</Badge>
            </DialogTitle>
            <DialogDescription>
              Chọn khách hàng để xem và trả lời tin nhắn
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 flex overflow-hidden">
            {/* Sidebar - List of guests */}
            <div className="w-1/3 border-r overflow-hidden flex flex-col">
              <div className="p-3 border-b bg-muted/50">
                <h3 className="text-sm font-semibold">Khách hàng</h3>
              </div>
              <div className="flex-1 overflow-y-auto">
                <div className="divide-y">
                  {guestsWithMessages.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground text-sm">
                      <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>Chưa có tin nhắn</p>
                    </div>
                  ) : (
                    guestsWithMessages.map((guest) => (
                      <button
                        key={guest.id}
                        onClick={() => setSelectedGuestId(guest.id)}
                        className={cn(
                          'w-full p-4 text-left hover:bg-muted/50 transition-colors',
                          selectedGuestId === guest.id && 'bg-muted',
                        )}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium text-sm">
                            {guest.name}
                          </span>
                        </div>
                        {guest.tableNode?.name && (
                          <Badge variant="outline" className="text-xs mb-1">
                            {guest.tableNode.name}
                          </Badge>
                        )}
                        {guest.unreadCount > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {guest.unreadCount} tin nhắn mới
                          </Badge>
                        )}
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Main content - Conversation */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {selectedGuestId ? (
                <>
                  {/* Conversation header */}
                  <div className="p-4 border-b bg-muted/50">
                    <div className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      <div>
                        <h3 className="font-semibold">{selectedGuest?.name}</h3>
                        {selectedGuest?.tableNode?.name && (
                          <p className="text-sm text-muted-foreground">
                            {selectedGuest.tableNode.name}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 p-4 overflow-y-auto">
                    <div className="space-y-4">
                      {isLoadingConversation ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <div className="animate-pulse">Đang tải...</div>
                        </div>
                      ) : messages.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>Chưa có tin nhắn</p>
                        </div>
                      ) : (
                        messages.map((message) => {
                          // Check if message is from a guest (has fromGuestId)
                          const isFromGuest =
                            message.fromGuestId !== null &&
                            message.fromGuestId !== undefined;

                          // Otherwise it's from admin (has fromUserId)
                          const isFromAdmin =
                            message.fromUserId !== null &&
                            message.fromUserId !== undefined;

                          return (
                            <div
                              key={message.id}
                              className={cn(
                                'flex gap-3',
                                isFromGuest ? 'justify-start' : 'justify-end',
                              )}
                            >
                              {isFromGuest && (
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                  <User className="w-4 h-4 text-primary" />
                                </div>
                              )}

                              <div
                                className={cn(
                                  'rounded-lg px-4 py-2 max-w-[80%]',
                                  isFromGuest
                                    ? 'bg-muted'
                                    : 'bg-primary text-primary-foreground',
                                )}
                              >
                                <p className="text-sm">{message.content}</p>
                                <p
                                  className={cn(
                                    'text-xs mt-1',
                                    isFromGuest
                                      ? 'text-muted-foreground'
                                      : 'text-primary-foreground/70',
                                  )}
                                >
                                  {formatDateTimeToTimeString(
                                    message.createdAt,
                                  )}
                                </p>
                              </div>

                              {isFromAdmin && (
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                  <User className="w-4 h-4 text-primary" />
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  </div>

                  {/* Input area */}
                  <div className="p-4 border-t">
                    <div className="flex gap-2">
                      <Input
                        ref={inputRef}
                        value={messageContent}
                        onChange={(e) => setMessageContent(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Nhập tin nhắn..."
                        className="flex-1"
                        disabled={sendMessageMutation.isPending}
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={
                          !messageContent.trim() ||
                          sendMessageMutation.isPending
                        }
                        size="icon"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Chọn một khách hàng để xem tin nhắn</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Notification Button */}
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setOpen(true)}
      >
        <MessageSquare className="h-5 w-5" />
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
