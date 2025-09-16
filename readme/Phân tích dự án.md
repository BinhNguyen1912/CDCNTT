# Phân tích dự án

- Đây là khâu quan trọng nhất , nó giúp chúng ta hiểu rõ vấn đề cần giải quyết

1. Business Analyst (BA) phân tích yêu cầu của khách hàng và tạo ra 1 tài liệu yêu cầu

2. Designer thiết kế giao diện dựa trên tài liệu BA

3. Data Analyst (DA) hoặc BE dev phân tích và thiết kế CSDL

4. BE dev xây dự API

5. FE dev xây dựng giao diện

# Chức năng chính

- Quản lý auhentication bằng JWT Access Token và Refresh Token
- Có 3 phân quyền : Admin, Nhân Viên , Khách Hàng

## Admin

- Quản lý tài khoản cá nhân
- Quản lý nhân viên
- Quản lý món ăn
- Quản lý bàn ăn
- Quản lý hóa đơn gọi món
- Thống kê doanh thu

## Nhân viên

- Quản lý tài khoản cá nhân
- Quản lý hóa đơn gọi món
- Thống kê doanh thu

## Khách hàng

- Xem menu
- Đặt món ăn bằng QR Code
