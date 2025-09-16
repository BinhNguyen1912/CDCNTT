/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { authApiRequests } from '@/apiRequest/auth';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { guestApiRequests } from '@/apiRequest/guest';
export async function POST(request: Request) {
  const cookieStore = cookies();
  const refreshToken = cookieStore.get('refreshToken')?.value;
  if (!refreshToken) {
    return Response.json(
      {
        message: 'Không tìm thấy Refresh Token',
      },
      {
        status: 401,
      },
    );
  }
  try {
    const payload = await guestApiRequests.sRefreshToken({ refreshToken });
    const decodeAccessToken = jwt.decode(payload.payload.accessToken) as {
      ext: number;
    };
    const decodeRefreshToken = jwt.decode(payload.payload.refreshToken) as {
      ext: number;
    };
    cookieStore.set({
      value: payload.payload.accessToken,
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      name: 'accessToken',
      secure: true,
      expires: decodeAccessToken.ext * 1000,
    });
    cookieStore.set({
      value: payload.payload.refreshToken,
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      name: 'refreshToken',
      secure: true,
      expires: decodeRefreshToken.ext * 1000,
    });
    return Response.json(payload.payload);
  } catch (error: any) {
    return Response.json(
      {
        message: 'Lỗi khi gọi từ Server Backend',
      },
      {
        status: 401,
      },
    );
  }
}
