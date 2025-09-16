/* eslint-disable @typescript-eslint/no-explicit-any */
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { HttpError } from '@/lib/http';
import { GuestLoginBodyType } from '@/app/schemaValidations/guest.schema';
import { guestApiRequests } from '@/apiRequest/guest';
export async function POST(request: Request) {
  const body = (await request.json()) as GuestLoginBodyType;

  const cookieStores = cookies();
  try {
    const { payload } = await guestApiRequests.sLogin(body);

    const {
      data: { accessToken, refreshToken },
    } = payload;
    const decodeAccessToken = jwt.decode(accessToken) as { exp: number };
    const decodeRefreshToken = jwt.decode(refreshToken) as { exp: number };

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

    return Response.json(payload);
  } catch (error: any) {
    if (error instanceof HttpError) {
      return Response.json(error.payload, { status: error.status });
    } else {
      console.log(error);

      return Response.json({ message: 'Loi server' }, { status: 500 });
    }
  }
}
