/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  GetAccessTokenResType,
  RefreshTokenBodyType,
} from '@/app/ValidationSchemas/auth.schema';
import {
  GuestLoginType,
  GuestOrdersListType,
  GuestResLoginType,
} from '@/app/ValidationSchemas/guest.schema';
import {
  GuestCreateNewOrder,
  GuestCreateNewOrderType,
} from '@/app/ValidationSchemas/order.schema';
import { LogoutBodyType } from '@/app/ValidationSchemas/auth.schema';

import http from '@/lib/http';

export const guestApiRequests = {
  refreshTokenRequest: null as Promise<{
    status: number;
    payload: GetAccessTokenResType | null;
  }> | null,
  sLogin: (body: GuestLoginType) =>
    http.post<GuestResLoginType>('/guest/login', body),
  Login: (body: GuestLoginType) =>
    http.post<GuestResLoginType>('/api/guest/auth/login', body, {
      baseUrl: '',
    }),

  logout: () =>
    http.post('/api/guest/auth/logout', null, {
      baseUrl: '',
    }),

  //Hàm dưới đây được gọi từ Next Server Handler nên nó không thể nào lấy Token , nên ta phải truyèn token với header thủ côcng
  slogout: (body: LogoutBodyType & { accessToken: string }) =>
    http.post(
      '/guest/auth/logout',
      {
        refreshToken: body.refreshToken,
      },
      {
        headers: {
          Authorization: `Bearer ${body.accessToken}`,
        },
      },
    ),

  sRefreshToken: (body: RefreshTokenBodyType) => {
    return http.post<GetAccessTokenResType>('/guest/auth/refresh-token', body);
  },

  //Vì arrow function không cho dùng this (để lấy phẩn tử cha hiện tại nên chuyển qua function  thường)
  //Tại sao làm vậy : Chúng ta đang bị duplication khi gọi refreshToken
  //Nôn na là Server trả về chưa kịp set tokens mà nó lại gọi tiếp thành ra lấy lấy refreshtoken cũ để gọi -> lỗi 401
  //toỏng kết bị duplicate gọi 2 lần , lần đầu thành công , lần sau lỗi -> 401 -> vì nó lấy RT cũ
  async refreshToken() {
    if (this.refreshTokenRequest) return this.refreshTokenRequest; //trong trường hợp nó != null thì nghĩa là nó đang chạy
    this.refreshTokenRequest = http.post<GetAccessTokenResType>(
      '/api/guest/auth/refresh-token',
      null,
      {
        baseUrl: '',
      },
    );
    const resuft = await this.refreshTokenRequest;
    this.refreshTokenRequest = null;
    return resuft;
  },

  order: (data: GuestCreateNewOrderType) =>
    http.post<GuestCreateNewOrder>('/guest/new-order', data),
  getGuestOrderList: () => http.get<GuestOrdersListType>('/guest/orders'),
};
