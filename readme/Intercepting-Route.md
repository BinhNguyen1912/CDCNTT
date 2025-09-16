# Intercepting Route

- Paralle Route (Route song song) : Nó sẽ render các Component (`page.tsx` hoặc `default.tsx`) CÙNG VớI Route hiện tại

- Intercapting Route (Route Chặn) : Khi Navigate , thay vì render `page.tsx` đích đề thì nó sẽ re-render route chặn . Điều này sẽ không xảy ra khi full page load (F5)

## Cách hoạt động

Khai báo trước các folder bằng các ký tự `(.) , (..), ...`
Ví dụ `(.)Dishes`
`(..)` -> Nó sẽ dựa vào Route Segment chứ không dựa vào `Folder Path`

Khi ta khai báo `INTERCEPTER ROUTE` ở đâu thì những page ở level đó thì nó và những pagee con của nó sẽ bị chặn (là chủ đích hay bug của Next?? Vì không thấy dóc đề cập)
ví dụ

- combo
  -- (.)dishes
  -- page.tsx
  -> Tất cả các file trong combo đều bị chặn

Nô na là nếu những folder nào cùng cấp với `(.)dishes` đều bị chặn kể cả những file con

## Intercepting Routes (Chặn và thay thế route)

Mục đích: Cho phép bạn `“chặn” hành vi điều hướng sang một route khác` và thay vào đó `hiển thị một UI khác trong ngữ cảnh hiện tại`.

Ví dụ:

Bạn có trang danh sách sản phẩm (/products).

Khi click vào 1 sản phẩm (/products/1), bình thường Next.js sẽ chuyển hẳn sang trang /products/1.

Nhưng với Intercepting Route, bạn có thể hiển thị chi tiết sản phẩm dưới dạng modal ngay trên trang danh sách mà không cần rời trang.

Điều này giúp trải nghiệm người dùng tốt hơn, giống các ứng dụng kiểu Instagram (click vào ảnh → mở modal thay vì chuyển hẳn sang trang khác).

👉 Mục đích chính: Tạo ra trải nghiệm UI mượt mà, giữ ngữ cảnh (context) hiện tại, đặc biệt hữu ích cho modal, drawer, overlay.
