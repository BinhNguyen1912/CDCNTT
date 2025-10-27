import envConfig from '@/config';
import { getAccessTokenFormLocalStorage } from '@/lib/utils';
import { io } from 'socket.io-client';

// Không tạo socket global nữa, để AppProvider quản lý
// const socket = io(envConfig.NEXT_PUBLIC_API_ENDPOINT, {
//   transports: ['websocket'],
//   autoConnect: true,
//   auth: {
//     Authorization: `Bearer ${getAccessTokenFormLocalStorage()}`,
//   },
// });

// export default socket;
// Bắt buộc chạy ở Client -> không được chạy ở Server tại NextJS
