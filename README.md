# Online Shop Order Management System (SDN302)

## 1. Cấu trúc thư mục (Model-View-Controller)
```
tuan_shop/
├── config/
│   └── db.js               # Kết nối MongoDB và tự động seed dữ liệu mẫu (Sản phẩm, Đơn hàng, Users)
├── models/
│   ├── productModel.js     # Schema & Model Sản phẩm (Mục 2)
│   ├── orderModel.js       # Schema & Model Đơn hàng (Mục 3)
│   └── userModel.js        # Schema & Model Người dùng (Xác thực đăng nhập)
├── controllers/
│   ├── orderController.js  # Nghiệp vụ: Lấy DS, Thêm, Sửa, Xóa, Tính tiền tự động, Kiểm tra ràng buộc
│   └── authController.js   # Nghiệp vụ: Đăng nhập, Đăng ký, Đăng xuất, Lưu Session
├── middleware/
│   └── authMiddleware.js   # Kiểm tra đăng nhập (requireLogin) trước khi cho phép Order
├── routes/
│   ├── orderRoutes.js      # Định tuyến các endpoint CRUD đơn hàng
│   └── authRoutes.js       # Định tuyến đăng nhập / đăng ký / đăng xuất
├── views/
│   ├── order.ejs           # Giao diện danh sách đơn hàng (Figure 1) kèm thanh trạng thái User
│   ├── createOrder.ejs     # Giao diện tạo đơn hàng (Figure 2, yêu cầu đăng nhập)
│   ├── updateOrder.ejs     # Giao diện cập nhật đơn hàng (Figure 3)
│   ├── login.ejs           # Giao diện đăng nhập tài khoản với tính năng bấm điền nhanh
│   └── register.ejs        # Giao diện đăng ký tài khoản mới
├── public/
│   └── css/
│       └── style.css       # Style UX/UI chuẩn theo hình mẫu đề bài + giao diện Auth
├── app.js                  # Điểm khởi chạy ứng dụng Express & cấu hình Session
└── package.json            # Cấu hình dự án và dependencies
```

## 2. Hướng dẫn chạy chương trình
1. Mở Terminal và di chuyển vào thư mục dự án:
   ```bash
   cd tuan_shop
   ```
2. Cài đặt các gói phụ thuộc (nếu chưa cài):
   ```bash
   npm install
   ```
3. Khởi chạy server:
   ```bash
   npm start
   ```
4. Mở trình duyệt truy cập:
   ```
   http://localhost:3000
   ```
5. **Tài khoản đăng nhập mẫu sẵn có trong hệ thống:**
   - **Admin:** `admin` / Mật khẩu: `123456`
   - **Khách hàng:** `tuandz` / Mật khẩu: `123456`
   - *(Hoặc bấm trực tiếp vào nút chip "Tài khoản mẫu" tại trang đăng nhập để tự động điền)*

## 3. Các yêu cầu đã hoàn thành
- [x] **1. Thư mục dự án:** Tạo thư mục `tuan_shop`.
- [x] **2. Model Sản phẩm (`productModel.js`):** Định nghĩa đầy đủ `productName`, `category`, `stockStatus`, `unitPrice`, `tags`.
- [x] **3. Model Đơn hàng (`orderModel.js`):** Định nghĩa đầy đủ `customerName`, `productName`, `quantity`, `orderDate`, `totalPrice`.
- [x] **4 & 5. Lấy danh sách đơn hàng (`order.ejs`):** Hiển thị bảng theo Figure 1.
- [x] **6. Xóa đơn hàng theo orderId:** Nút Delete màu cam có confirm xác nhận trước khi xóa.
- [x] **7. Thêm đơn hàng mới (`createOrder.ejs`):** Form theo Figure 2 với nút Place Order và Go Back.
- [x] **8. Ràng buộc sản phẩm tồn tại:** Hệ thống kiểm tra sản phẩm có trong CSDL hay không; nếu không tồn tại sẽ báo lỗi và từ chối tạo/cập nhật.
- [x] **9. Cập nhật đơn hàng theo orderId (`updateOrder.ejs`):** Tự động điền dữ liệu cũ, cho phép sửa đổi và lưu lại.
- [x] **10. Tự động tính Total Price:** `totalPrice = product.unitPrice * quantity` khi thêm hoặc cập nhật đơn hàng.
- [x] **11. Kiến trúc MVC:** Tổ chức mã nguồn chuẩn Models - Views - Controllers - Routes - Config.
- [x] **12. Chuẩn giao diện UX/UI:** Tone màu xanh dương/cam, bo góc, font chữ và bố cục chuẩn xác theo mẫu Figure 1, 2, 3.
- [x] **13. Xác thực & Phân quyền (`login.ejs`, `authMiddleware.js`):** Tạo trang đăng nhập, quản lý session người dùng, bắt buộc phải đăng nhập thì mới được vào form tạo đơn hàng (Create Order) và gửi đơn hàng.
