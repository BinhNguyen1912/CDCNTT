/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import RefreshToken from '@/components/refresh-token';
import { create } from 'zustand';
import {
  generateSocketIo,
  getAccessTokenFormLocalStorage,
  removeTokensFormLocalStorage,
} from '@/lib/utils';
import type { Socket } from 'socket.io-client';
import { RoleType } from '@/types/jwt.types';
import { set } from 'zod';
import socket from '@/lib/socketIo';
import { decode } from '@/lib/jwt';
import ListenLogoutSocket from '@/components/listen-logout-socket';
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Không tự động refetch khi người dùng quay lại tab (giảm gọi API không cần thiết)
      refetchOnWindowFocus: false,
      // Không refetch lại mỗi khi component mount (nếu đã có cache)
    },
  },
});

// const AppContext = createContext({
//   isAuth: false,
//   role: undefined as RoleType | undefined,
//   setRole: (role?: RoleType | undefined) => {},
//   socket: undefined as Socket | undefined,
//   setSocket: (socket?: Socket | undefined) => {},
//   disconnectSocket: () => {},
// });
type AppStoreType = {
  isAuth: boolean;
  role: RoleType | undefined;
  setRole: (role?: RoleType | undefined) => void;
  // socket: Socket | undefined;
  // setSocket: (socket?: Socket | undefined) => void;
  // disconnectSocket: () => void;
};
export const useAppStore = create<AppStoreType>((set) => ({
  isAuth: false,
  role: undefined as RoleType | undefined,
  setRole: (role?: RoleType | undefined) => {
    set({ role, isAuth: Boolean(role) });
    if (!role) {
      removeTokensFormLocalStorage();
    }
  },
  // socket: undefined as Socket | undefined,
  // setSocket: (socket?: Socket | undefined) => set({ socket }),
  // disconnectSocket: () =>
  //   set((state) => {
  //     state.socket?.disconnect();
  //     return { socket: undefined };
  //   }),
}));

// export const useAppContext = () => {
//   return useContext(AppContext);
// };

export default function AppProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // const [role, setRoleState] = useState<RoleType | undefined>();
  // const [socket, setSocket] = useState<Socket>();

  const setRole = useAppStore((state) => state.setRole);
  // const setSocket = useAppStore((state) => state.setSocket);
  //gọi sau khi component render lần đầu tiên. Mảng rỗng [] nghĩa là chỉ chạy một lần duy nhất khi component mount.
  //Nếu accessToken tồn tại (nghĩa là người dùng đã đăng nhập trước đó), thì gọi setIsAuthState(true) để cập nhật trạng thái đăng nhập của người dùng là true (đã xác thực).

  const count = useRef(0);
  useEffect(() => {
    //Neu ma co access token thi sao ?
    if (count.current === 0) {
      const accessToken = getAccessTokenFormLocalStorage();

      if (accessToken && accessToken !== undefined && accessToken !== '') {
        const payload = decode(accessToken);

        if (payload && payload.roleName) {
          setRole(payload.roleName);
          // setSocket(generateSocketIo(accessToken));
        } else {
          console.warn('AccessToken không hợp lệ hoặc thiếu roleName', payload);
          //(X)
          removeTokensFormLocalStorage();
        }
      }

      count.current++;
    }
  }, [setRole]);

  // const disconnectSocket = useCallback(() => {
  //   socket?.disconnect();
  //   setSocket(undefined);
  // }, [socket, setSocket]);

  //useCallback là một React Hook dùng để ghi nhớ (memoize) một hàm, giúp tránh việc hàm bị tạo lại mỗi lần component re-render.
  //Nói cách khác: nếu bạn không dùng useCallback, thì mỗi lần component render lại, một phiên bản setIsAuth mới sẽ được tạo ra.

  //Tạo sao không dùng setIsAuthState để set Trạng thái lại
  //=> Vì cần custom để xóa cặp tokens đó hiểu hommm
  // const setRole = useCallback((role?: RoleType | undefined) => {
  //   if (role) {
  //     setRoleState(role);
  //   } else {
  //     removeTokensFormLocalStorage();
  //   }
  // }, []);

  // const isAuth = Boolean(role);
  return (
    // <AppContext.Provider
    //   value={{ role, isAuth, setRole, setSocket, socket, disconnectSocket }}
    // >
    <QueryClientProvider client={queryClient}>
      {children}
      <RefreshToken />
      <ListenLogoutSocket />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
    // </AppContext.Provider>
  );
}
