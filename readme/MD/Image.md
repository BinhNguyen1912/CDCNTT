# Next/Image

- Next/Image có 3 thuộc tính bắt buộc là : alt , width , height
- Nếu sử dụng thuộc tính `fill` thì không cần dùng `width` và `Height` . Tuy nhiên lưu ý `img` sẽ trở thành absolute , nên có cần được bọc lại 1 thẻ cha có position là : `relative` để nó ăn theo , tùy theo mục đích code
- Khi sử dụng đường Link ảnh bên ngoài cần khai báo trong `Next.config.mjs`
- Thuộc tính `sizes` ví dụ
  sizes : "@media(min-width : 640px) 300px , 100vw"
  //Nghĩa là nếu màn hình từ 640 trở lên sẽ lấy width là 300 , còn moblide thì full luôn
- `priority` : Nghĩa là nó sẽ ưu tiên load các thể Image có thuộc tính này trước
  `sharp` : Thư viện này Next recomment để
