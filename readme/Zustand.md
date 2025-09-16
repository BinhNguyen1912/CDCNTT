# TÌM HIỂU ZUSTAND

1. Zustand là gì?

- Là thư viện quản lý State cho React
- Nhỏ gọn , tối giản , không ràng buộc , API thoải mái dựa trên `hooks` . Không cần `<Provider>` , không `boilerplate`
- Mô hình : 1 hoặc nhiều chiều `store` độc lập nằm ngoài React , Mỗi Component sẽ `đăng ký` vào phần `State` mình cần, chỉ component đó re-render khi phần state đăng ký thay đổi thôi

## Kiến trúc và nguyên lý

- `Store` là 1 **Closure** giữa state và các actions (Hàm cập nhật) , được tạo bằng `create(...) từ zustand`
- Các thành phân React sử dụng hook `useStore(selector)` để lấy DỮ LIỆU, `selector` càng hẹp càng tốt -> GIẢM RE-RENDER

- kHÔNG có reducers bắt buộc bạn có thể viết actions trực tiếp (hoặc áp dụng pattern reducer nếu muốn)

Middlewares là các wrapper composable quanh create(...) để thêm tính năng như persist, devtools, log, subscribeWithSelector...

## Sơ đồ giản lược

[Component] --(selector)--> [Store(state, actions)] <--> [Middlewares]
^ |
|-------------------| (subscribe theo selector)

## CÁC THƯ VIỆN QUẢN LÝ STATE GLOBAL

- redux để lưu trữ state khi gọi API (async state) và các state global khác
- Context API
- Tanstack Query để lưu trữ async State (đang dùng trong dự án , dùng để lưu trữ các bất đồng bộ state) , tự hanlde hết cho mình bao gồm catching đồ luôn , hay chia sẽ data giữa hai component gì luôn , chỉ cần dùng useGetProfile -> đảm bảo gọi api 1 lần duy nhất -> không dùng được state global luôn
- Redux toolkit + RTK Query (phức tạp , viết theo cấu trúc của Redux)
- Zustand

# Dự án hiện tại dùng Context API và Tanstack Query để xử lý , quản lý về các vấn đề STATE
