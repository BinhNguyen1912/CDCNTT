# Tìm hiểu mô hình bảo mật trong ứng dụng Next.js fullstack, nơi bạn dùng cả Next Client (chạy trong trình duyệt) và Next Server (backend Node.js chạy trên server).

1. Tại sao sau khi `Next.js client` gửi login request đến `backend (BE server)`, nhận được `token`, thì lại gửi token đó lên `Next.js server (route API hoặc action)` để set-cookie, thay vì tự set ở client?

1. Ai có quyền `set HttpOnly cookie`?
   👉 Chỉ `server` mới có quyền set cookie dạng `HttpOnly`, thông qua **response header Set-Cookie**.
   => _Client-side (trình duyệt) KHÔNG thể tự tạo được cookie HttpOnly_.
   => _Mục đích: Cookie HttpOnly bảo vệ token khỏi bị đọc bằng JavaScript, chống lại tấn công XSS (cross-site scripting)_

Mục tiêu làm vậy để:
Lý do Giải thích
🔐 Bảo mật Tránh để token ở localStorage, tránh XSS đọc được token
✅ Chuẩn hóa Làm theo chuẩn session-based auth truyền thống
🌐 Tự động gửi Trình duyệt sẽ tự gửi cookie mỗi khi gọi API đến Next server (nếu cùng domain)
🔒 Không expose Token không lộ ra trên client
🧩 Hỗ trợ SSR Khi dùng getServerSideProps hay server component, server có thể đọc cookie

Nếu KHÔNG gửi qua server mà để ở client thì:
Cách Nhược điểm
Gán token vào localStorage Dễ bị XSS
Gán token vào cookie (non-HttpOnly) bằng document.cookie Bị đọc bằng JS => mất bảo mật
Không dùng cookie mà gán vào header thủ công mỗi request Không hỗ trợ SSR hoặc middleware dễ dàng

✅ **Kết luận:**
Bạn gửi token lên Next Server để server gán HttpOnly Cookie cho trình duyệt — vì:

Client không thể gán được HttpOnly

Giữ token an toàn

Hỗ trợ các tính năng như SSR, Middleware

Theo best practice bảo mật hiện nay

# Flow quản lý Authentication

Cách login :

1. Client Component gọi API login đến Server BE để nhận token về
2. Client lấy Token này để gọi tiết 1 API nữa là `/auth` đến Next.js Server lưu token vào cookie Client

Nói chung là muốn thao tác với cookie ở domain FE (CRUD) thì phải thông qua Router Handler Next.js Server

## Ở dự án này

Bình sẽ làm khác 1 tý , thay vì khai báo lại 1 router là `/auth` thì mình sẽ khai báo route handler cho login luôn

1. Client Component gọi API login route handler(`Next Server`) là `/auth/login`

2. Route Handler này sẽ gọi tiếp api login đến Server BE để nhận về `token` , sau đó lưu token vào `cookie client` , cuối cùng trả về kết quả cho `client component`

Cái này gọi là dùng Next.js Server làm proxy trung gian

Tương tự Logout cũng vậy
Ở Server
