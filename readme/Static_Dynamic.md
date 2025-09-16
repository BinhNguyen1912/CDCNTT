# Dynamic Function

- Là các hàm động (không thể tối ưu thành tĩnh): cookie() , headers() , use ...()
- `Là phương pháp dựng HTML mỗi lần có request từ người dùng. Trang sẽ được render trên server tại thời điểm có yêu cầu (runtime).`

- Chúng phụ thuộc vào ngữu cảnh yêu cầu , ví dụ

* cookie của người dùng

## Bản chất

- HTML được sinh mới mỗi lần có request.

- Tối ưu cho dữ liệu thay đổi liên tục theo người dùng (giỏ hàng, bảng tin, v.v)

-Chậm hơn static vì mỗi request đều phải xử lý backend.

# Static Rendering (Rendering tĩnh)

- Là phương pháp dựng trang (HTML) tại build time – tức là khi bạn chạy `next build`, HTML của mỗi trang được `render sẵn`và `lưu trữ dưới dạng tệp tĩnh.`

## Bản chất

- Dữ liệu được nạp một lần duy nhất khi build

- HTML đã được sinh sẵn, không cần backend xử lý khi người dùng truy cập.

- Rất nhanh, vì không phải xử lý lại mỗi lần request.

- Không phù hợp cho dữ liệu thay đổi thường xuyên.
