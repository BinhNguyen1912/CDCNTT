# Route

1. Basic
   Mỗi 1 mục thư mục là đại diện cho 1 đường dẫn (là 1 route) . Trong mỗi thư mục bắt buộc phải có file page.tsx
   Ví dụ : home/page.tsx
2. Segment
   Nằm trong thư mục kí hiệu trong [] , nó sẽ rất linh động , gọi là phân đoạn
   [name] -> [course] : `segment dynamic`
   Ví dụ 1 có 1 thư mục là [course] nằm trong cặp ngoặc vuông , nghĩa là chúng ta muốn truyền pathName nào vào cũng được
   Mục đích để lấy các param ra để sử lý 1 vấn đề nào đó

   Ví dụ trong [course] có folder lession đi , linh động
   -> ['http://localhost:3000/vs-code/lession']
   -> ['http://localhost:3000/javascript/lession']

3. Nested Routes (Thư mục lồng nhau thôi)
   Là 1 route tổng , có thể chưa nhiều route con
   ví dụ auth/login , auth/register, auth/../.../... so on

4. Groud
   Nó sẽ không tạo ra routing cho mình
   Được kí hiệu bằng `(tên_Groud)`
   ví dụ (dashboard) nó sẽ không tạo /dashboard
   Mục đích sử dụng để gom các routing liên quan lại với nhau thôi

5. Catch-all Segments : sign-in/[...sign-in]
   ví dụ có folder là `sign-in`, trong đó mình có 1 Catch-all Segments [...tên_segment] và trong này có file `page.tsx`
   vd ROUTE cho 5 6 ['localhost:3000/shop/a/b/c']
   Thì cách hoạt động như sau

- Chúng ta có thể gắn bất cứ param nào sau `sign-in`
  localhost:3000/shop/a/b/c
  ví dụ `sign-in/a/b/c/ ...` Nhưg bắt buộc phải vào Page sign-in , và quan trọng khi có bao nhiêu `/a/b/c/...` gì đó nó vẫn nhảy vào page `sign-in` , và lưu ý khi ta truy cập `localhost:3000/sign-in` thì bị lỗi nha nên `bắt buộc` phải có `/a/b/c..` gì đó sau này thì mới vào được `page.tsx` của `shop`

6. Option Catch-all Segments : [[...sign-in]]

- Giống như Catch-all Segment nhưng trên kia BẮT BUỘC phải có `/a/b/...` gì , còn này khi ta truy cập vào `SHOP` thì vẫn vào được bth không lỗi

Ví dụ cho Param và Search như sau :
Chúng ta 1 folder file như sau
[course]
[item]
[content]
lession

Thì hiện tại chúng ta có 3 dynamic lồng nhau , các url
ví dụ :
localhost:3000/chuong-1/bai-1/noi-dung/lession?id=1
Thì chúng ta được các `param và search param` như sau

=> TỤI NÓ SẼ LẤY THEO DẠNG KEY-VALUE
=> Mục đích sử dụng ở Server Side => RẤT NHANH => CÁI BỤP LÀ XONG

```ts
param = {
    course : "chuong-1",
    item : "bai-1",
    content: "noi-dung"
}
serchParams = {
    id : 1
}

# Params

# Search

## **LƯU Ý**

- Không được đặt 2 dynamic route cùng hàng với nhau
  [item] [folder] , vì Next sẽ không biết mình lấy item hay folder
```
