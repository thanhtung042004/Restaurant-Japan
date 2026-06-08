<div align="center">
  <img src="https://img.shields.io/badge/Sakura-Restaurant%20Japan-C9A447?style=for-the-badge&logo=codeigniter&logoColor=white" alt="Sakura Restaurant Japan" />

  <h1>Sakura Restaurant Management System</h1>

  <p>
    <strong>Hệ thống quản lý nhà hàng Nhật Bản và đặt bàn trực tuyến tích hợp AI</strong>
  </p>

  <p>
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
    <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js" />
    <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
    <img src="https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white" alt="Socket.io" />
  </p>
</div>

---

## Giới thiệu dự án

**Sakura Restaurant Management System** là hệ thống quản lý nhà hàng Nhật Bản được xây dựng theo mô hình Full-stack, hỗ trợ đặt bàn trực tuyến, quản lý bàn ăn, quản lý thực đơn, quản lý đơn hàng, hóa đơn, phân quyền người dùng và tích hợp trợ lý AI tư vấn món ăn.

Giao diện hệ thống được thiết kế theo phong cách **Dark Luxury UI**, sử dụng nền tối, hiệu ứng kính mờ, điểm nhấn vàng kim và bố cục hiện đại nhằm tạo cảm giác sang trọng, phù hợp với mô hình nhà hàng Nhật Bản cao cấp.

---

## Tính năng chính

* Quản lý tài khoản và đăng nhập theo vai trò.
* Phân quyền người dùng theo role: Admin, Manager, Waiter, Customer.
* Khách hàng có thể xem trang giới thiệu, đặt bàn và sử dụng AI để được gợi ý món ăn.
* Nhân viên phục vụ có thể theo dõi bàn, tạo đơn hàng và cập nhật trạng thái phục vụ.
* Quản lý có thể theo dõi hoạt động, doanh thu, bàn, thực đơn và nhân viên.
* Admin có quyền quản lý toàn bộ hệ thống.
* Đồng bộ dữ liệu thời gian thực bằng Socket.io.
* Giao diện responsive, phù hợp với màn hình desktop và laptop.

---

## Công nghệ sử dụng

### Frontend

* React
* Vite
* Tailwind CSS
* Axios
* Socket.io Client

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication
* Socket.io

---

## Cấu trúc thư mục

### Backend

```text
server/
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   │   └── seedData.js
│   └── server.js
└── package.json
```

### Frontend

```text
client/
├── src/
│   ├── api/
│   ├── assets/
│   ├── components/
│   │   ├── auth/
│   │   ├── landing/
│   │   └── layout/
│   ├── features/
│   │   ├── admin/
│   │   ├── manager/
│   │   ├── waiter/
│   │   ├── customer/
│   │   └── ai/
│   ├── pages/
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
└── package.json
```

---

## Cài đặt dự án

### 1. Clone repository

```bash
git clone https://github.com/thanhtung042004/Restaurant-Japan.git
cd Restaurant-Japan
```

### 2. Cài đặt Backend

```bash
cd server
npm install
```

### 3. Cài đặt Frontend

```bash
cd client
npm install
```

---

## Cấu hình môi trường

Tạo file `.env` trong thư mục `server`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
```

Tạo file `.env` trong thư mục `client`:

```env
VITE_API_URL=http://localhost:5000/api
```

---

## Khởi tạo dữ liệu mẫu

```bash
cd server
npm run seed
```

Tài khoản đăng nhập mẫu:

```text
Admin:
Email: admin@sakura-japan.com
Password: admin123

Manager:
Email: manager@sakura-japan.com
Password: manager123

Waiter:
Email: phucvu@sakura-japan.com
Password: phucvu123

Customer:
Email: khach@gmail.com
Password: khach123
```

---

## Chạy dự án

### Chạy Backend

```bash
cd server
npm run dev
```

### Chạy Frontend

```bash
cd client
npm run dev
```

Sau khi chạy thành công, mở trình duyệt tại:

```text
http://localhost:5173
```

---

## Vai trò người dùng

| Role     | Quyền chính                                      |
| -------- | ------------------------------------------------ |
| Admin    | Quản lý toàn bộ hệ thống                         |
| Manager  | Quản lý nhà hàng, nhân viên, doanh thu, thực đơn |
| Waiter   | Quản lý bàn, đơn hàng và phục vụ khách           |
| Customer | Đặt bàn, xem thực đơn, sử dụng AI tư vấn món ăn  |

---

## Giao diện hệ thống

* Landing Page phong cách Japanese Dark Luxury.
* Customer Portal dành cho khách hàng.
* Dashboard quản trị cho Admin và Manager.
* Dashboard phục vụ dành cho Waiter.
* AI Chatbot hỗ trợ gợi ý món ăn.

---

## Tác giả

**Nguyễn Thanh Tùng**

* GitHub: `thanhtung042004`
* Email: `thanhtung042004@gmail.com`

---

<div align="center">
  <strong>Sakura Restaurant Management System</strong>
  <br />
  Hệ thống quản lý nhà hàng Nhật Bản hiện đại, sang trọng và dễ sử dụng.
</div>
