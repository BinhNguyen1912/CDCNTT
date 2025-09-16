# Cache là gì?

Là cơ chế của `NextJS` `lưu tạm kết quả` để lần sau không phải tính/toàn bộ request lại → nhanh hơn, giảm tải server. Nhưng nếu không kiểm soát, bạn sẽ thấy “sao vẫn data cũ?!”

## Có mấy lớp cache trong app Next?

`Next.js Data Cache` **(chỉ xảy ra khi gọi `fetch` ở Server trong App Router)**:

1. _Mặc định_ cache (tức `cache: 'force-cache'`) khi trang/segment `được render tĩnh -> static render`.

2. Trả cùng một response cho các lần render sau, cho đến khi bạn revalidate hoặc`cache: 'no-store'` -> Nó sẽ chuyển từ Static về Thành Dynamic luôn nên nó sẽ tự động fetch lại

## Mặc định của Next 14

`fetch()` trong server components mặc định coi như `cache: 'force-cache'` → được đưa vào Data Cache (trong thư mục cache trong .next).

Chỉ khi bạn nói rõ đừng cache (cache: 'no-store' hoặc next: { revalidate: 0 }) hoặc đánh dấu dynamic, nó mới không cache.

Lưu ý: no-cache ≠ no-store. Muốn tắt Data Cache của Next, dùng no-store (không phải no-cache).

```ts
// 1) Luôn lấy dữ liệu mới (tắt cache hoàn toàn)

// Dùng cho danh sách cần luôn realtime sau khi bạn vừa tạo/sửa/xóa.

// Server Component / Server Function
const res = await fetch(`${API_URL}/dishes`, { cache: 'no-store' });
// hoặc:
const res = await fetch(`${API_URL}/dishes`, { next: { revalidate: 0 } });
const data = await res.json();
```

## 2. ISR – Tự làm mới sau N giây

- Khi chúng ta build rồi , thì server nextjs sẽ gener ra cho chúng ta 1 file html -> không thể thay đổi được nên gây vấn đề catching rất KHÓ CHỊU VÃI

- Và tôi chỉ muốn khi
  `revalidate` : time

Dùng khi data không cần realtime, nhưng muốn tự cập nhật định kỳ.

// Cache + revalidate mỗi 10s
const res = await fetch(`${API_URL}/dishes`, { next: { revalidate: 10 } });
