/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { authApiRequests } from '@/apiRequest/auth';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
export async function POST(request: Request) {
  const cookieStore = cookies();
  const refreshToken = cookieStore.get('refreshToken')?.value;
  console.log('refreshToken at cookie store', refreshToken);

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
    const payload = await authApiRequests.sRefreshToken({ refreshToken });

    const decodeAccessToken = jwt.decode(payload.payload.accessToken) as {
      exp: number;
    };
    const decodeRefreshToken = jwt.decode(payload.payload.refreshToken) as {
      exp: number;
    };

    cookieStore.set({
      value: payload.payload.accessToken,
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      name: 'accessToken',
      secure: true,
      expires: decodeAccessToken.exp * 1000,
    });
    cookieStore.set({
      value: payload.payload.refreshToken,
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      name: 'refreshToken',
      secure: true,
      expires: decodeRefreshToken.exp * 1000,
    });
    return Response.json(payload.payload);
  } catch (error: any) {
    console.log('error', error);

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
