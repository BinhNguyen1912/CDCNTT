/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

//Trang này mục đích phục vụ cho việc Logout khi ACCESS_TOKEN HẾT HẠN TRONG COOKIE

import { authApiRequests } from '@/apiRequest/auth';
import { cookies } from 'next/headers';

//Để có thể xóa cookie sử dụng với cookies(), thì bắt buộc phải bằng server vì client không thể đụng đến được cookies()
//Vì thế phải tạo 1 logout từ client gọi đến , nên ta sẽ xóa cookie hiện tại ở website và đồng thời gọi API từ BE để xóa Tokens luôn
export async function POST() {
  const cookieStore = cookies();

  //Ta chỉ có thể lấy token thông qua cookie từ server , không còn cách nào khác
  //Vì tokens ta chỉ lưu ở 2 nơi , LocalStorge , Cookie
  const accessToken = cookieStore.get('accessToken')?.value;
  const refreshToken = cookieStore.get('refreshToken')?.value;
  cookieStore.delete('accessToken');
  cookieStore.delete('refreshToken');
  if (!accessToken || !refreshToken)
    return Response.json(
      { message: 'Không tìm thấy AccessToken hoặc RefreshToken' },
      {
        status: 200,
      }
    );

  try {
    const resuft = await authApiRequests.slogout({
      accessToken,
      refreshToken,
    });
    return Response.json({
      message: resuft.payload,
    });
  } catch (error: any) {
    return Response.json(
      {
        message: 'Lỗi khi gọi từ Server Backend',
      },
      {
        status: 200,
      }
    );
  }
}
