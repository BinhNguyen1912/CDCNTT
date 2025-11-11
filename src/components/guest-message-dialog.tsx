'use client';
import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquare, Send, User } from 'lucide-react';
import {
  useGetGuestConversationQuery,
  useSendGuestMessageMutation,
} from '@/app/queries/useMessage';
import { toast } from 'react-toastify';
import { formatDateTimeToTimeString } from '@/lib/utils';
import { ConversationResponseType } from '@/app/ValidationSchemas/message.schema';
import { cn } from '@/lib/utils';

export default function GuestMessageDialog() {
  const [open, setOpen] = useState(false);
  const [messageContent, setMessageContent] = useState('');
  const [guestInfo, setGuestInfo] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: conversationData, isLoading } =
    useGetGuestConversationQuery(open);
  const sendMessageMutation = useSendGuestMessageMutation();

  // Get guest info from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('guestInfo');
      if (raw) {
        setGuestInfo(JSON.parse(raw));
      }
    } catch {}
  }, []);

  // Extract messages from response
  let messages: ConversationResponseType = [];
  if (conversationData) {
    if (Array.isArray(conversationData.payload)) {
      messages = conversationData.payload;
    } else if (Array.isArray(conversationData)) {
      messages = conversationData;
    }
  }

  // Debug log
  console.log('Guest Conversation Data:', conversationData);
  console.log('Extracted Messages:', messages);
  console.log('Messages Count:', messages.length);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when dialog opens
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [open]);

  const handleSendMessage = async () => {
    if (!messageContent.trim() || !guestInfo?.id) {
      toast.error('Không thể xác định thông tin khách hàng');
      return;
    }

    if (sendMessageMutation.isPending) {
      return;
    }

    try {
      await sendMessageMutation.mutateAsync({
        guestId: guestInfo.id,
        content: messageContent.trim(),
      });

      setMessageContent('');
      inputRef.current?.focus();
    } catch (error) {
      toast.error('Không thể gửi tin nhắn. Vui lòng thử lại!');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md h-[450px] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-4 py-3 border-b">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <User className="w-4 h-4" />
            <span>Chat với nhân viên</span>
          </DialogTitle>
        </DialogHeader>

        {/* Messages */}
        <div className="flex-1 p-3 overflow-y-auto">
          {isLoading ? (
            <div className="text-center py-6 text-muted-foreground">
              <div className="animate-pulse text-sm">Đang tải...</div>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Chưa có tin nhắn</p>
              <p className="text-xs mt-1">
                Gửi tin nhắn để được hỗ trợ từ nhân viên
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {messages.map((message) => {
                // Check if message is from guest
                const isFromGuest =
                  message.fromGuestId !== null &&
                  message.fromGuestId !== undefined;
                // Check if message is from admin
                const isFromAdmin =
                  message.fromUserId !== null &&
                  message.fromUserId !== undefined;

                return (
                  <div
                    key={message.id}
                    className={cn(
                      'flex gap-2',
                      isFromGuest ? 'justify-end' : 'justify-start',
                    )}
                  >
                    {isFromAdmin && (
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <User className="w-3.5 h-3.5 text-primary" />
                      </div>
                    )}

                    <div
                      className={cn(
                        'rounded-lg px-3 py-1.5 max-w-[75%]',
                        isFromGuest
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted',
                      )}
                    >
                      <p className="text-sm leading-relaxed">
                        {message.content}
                      </p>
                      <p
                        className={cn(
                          'text-xs mt-0.5',
                          isFromGuest
                            ? 'text-primary-foreground/70'
                            : 'text-muted-foreground',
                        )}
                      >
                        {formatDateTimeToTimeString(message.createdAt)}
                      </p>
                    </div>

                    {isFromGuest && (
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <User className="w-3.5 h-3.5 text-primary" />
                      </div>
                    )}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="p-3 border-t">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Nhập tin nhắn..."
              className="flex-1 h-9"
              disabled={sendMessageMutation.isPending}
              maxLength={1000}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!messageContent.trim() || sendMessageMutation.isPending}
              size="icon"
              className="h-9 w-9"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {messageContent.length}/1000 ký tự
          </p>
        </div>
      </DialogContent>

      {/* Trigger button */}
      <Button
        variant="outline"
        size="sm"
        className="relative"
        title="Chat với nhân viên"
        onClick={() => setOpen(true)}
      >
        <MessageSquare className="w-4 h-4" />
      </Button>
    </Dialog>
  );
}
