import { NextResponse, type NextRequest } from 'next/server';
import { Role } from '@/app/constants/type';
import { decode } from '@/lib/jwt';

const managePaths = ['/manage'];
const guestPaths = ['/guest'];
const onlyOwnerPaths = ['/manage/owner'];
const privatePaths = [...managePaths, ...guestPaths];
const publicPaths = ['/auth'];
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log(`Middleware check ${pathname} ...`);

  const accessToken = request.cookies.get('accessToken')?.value;

  const refreshToken = request.cookies.get('refreshToken')?.value;
  //Tại sao lấy refresh ?
  //Vì khi đăng nhập chắc chắn sẽ có refreshToken và thời hạn nó dài hơn thằng AccessToken

  //1. Chưa đăng nhập thì không cho vào Private Path
  if (privatePaths.some((path) => pathname.startsWith(path)) && !refreshToken) {
    //Mình phòng trường hợp quên xóa token trong local nên mình sẽ đánh dấu , nên khi vào xử lý logic bên
    const url = new URL('/auth/login', request.url);
    url.searchParams.set('clearTokens', 'true');
    return NextResponse.redirect(url);
  }

  //2. Đăng nhập rồi thì không cho vào Login nữa
  if (refreshToken) {
    //2.1 Cố tình vào page Login lại
    if (publicPaths.some((path) => pathname.startsWith(path)))
      return NextResponse.redirect(new URL('/', request.url));

    //2.2 Trường hợp đăng nhập rồi nhưng AccessToken bị hết hạn
    if (
      privatePaths.some((path) => pathname.startsWith(path)) &&
      !accessToken
    ) {
      const url = new URL('/auth/refresh-token', request.url);
      url.searchParams.set('refreshToken', refreshToken);
      url.searchParams.set('redirect', pathname);

      // console.log('url', url);

      return Response.redirect(url);
    }

    //2.3 Trường hợp Phân Quyền
    const role = decode(refreshToken).roleName;

    //Trường hợp Guest truy cập vào các paths của Manage
    const isGuestToManagePath =
      String(role) === String(Role.GUEST) &&
      managePaths.some((path) => pathname.startsWith(path));
    // console.log('isGuestToManagePath', isGuestToManagePath);

    //Trường hợp không phải Guest lại truy cập vào các paths của Guest
    const isNotGuestToGuestPath =
      role != Role.GUEST &&
      guestPaths.some((path) => pathname.startsWith(path));

    //Trường hợp không phải owner lại truy cập vào các paths của owner
    const iNotOwnerGotoOwnerPath =
      role !== Role.ADMIN &&
      onlyOwnerPaths.some((path) => pathname.startsWith(path));

    if (
      isGuestToManagePath ||
      isNotGuestToGuestPath ||
      iNotOwnerGotoOwnerPath
    ) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

//Cac route bat dau bang manage se duoc quan ly boi middleware vi co :/path*
//Khi vào các Route này , middleware bắt đầu chạy
export const config = {
  matcher: ['/manage/:path*', '/guest/:paths*', '/auth/login'],
};
