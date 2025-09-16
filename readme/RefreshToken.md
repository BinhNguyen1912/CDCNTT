# Refresh Token trong Next JS

Các API gửi yêu cầu Authentication có thể gọi ở 2 nơi

1. Server Component : Ví dụ page `/account/me` cần gọi `/me` ở server component để lấy i4 profile của user => Lấy token thông qua `cookie` vì server không lấy token ở localStorage được

2. Client Component : Ví dụ `/account/me` cần gọi `/me` ở client component để lấy thông tin user -> Lấy Token thông qua `LocalStorage`

=> Hết hạn token có thể xảy ra ở cả 2 Server component và client component

Các trường hợp hết hạn `access token` trong Thực tế :

- Đang dùng thì hết hạn : Chúng ta sẽ không để trường hợp này xảy ra , bằng cách có 1 setInterval check token liên tục để refresh Token trước khi nó hết hạn

- Lâu ngày không vào web , vào lại thì hết hạn

Khi vào lại Website thì `MiddleWare.ts` sẽ được gọi đầu tiên . Chúng ta có thể kiểm tra xem access token còn không (vì chúng ta lưu nó vào cookie luôn nên khi hết hạn => cookie tự động xóa nó ra) , nếu không còn thì sẽ bị `redirect` về page client component có nhiệm vụ gọi API refreshToken và redirect về lại trang cũ

_Lưu ý_

- Không Refresh Liên tục
- Chú ý Thứ tự trong MiddleWare

`file /auth/logout` là cơ chế giúp cho việc `logout` khi `access token` bị xóa ra khỏi cookie , tự động, hoặc hết hạn

**Một số lưu ý tránh Bug khi Thực hiện `Đang dùng thì HẾT HẠN TOKEN`**

- Không được để RefreshToken bị gọi Duplicate
- Khi sử dụng trong `useEffect` thì lưu ý hàm clean cho đúng

```ts
return () => {
  // Xoá interval khi component unmount hoặc pathName thay đổi
  clearInterval(interval);
  console.log('Cleared interval!');
};
```

- Khi RefreshToken bị lỗi ở Roure Handler (Next Server) => Luôn luôn trả về `401` dù bất cứ lỗi gì => để nó nhảy vào http (status == 401) và nhảy vào `api/auth/lougout`

- khi refresh token bị lỗi ở `useEffect client` => ngừng interval ngay bằng cách clearInterval(interval); trong `Catch(err)`

- Đưa logic check vào layout ở trang authenticated : Không cho chạy ở những trang mà UnAuthenticated như : Login , logout

- Kiểm tra logic FLOW trong MiddleWare (vì khi chuyển Trang thì nó đều vào đây)

- Chú ý có sửa tgian của Token bên Server APi không , chú ý đến RF , tên biến
