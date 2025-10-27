/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  GetAccessTokenResType,
  LoginBodyType,
  LoginResType,
  LogoutBodyType,
  OtpBodyType,
  RefreshTokenBodyType,
  RegisterBodyType,
  RegisterResType,
} from '@/app/ValidationSchemas/auth.schema';
import http from '@/lib/http';

export const authApiRequests = {
  refreshTokenRequest: null as Promise<{
    status: number;
    payload: GetAccessTokenResType;
  }> | null,

  logout: () =>
    http.post('/api/auth/logout', null, {
      baseUrl: '',
    }),

  //Hàm dưới đây được gọi từ Next Server Handler nên nó không thể nào lấy Token , nên ta phải truyèn token với header thủ côcng
  slogout: (body: LogoutBodyType & { accessToken: string }) =>
    http.post(
      '/auth/logout',
      {
        refreshToken: body.refreshToken,
      },
      {
        headers: {
          Authorization: `Bearer ${body.accessToken}`,
        },
      },
    ),

  //Vì arrow function không cho dùng this (để lấy phẩn tử cha hiện tại nên chuyển qua function  thường)
  //Tại sao làm vậy : Chúng ta đang bị duplication khi gọi refreshToken
  //Nôn na là Server trả về chưa kịp set tokens mà nó lại gọi tiếp thành ra lấy lấy refreshtoken cũ để gọi -> lỗi 401
  //toỏng kết bị duplicate gọi 2 lần , lần đầu thành công , lần sau lỗi -> 401 -> vì nó lấy RT cũ

  setTokenToCookie: (body: { accessToken: string; refreshToken: string }) =>
    http.post('/api/auth/token', body, { baseUrl: '' }),
  //==================================================================
  sentOtp: (body: OtpBodyType) => http.post('/auth/otp', body),
  sRegister: (body: RegisterBodyType) =>
    http.post<RegisterResType>('/auth/register', body),
  register: (body: RegisterBodyType) =>
    http.post<RegisterResType>('/api/auth/register', body, {
      baseUrl: '',
    }),

  sLogin: (body: LoginBodyType) => http.post<LoginResType>('/auth/login', body),
  Login: (body: LoginBodyType) =>
    http.post<LoginResType>('/api/auth/login', body, {
      baseUrl: '',
    }),
  sRefreshToken: (body: RefreshTokenBodyType) => {
    return http.post<GetAccessTokenResType>('/auth/refresh-token', body);
  },
  async refreshToken() {
    if (this.refreshTokenRequest) return this.refreshTokenRequest; //trong trường hợp nó != null thì nghĩa là nó đang chạy
    this.refreshTokenRequest = http.post<GetAccessTokenResType>(
      '/api/auth/refresh-token',
      null,
      {
        baseUrl: '',
      },
    );
    const resuft = await this.refreshTokenRequest;
    console.log('resuft at auth.ts', resuft);

    this.refreshTokenRequest = null;
    return resuft;
  },
};
