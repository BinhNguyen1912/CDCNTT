# Sự khác nhau giữa `Role Based Access Control` và `Permission Based Access Control`

## Access Control

- Là quản lý quyền truy cập . Có 2 kiểu phổ biến là :

1. Role Based AC Control : Kiểm soát quyền truy cập dựa vào vai trò của người dùng
2. Permission Based AC Control : Kiểm soát quyền truy cập trên từng `quyền` của chức năng đó của từng người dùng

## Role Based Access Control

Ví dụ : Hệ thống quản lý món ăn sẽ có 3 role chính :

- Admin : Có quyền thao tác mọi chức năng trên hệ thống
- Employee : Có quyền thao tác một số chức năng như tạo Order , xem Order nhưng không thể quản lý nhân viên khác
- Guest : Chỉ có quyền xem menu , tạo order

**Các quyền hạn ở mỗi Role sẽ được định nghĩa cố định trong khi code**

Tất nhiên bạn vẫn có thể code 1 hệ thống thay đổi quyền hạn trên mỗi role 1 cách linh hoạt hơn , Lưu ý thay đổi quyền hạn trên mỗi role chứ hông ohair trên mỗi tài khaonr
Mỗi Account sẽ được gán với 1 role trên

## Permission Based Access Control
- Thay vì chia theo Role thì hệ thống sẽ chia theo từng quyền hạn cụ thể
Ví dụ : khi tạo 1 tài khảon , bạn sẽ được gán vài quyền cơ bản như : READ_PROFILE , ...

Khi cần thêm quyền hạn mới , admin sẽ thêm từng quyền hạn đó cho tài khaonr cụ thể

Đây vừa là ưu điểm vừa là nhược điểm : 
- nó linh hoạt nhưng RBAC vì có thể thêm quyền hạn mới đó cho tài khoản cụ thể
- Nhưng cũng khó khi kiểm các tài khaonr nếu có quá nhiều quyền hạn 


=> NÊN DÙNG ROLE BASE 
Tại sao ?
-> Ví dụ 1 hệ thống biết bao nhieu đứa sài , thì m