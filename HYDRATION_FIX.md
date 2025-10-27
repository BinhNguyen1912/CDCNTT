# Hydration Error Fix

## Vấn đề

Dự án gặp lỗi hydration error khi vào trang chủ `/`:

```
Error: Text content does not match server-rendered HTML.
```

## Nguyên nhân

Lỗi hydration xảy ra khi có sự khác biệt giữa nội dung được render trên server và client. Các nguyên nhân chính:

1. **NavItems component**: Sử dụng `useAppStore` để lấy `role` và render menu khác nhau dựa trên role
2. **ToggleTheme component**: Sử dụng `useTheme` từ next-themes có thể gây ra hydration mismatch
3. **PublicHeader component**: Sử dụng `scrolled` state để thay đổi styling
4. **Các animation components**: Có thể sử dụng browser APIs không có sẵn trên server

## Giải pháp đã áp dụng

### 1. Fix NavItems component

- Thêm `isMounted` state để kiểm tra component đã mount chưa
- Render fallback content trong SSR, chỉ render role-dependent content sau khi mount
- Đảm bảo server và client render cùng nội dung ban đầu

### 2. Fix ToggleTheme component

- Thêm `mounted` state để kiểm tra component đã mount chưa
- Render fallback button trong SSR, chỉ render theme-dependent content sau khi mount
- Tránh hydration mismatch từ next-themes

### 3. Fix PublicHeader component

- Thêm `mounted` state để kiểm tra component đã mount chưa
- Chỉ áp dụng `scrolled` styling sau khi component đã mount
- Đảm bảo server render với styling mặc định

### 4. Tạo ClientOnly wrapper

- Tạo component `ClientOnly` để wrap các component có thể gây ra hydration error
- Chỉ render children sau khi component đã mount
- Cung cấp fallback content cho SSR

### 5. Wrap animation components

- Wrap các component animation (`AnimatedImagesWithBg`, `BananaTreeSection`, `Logomarquee`) với `ClientOnly`
- Đảm bảo chúng chỉ render trên client, tránh hydration mismatch

## Kết quả

- ✅ Loại bỏ hoàn toàn hydration error
- ✅ Đảm bảo SSR hoạt động đúng
- ✅ Không ảnh hưởng đến UX của người dùng
- ✅ Giữ nguyên tất cả tính năng

## Best Practices để tránh hydration error

1. **Sử dụng `useEffect` để kiểm tra mount state**
2. **Tránh sử dụng browser APIs trong render function**
3. **Sử dụng `ClientOnly` wrapper cho các component phức tạp**
4. **Đảm bảo server và client render cùng nội dung ban đầu**
5. **Sử dụng `suppressHydrationWarning` khi cần thiết (không khuyến khích)**
