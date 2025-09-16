# Parallel Route (Route song song)

- Sử dụng khái niệm là `slot` nghĩa là :
  Tạo folder với `@` phía trước thì ta gọi folder đó là slot : `@setting` , `@modal` , ...
  Slot nó sẽ không tạo ra Route Segment , Khá giống với folder route group `()`

Ví dụ tạo file với đường dẫn [app/@modal/page.tsx] thì Route Segment là `/` chứ không phải là `/modal`

# Làm sao để slot hoạt động (active state) ?

- Muốn slot hoạt động active phải đảm bảo

* URL phair khớp với Route Slot
  Ví dụ : (public)
  @modal/page.tsx
  Vì public có route là `/` và @modal nó không tạo ra segment lên vẫn là `/` => trùng nhau
* Slot phải được dùng trong layout.tsx tại nơi mà nó đứng
  ví dụ
  {children}
  {modal}
  ví dụ đứng trong (public) thì vào layout của public để khai báo

=> Thỏa 2 điều kiện trên thì page trong @modal sẽ được hoạt động và đứng dưới {children}

**Lưu ý** :

- Trong trường hợp không active thì nó sẽ render ra file `default.tsx` trong slot, nếu không có file này nó sẽ render `404 Page` . Vậy nên để tránh `404 Page` thì người ta thường `return null` trong file default
- Có trường hợp trùng Route nhưng không được Active với lí do :
  TH1 : Nếu người đã vào trùng Route sau đó mới qua trang khác `/login` từ `navigate` -> thì tại đây modal đã được `active` trước đó rồi nên không bị nhảy vào file `default`
  TH2 : Nhưng nếu người dùng qua `/login` không từ navigate mà enter đường dẫn thì sẽ bị nhảy vào `default.tsx` vì lúc này modal chưa được active nên nó không biết lấy file nào

## Parallel Routes (Các route song song)

Mục đích: Cho phép render nhiều “vùng UI độc lập” trong cùng một layout. Mỗi vùng có thể điều hướng, fetch dữ liệu, và hiển thị nội dung riêng biệt mà không ảnh hưởng đến nhau.

Ví dụ:

Bạn có layout chính gồm 2 khu vực: Sidebar và Content.

Bạn có thể định nghĩa @sidebar và @content dưới dạng Parallel Routes.

Khi người dùng điều hướng trong @content, phần @sidebar vẫn giữ nguyên, không bị reload.

Một use case khác là hiển thị nhiều tab nội dung khác nhau mà không phải viết logic condition phức tạp.

👉 Mục đích chính: Cho phép tách biệt nhiều phần UI và quản lý điều hướng độc lập cho từng phần, tối ưu cho multi-view apps, dashboard, tab navigation.
