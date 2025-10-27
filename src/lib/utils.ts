/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { EntityError } from '@/lib/http';
import { clsx, type ClassValue } from 'clsx';
import { UseFormSetError } from 'react-hook-form';
import { toast } from 'react-toastify';
import { twMerge } from 'tailwind-merge';
import { format } from 'date-fns';
import { authApiRequests } from '@/apiRequest/auth';
import {
  DishStatus,
  OrderStatus,
  OrderStatusValues,
  Role,
  TypeToOrderStatus,
} from '@/app/constants/type';
import envConfig from '@/config';
import { TokenPayload } from '@/types/jwt.types';
import { guestApiRequests } from '@/apiRequest/guest';
import { BookX, CookingPot, HandCoins, Loader, Truck } from 'lucide-react';
import { io } from 'socket.io-client';
import { decode } from '@/lib/jwt';
import { TableStatus } from '@/app/constants/table.constant';
import { ProductStatus } from '@/app/constants/product.constant';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const normalizePath = (path: string) => {
  return path.startsWith('/') ? path.slice(1) : path;
};

export const handleErrorApi = ({
  error,
  setError,
  duration,
}: {
  error: any;
  setError?: UseFormSetError<any>;
  duration?: number;
}) => {
  if (
    error instanceof EntityError &&
    setError &&
    !Array.isArray(error.payload.errors)
  ) {
    const { path, message } = error.payload as any;
    setError(path, {
      type: 'server',
      message,
    });
    return;
  }
  if (error instanceof EntityError && setError) {
    error.payload.errors.forEach((item) => {
      setError(item.path, {
        type: 'server',
        message: item.message,
      });
    });
  } else {
    toast.error(`${error?.message || 'Lỗi hệ thống'}`, {
      delay: duration || 3000, // Hoặc `delay` nếu thư viện bạn dùng cần vậy
    });
  }
};

//Lưu ý lớn : LocalStorage chỉ có giá trị trong môi trường client
//-> nếu dùng ở môi trường server của next thì kh có giá trị -> gây lỗi

const isBrowser = typeof window !== 'undefined';
export const getAccessTokenFormLocalStorage = () => {
  return isBrowser ? localStorage.getItem('accessToken') : null;
};

export const getRefreshTokenFormLocalStorage = () => {
  return isBrowser ? localStorage.getItem('refreshToken') : null;
};

export const setAccessTokenFormLocalStorage = (accessToken: string) => {
  return isBrowser ? localStorage.setItem('accessToken', accessToken) : null;
};

export const setRefreshTokenFormLocalStorage = (refreshToken: string) => {
  return isBrowser ? localStorage.setItem('refreshToken', refreshToken) : null;
};

export const removeTokensFormLocalStorage = () => {
  isBrowser ? localStorage.removeItem('accessToken') : null;
  isBrowser ? localStorage.removeItem('refreshToken') : null;
};
export const checkAndRefreshToken = async (param?: {
  onError?: () => void;
  onSuccess?: () => void;
  forceRefresh?: boolean;
}) => {
  /**
   * Không nên đưa Logic lấy `accessToken` và `refreshToken` ra khỏi function `checkAndRefreshToken`
   * Vì khi mỗi lần `checkAndRefreshToken()` được gọi thì đã sẽ có 1 cặp tokens mới , tránh trường hợp tạo quá nhiều
   * Tránh Trường hợp bug nó lấy accessToken và refreshToken cũ ở lần đầu ra gọi cho các api tiếp theo
   */

  const accessToken = getAccessTokenFormLocalStorage();
  const refreshToken = getRefreshTokenFormLocalStorage();

  //Chưa đăng nhập cũng hông cho chạy luôn
  if (!accessToken || !refreshToken) return;

  //sau đó decode để lấy thời gian hết hạn của cặp tokens

  const accessTokenDecode = decode(accessToken);
  const refreshTokenDecode = decode(refreshToken);

  if (!accessToken || !refreshToken) alert('Không tìm thấy Tokens');
  //Thời điểm hết hạn của Tokens được tính theo epoch time (s) giây
  //Còn khi dùng cú pháp new Date().getTime() thì nó được tính theo ms
  //LƯU Ý : THỜI ĐIỂM HẾT ẠN CỦA COOKIE SO VỚI GIÁ TRỊ MÌNH SET EXP CHO TOKEN , nên nhiều khi mình vào các page được middleware quản lý nên sẽ bị ảnh hưởng, và có thể bị lệch giữa 0 - 1000(mili s) , nên NOW mình sẽ trừ khấu hao là 1
  //KHÔNG NÊN LÀM TRÒN EXP CỦA TOKENS

  const nowTime = new Date().getTime() / 1000;
  const now = nowTime - 1;

  // Trường hợp RefreshToken hết hạn thì cho logout ra , bằng cách xóa tokens từ localStorage
  if (refreshTokenDecode && refreshTokenDecode.exp <= now) {
    removeTokensFormLocalStorage();
    return param?.onError && param.onError();
  }

  //Ví dụ AccessToken mình hết hạn là 10s
  //Thì mình sẽ kiểm tra còn 1/3 thời gian hết hạn (ví dụ 3s) thì mình bắt đầu cho refreshToken lại
  //Thời gian còn lại sẽ tính dựa trên công thức : accessTokenDecode.ext - now
  //Thời gian hết hạn của AccessToken tính bằng công thức: accessTokenDecode.ext - accessTokenDecode.iat
  if (
    param?.forceRefresh ||
    (accessTokenDecode &&
      accessTokenDecode.exp - now <
        (accessTokenDecode.exp - accessTokenDecode.iat) / 3)
  ) {
    //Gọi Refresh Token Mới
    try {
      const role = accessTokenDecode.roleName;
      //Gọi API để lấy cặp Tokens mới
      const res =
        role == Role.GUEST
          ? await guestApiRequests.refreshToken()
          : await authApiRequests.refreshToken();
      if (res && res.payload) {
        setAccessTokenFormLocalStorage(res.payload.accessToken);
        setRefreshTokenFormLocalStorage(res.payload.refreshToken);
      }
      console.log('res', res);

      param?.onSuccess && param.onSuccess();
    } catch (error: any) {
      //lỗi không cho chạy nữa
      param?.onError && param.onError();
    }
  }
};

export const generateSocketIo = (accessToken: string) => {
  console.log(
    '🔌 Creating socket with endpoint:',
    envConfig.NEXT_PUBLIC_API_ENDPOINT,
  );
  console.log(' Using access token:', accessToken ? 'Present' : 'Missing');

  const socket = io(`${envConfig.NEXT_PUBLIC_API_ENDPOINT}`, {
    auth: {
      authorization: `Bearer ${accessToken}`,
    },
    transports: ['polling'],
    autoConnect: false, // Không tự động connect
    forceNew: true,
    timeout: 20000,
    reconnection: true,
    reconnectionAttempts: 3, // Giảm số lần reconnect
    reconnectionDelay: 2000, // Tăng delay
  });

  console.log(' Socket created:', socket);

  // Add connection event listeners for debugging
  socket.on('connect', () => {
    console.log(' Socket connected successfully with ID:', socket.id);
  });

  socket.on('connect_error', (error) => {
    console.error(' Socket connection error:', error);
  });

  socket.on('disconnect', (reason) => {
    console.log(' Socket disconnected:', reason);
  });

  return socket;
};

export const formatCurrency = (number: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(number);
};

export const getVietnameseDishStatus = (
  status: (typeof ProductStatus)[keyof typeof ProductStatus],
) => {
  switch (status) {
    case ProductStatus.ACTIVE:
      return 'Có sẵn';
    case ProductStatus.INACTIVE:
      return 'Không có sẵn';
    default:
      return 'Ẩn';
  }
};
export const getVietnameseRoleStatus = (
  role: (typeof Role)[keyof typeof Role],
) => {
  switch (role) {
    case Role.STAFF:
      return 'Nhân viên';
    case Role.ADMIN:
      return 'Chủ hệ thống';
    case Role.GUEST:
      return 'Khách hàng vãng lai';
    case Role.USER:
      return 'Khách hàng';
    default:
      return 'Vô Danh';
  }
};

export const getVietnameseOrderStatus = (
  status: (typeof OrderStatusValues)[keyof typeof OrderStatusValues],
) => {
  switch (status) {
    case OrderStatus.COMPLETED:
      return 'Đã phục vụ';
    case OrderStatus.CONFIRMED:
      return 'Đã thanh toán';
    case OrderStatus.PENDING:
      return 'Chờ xử lý';
    case OrderStatus.PREPARING:
      return 'Đang nấu';
    case OrderStatus.READY:
      return 'Sẵn sàng lên món';
    case OrderStatus.PAID:
      return 'Đã thanh toán';
    default:
      return 'Từ chối';
  }
};
export const getBgOrderStatus = (
  status: (typeof OrderStatusValues)[keyof typeof OrderStatusValues],
) => {
  switch (status) {
    case OrderStatus.COMPLETED:
      return 'bg-green-400 text-[10px]';
    case OrderStatus.CONFIRMED:
      return 'bg-blue-500 text-[10px]';
    case OrderStatus.PENDING:
      return 'bg-yellow-300 text-[10px]';
    case OrderStatus.PREPARING:
      return 'bg-red-400 text-[10px]';
    case OrderStatus.READY:
      return 'bg-green-400 text-[10px]';
    default:
      return 'bg-red-400 text-[10px]';
  }
};

export const getVietnameseTableStatus = (status: string) => {
  switch (status) {
    case TableStatus.AVAILABLE:
      return 'Có sẵn';
    case TableStatus.OCCUPIED:
      return 'Bàn đang có khách';
    case TableStatus.OUT_OF_SERVICE:
      return 'Bàn bị hỏng';
    case TableStatus.RESERVED:
      return 'Bàn đã đặt trước';
    default:
      return 'Ẩn';
  }
};

export const getTableLink = ({
  token,
  tableNumber,
}: {
  token: string;
  tableNumber: number;
}) => {
  return (
    envConfig.NEXT_PUBLIC_URL + '/tables/' + tableNumber + '?token=' + token
  );
};

// export const decodeToken = (token: string) => {
//   return jwt.decode(token) as TokenPayload
// }

export function removeAccents(str: string) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

export const simpleMatchText = (fullText: string, matchText: string) => {
  return removeAccents(fullText.toLowerCase()).includes(
    removeAccents(matchText.trim().toLowerCase()),
  );
};

export const OrderStatusIcon = {
  [OrderStatus.PENDING]: Loader,
  [OrderStatus.PREPARING]: CookingPot,
  [OrderStatus.CANCELLED]: BookX,
  [OrderStatus.READY]: Truck,
  [OrderStatus.COMPLETED]: HandCoins,
  [OrderStatus.CONFIRMED]: HandCoins,
};

export const formatDateTimeToLocaleString = (date: string | Date) => {
  return format(
    date instanceof Date ? date : new Date(date),
    'HH:mm:ss dd/MM/yyyy',
  );
};

export const formatDateTimeToTimeString = (date: string | Date) => {
  return format(date instanceof Date ? date : new Date(date), 'HH:mm:ss');
};

export const WrapServerApi = async <T>(fn: () => Promise<T>) => {
  let resuft = null;
  try {
    resuft = await fn();
  } catch (error: any) {
    if (error?.digest?.includes('NEXT_REDIRECT')) {
      throw error;
    }
  }
  return resuft;
};
