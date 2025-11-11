'use client';
import { useEffect } from 'react';
import { useAppStore } from '@/components/app-provider';

/**
 * Component để xử lý socket events cho messaging
 * - Admin: Join manager room để nhận messages
 * - Guest: Listen for message confirmations
 */
export default function MessageSocketHandler() {
  const socket = useAppStore((state) => state.socket);
  const role = useAppStore((state) => state.role);

  useEffect(() => {
    if (!socket?.connected) {
      console.log('🔌 Socket not connected for message handler');
      return;
    }

    console.log('💬 Setting up message socket handlers...');
    console.log('👤 Current role:', role);

    // Admin joins manager room to receive messages
    if (role === 'MANAGER' || role === 'EMPLOYEE') {
      console.log('🎧 Admin joining manager room...');
      socket.emit('join-manager-room');
    }

    // Listen for message sent confirmation
    function onMessageSent(data: any) {
      console.log('✅ Message sent confirmation:', data);
    }

    // Listen for message errors
    function onMessageError(error: any) {
      console.error('❌ Message error:', error);
    }

    socket.on('message-sent', onMessageSent);
    socket.on('message-error', onMessageError);

    return () => {
      socket.off('message-sent', onMessageSent);
      socket.off('message-error', onMessageError);
    };
  }, [socket, role]);

  return null;
}
