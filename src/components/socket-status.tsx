'use client';
import { useAppStore } from '@/components/app-provider';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';

export default function SocketStatus() {
  const socket = useAppStore((state) => state.socket);
  const [connectionStatus, setConnectionStatus] = useState<
    'connecting' | 'connected' | 'disconnected'
  >('disconnected');

  useEffect(() => {
    if (!socket) {
      setConnectionStatus('disconnected');
      return;
    }

    // Set initial status
    if (socket.connected) {
      setConnectionStatus('connected');
    } else {
      setConnectionStatus('connecting');
    }

    // Listen for connection events
    const handleConnect = () => {
      console.log('Socket connected:', socket.id);
      setConnectionStatus('connected');
    };

    const handleDisconnect = () => {
      console.log('Socket disconnected');
      setConnectionStatus('disconnected');
    };

    const handleConnectError = (error: any) => {
      console.error('Socket connection error:', error);
      setConnectionStatus('disconnected');
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
    };
  }, [socket]);

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'bg-green-500';
      case 'connecting':
        return 'bg-yellow-500';
      case 'disconnected':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Đã kết nối';
      case 'connecting':
        return 'Đang kết nối...';
      case 'disconnected':
        return 'Mất kết nối';
      default:
        return 'Không xác định';
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
      <Badge variant="outline" className="text-xs">
        Socket: {getStatusText()}
      </Badge>
      {socket?.id && (
        <Badge variant="secondary" className="text-xs">
          ID: {socket.id}
        </Badge>
      )}
    </div>
  );
}
