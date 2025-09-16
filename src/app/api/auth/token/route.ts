/* eslint-disable @typescript-eslint/no-explicit-any */
import { cookies } from 'next/headers';
import { HttpError } from '@/lib/http';
import { decode } from '@/lib/jwt';
export async function POST(request: Request) {
  const body = (await request.json()) as {
    accessToken: string;
    refreshToken: string;
  };

  const cookieStores = cookies();
  try {
    const { accessToken, refreshToken } = body;
    const decodeAccessToken = decode(accessToken);
    const decodeRefreshToken = decode(refreshToken);

    cookieStores.set('accessToken', accessToken, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      expires: new Date(decodeAccessToken.exp * 1000),
    });
    cookieStores.set('refreshToken', refreshToken, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      expires: new Date(decodeRefreshToken.exp * 1000),
    });

    return Response.json(body);
  } catch (error: any) {
    if (error instanceof HttpError) {
      return Response.json(error.payload, { status: error.status });
    } else {
      console.log(error);

      return Response.json({ message: 'Loi server' }, { status: 500 });
    }
  }
}
