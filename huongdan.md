# Hướng dẫn dự án quản lý sinh viên

Tài liệu này giải thích dự án theo cách dành cho người mới học React và Node.js. Bạn có thể vừa đọc vừa mở các file được nhắc đến để theo dõi dữ liệu đi từ giao diện, qua API, tới MySQL rồi quay trở lại.

## 1. Dự án này làm được gì?

Ứng dụng có hai nhóm chức năng:

- **Quản lý lớp học:** xem danh sách, tìm kiếm, phân trang, thêm, sửa và xóa lớp.
- **Quản lý sinh viên:** xem danh sách, tìm kiếm, lọc theo lớp, phân trang, thêm, sửa và xóa sinh viên.

Một lớp có nhiều sinh viên. Một sinh viên chỉ thuộc một lớp. Hệ thống không cho xóa lớp nếu lớp đó vẫn còn sinh viên.

Ba phần của hệ thống chạy trong Docker:

```text
Trình duyệt
    │
    │ http://localhost:5173
    ▼
React + Vite (service web)
    │
    │ /api được Vite chuyển tiếp tới api:3000
    ▼
Node.js + Express (service api)
    │
    │ câu lệnh SQL do Knex tạo ra
    ▼
MySQL (service db)
```

Nếu bạn đã học Laravel, có thể liên hệ như sau:

| Dự án này | Laravel |
|---|---|
| Express Router | `routes/api.php` |
| Controller | Controller |
| Zod schema | Form Request |
| Service | Lớp xử lý nghiệp vụ |
| Repository + Knex | Eloquent/Query Builder |
| Migration | Migration |
| React component | Giao diện Blade có state ở trình duyệt |

## 2. Cách chạy dự án

### Yêu cầu

- Docker Desktop đang mở và dùng Linux containers.
- Docker Compose hoạt động.
- Node.js chỉ cần khi muốn chạy hoặc kiểm tra mã ngay trên Windows. Khi dùng Docker, Node.js đã có trong image.

### Khởi động lần đầu

Mở PowerShell tại thư mục `crudstudent` rồi chạy:

```powershell
docker compose up --build -d
docker compose exec api npm run db:seed
```

Lệnh đầu build image và chạy ba container. API tự chạy migration trước khi khởi động. Lệnh thứ hai tạo 3 lớp và 24 sinh viên mẫu.

> `db:seed` xóa dữ liệu trong hai bảng rồi tạo lại dữ liệu mẫu. Chỉ chạy khi bạn muốn đặt dữ liệu học tập về trạng thái ban đầu.

Mở các địa chỉ:

- Giao diện: <http://localhost:5173>
- Kiểm tra API: <http://localhost:3000/health>
- MySQL từ máy Windows: `localhost:3307`

Tài khoản MySQL mặc định:

```text
Database: student_manager
User: student_app
Password: student_password
```

Các giá trị này dành cho môi trường học tập. Có thể đổi chúng bằng file `.env`, dựa theo `.env.example`.

Nếu chạy API trực tiếp trên Windows thay vì trong Docker, sao chép `api/.env.example` thành `api/.env`. File mẫu này dùng `DB_PORT=3307`, là cổng MySQL được Docker mở ra máy Windows.

### Các lệnh thường dùng

```powershell
# Xem trạng thái container
docker compose ps

# Xem log API liên tục
docker compose logs -f api

# Dừng nhưng giữ dữ liệu MySQL
docker compose down

# Chạy lại dự án
docker compose up -d

# Build lại sau khi đổi dependency hoặc Dockerfile
docker compose up --build -d

# Chạy migration
docker compose exec api npm run db:migrate

# Lùi migration gần nhất
docker compose exec api npm run db:rollback

# Tạo lại dữ liệu mẫu
docker compose exec api npm run db:seed
```

`docker compose down -v` sẽ xóa cả volume MySQL và toàn bộ dữ liệu. Chỉ dùng lệnh đó khi bạn thật sự muốn làm lại database từ đầu.

## 3. Cấu trúc thư mục

```text
crudstudent/
├── compose.yaml              Cấu hình ba service db, api và web
├── .env.example              Mẫu biến môi trường
├── api/                      Backend Node.js
│   ├── src/
│   │   ├── app.ts            Cấu hình Express và middleware
│   │   ├── server.ts         Mở cổng 3000
│   │   ├── config/           Đọc biến môi trường
│   │   ├── database/         Kết nối, migration và seed
│   │   ├── middlewares/      Xử lý lỗi tập trung
│   │   ├── common/           Hàm dùng chung
│   │   └── modules/
│   │       ├── classes/      Chức năng lớp học
│   │       └── students/     Chức năng sinh viên
│   └── package.json
└── web/                      Frontend React
    ├── src/
    │   ├── App.tsx           Khai báo URL của các trang
    │   ├── main.tsx          Điểm bắt đầu của React
    │   ├── components/       Component dùng chung
    │   ├── hooks/            Hook dùng chung
    │   ├── lib/              Hàm gọi API
    │   └── features/
    │       ├── classes/      Giao diện và API lớp học
    │       └── students/     Giao diện và API sinh viên
    └── package.json
```

Mỗi module backend được chia thành năm loại file:

```text
*.routes.ts       URL nào gọi controller nào
*.controller.ts   Nhận request và tạo response HTTP
*.schema.ts       Kiểm tra dữ liệu bằng Zod
*.service.ts      Quy tắc nghiệp vụ
*.repository.ts   Đọc và ghi MySQL bằng Knex
```

Việc chia nhỏ này giúp thay đổi một phần mà ít ảnh hưởng phần khác. Ví dụ, quy tắc “không xóa lớp còn sinh viên” nằm trong service; câu SQL đếm sinh viên nằm trong repository.

## 4. Database hoạt động như thế nào?

Migration đầu tiên tạo bảng `classes`:

| Cột | Ý nghĩa |
|---|---|
| `id` | Khóa chính tự tăng |
| `code` | Mã lớp, không được trùng |
| `name` | Tên lớp |
| `description` | Mô tả, có thể để trống |
| `created_at`, `updated_at` | Thời gian tạo và cập nhật |

Migration thứ hai tạo bảng `students`:

| Cột | Ý nghĩa |
|---|---|
| `id` | Khóa chính tự tăng |
| `student_code` | Mã sinh viên, không được trùng |
| `full_name` | Họ tên |
| `email` | Email, không được trùng |
| `birth_date` | Ngày sinh |
| `class_id` | Khóa ngoại trỏ tới `classes.id` |
| `created_at`, `updated_at` | Thời gian tạo và cập nhật |

Khóa ngoại `students.class_id` dùng `ON DELETE RESTRICT`. MySQL cũng từ chối xóa một lớp còn sinh viên, kể cả khi có đoạn mã nào đó bỏ qua kiểm tra tại service.

Migration nằm trong `api/src/database/migrations`. Seed nằm tại `api/src/database/seed.ts`.

## 5. Luồng chung của một request

Ví dụ người dùng mở trang sinh viên:

1. React render component `StudentsPage`.
2. TanStack Query gọi hàm `getStudents()`.
3. `getStudents()` dùng `fetch` gửi `GET /api/v1/students?page=1&limit=10`.
4. Vite nhận đường dẫn `/api` và chuyển request tới container `api`.
5. Express Router chuyển request vào `studentController.index`.
6. Zod đọc và kiểm tra `page`, `limit`, `q`, `classId`.
7. Service gọi repository.
8. Repository dùng Knex tạo câu SQL và gửi tới MySQL.
9. MySQL trả dữ liệu; backend trả JSON gồm `data` và `meta`.
10. TanStack Query lưu tạm kết quả; React render các hàng trong bảng.

Kết quả danh sách có dạng:

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 24,
    "totalPages": 3
  }
}
```

`data` là các bản ghi trên trang hiện tại. `meta` giúp frontend biết tổng số trang và khi nào cần khóa nút Trước/Sau.

## 6. Luồng từng tính năng sinh viên

### 6.1 Xem danh sách

Trang liên quan: `web/src/features/students/pages/StudentsPage.tsx`.

API liên quan: `GET /api/v1/students?page=1&limit=10`.

Khi trang mở, `useQuery` gọi `getStudents`. Backend nối bảng `students` với `classes`, nên mỗi sinh viên trả về cả `classCode` và `className`. React dùng `.map()` để biến mỗi phần tử thành một hàng `<tr>`.

Ba trạng thái được xử lý riêng:

- `isPending`: hiện “Đang tải danh sách”.
- `isError`: hiện thông báo lỗi.
- Có dữ liệu: hiện bảng sinh viên.

Đây là mẫu cơ bản khi lấy dữ liệu bất đồng bộ trong React.

### 6.2 Tìm kiếm sinh viên

Người dùng nhập vào ô tìm kiếm. Giá trị trước tiên được lưu trong state `search`.

Hook `useDebouncedValue` đợi 400 ms sau lần gõ cuối. Sau đó trang ghi từ khóa vào URL, ví dụ:

```text
/students?q=nguyen&page=1
```

Thay đổi URL làm `queryKey` của TanStack Query thay đổi và request mới được gửi:

```text
GET /api/v1/students?q=nguyen&page=1&limit=10
```

Repository tìm từ khóa trong `student_code`, `full_name` hoặc `email`. Việc đợi 400 ms tránh gửi một request cho từng phím người dùng gõ.

### 6.3 Lọc theo lớp

Dropdown lấy danh sách lớp bằng `GET /api/v1/classes?limit=100`. Khi chọn lớp, `classId` được ghi vào URL:

```text
/students?classId=2&page=1
```

Backend thêm điều kiện `WHERE students.class_id = 2`. Khi đổi bộ lọc, trang luôn trở về trang 1 để tránh trường hợp trang cũ không còn dữ liệu.

### 6.4 Phân trang

Nút Trước/Sau sửa tham số `page` trên URL. Ví dụ trang 2 gọi:

```text
GET /api/v1/students?page=2&limit=10
```

Backend tính vị trí bắt đầu:

```text
offset = (page - 1) × limit
```

Với `page=2` và `limit=10`, MySQL bỏ qua 10 bản ghi đầu và lấy 10 bản ghi tiếp theo. Backend cũng chạy câu đếm tổng số bản ghi để tạo `total` và `totalPages`.

### 6.5 Thêm sinh viên

Trang liên quan: `web/src/features/students/pages/StudentFormPage.tsx`.

Luồng hoạt động:

1. Người dùng bấm “Thêm sinh viên”. React Router mở `/students/new` mà không tải lại toàn trang.
2. Mỗi ô input đọc giá trị từ state `form`. Khi gõ, `setForm` tạo state mới và React render lại.
3. Khi submit, frontend gửi `POST /api/v1/students`.
4. `createStudentSchema` kiểm tra mã, tên, email, ngày sinh và lớp.
5. Service kiểm tra `class_id` có tồn tại.
6. Repository `INSERT` bản ghi vào MySQL.
7. API trả sinh viên vừa tạo với HTTP status `201`.
8. Frontend đánh dấu cache danh sách là cũ, chuyển về `/students?created=1` và hiển thị thông báo thành công.

Body gửi lên có dạng:

```json
{
  "student_code": "SV0025",
  "full_name": "Nguyễn Văn An",
  "email": "an@example.com",
  "birth_date": "2003-05-20",
  "class_id": 1
}
```

### 6.6 Sửa sinh viên

Khi bấm biểu tượng sửa, React Router mở `/students/:id/edit`, ví dụ `/students/5/edit`.

1. `useParams()` lấy `id=5` từ URL.
2. Frontend gọi `GET /api/v1/students/5`.
3. `useEffect` chép dữ liệu nhận được vào state của form.
4. Người dùng sửa và submit.
5. Frontend gửi `PATCH /api/v1/students/5`.
6. Backend kiểm tra sinh viên và lớp có tồn tại rồi chạy `UPDATE`.
7. Frontend quay lại danh sách và làm mới cache.

Trang thêm và trang sửa dùng cùng một component. Biến `isEditing` quyết định tiêu đề, API cần gọi và nội dung nút lưu.

### 6.7 Xóa sinh viên

1. Người dùng bấm dấu ×.
2. State `deleteTarget` lưu sinh viên được chọn, làm `ConfirmDialog` xuất hiện.
3. Khi xác nhận, frontend gửi `DELETE /api/v1/students/:id`.
4. Service kiểm tra sinh viên tồn tại; repository chạy `DELETE`.
5. API trả status `204`, nghĩa là thành công nhưng không có body.
6. Frontend làm mới danh sách sinh viên và số lượng sinh viên của lớp.

## 7. Luồng từng tính năng lớp học

Tất cả giao diện lớp nằm trên `ClassesPage.tsx`. Danh sách ở bên trái và form thêm/sửa ở bên phải trên màn hình lớn.

### 7.1 Danh sách, tìm kiếm và phân trang

Frontend gọi:

```text
GET /api/v1/classes?q=cntt&page=1&limit=8
```

Repository dùng `LEFT JOIN students` và `COUNT(students.id)` để trả thêm `studentCount`. `LEFT JOIN` bảo đảm lớp chưa có sinh viên vẫn xuất hiện với số lượng 0.

Tìm kiếm và phân trang hoạt động giống trang sinh viên. Trạng thái được lưu trên URL nên tải lại trang vẫn giữ từ khóa và số trang.

### 7.2 Thêm lớp

Form gửi `POST /api/v1/classes`. Zod kiểm tra mã lớp chỉ gồm chữ, số, gạch ngang hoặc gạch dưới rồi chuyển mã thành chữ hoa. MySQL có unique index để ngăn mã bị trùng.

Sau khi tạo thành công, frontend làm mới query có key `classes`, xóa dữ liệu đang nhập và hiện thông báo.

### 7.3 Sửa lớp

Khi bấm biểu tượng sửa, `selectedClass` nhận dữ liệu của hàng đó. `ClassForm` dùng `useEffect` chép dữ liệu vào các input.

Submit lúc này gọi `PATCH /api/v1/classes/:id`. Khi xong, `selectedClass` trở về `null`, form trở lại chế độ thêm mới.

### 7.4 Xóa lớp

Service lấy lớp cùng `studentCount` trước khi xóa:

- Nếu `studentCount = 0`, repository được phép xóa.
- Nếu `studentCount > 0`, API trả status `409` và thông báo “Không thể xóa lớp đang có sinh viên”.

MySQL còn có khóa ngoại `RESTRICT` làm lớp bảo vệ thứ hai.

## 8. Validation và xử lý lỗi

Frontend dùng thuộc tính HTML như `required`, `type="email"` để báo lỗi sớm. Backend vẫn luôn kiểm tra lại bằng Zod vì dữ liệu có thể được gửi từ Postman hoặc một chương trình khác.

Các status chính:

| Status | Ý nghĩa trong dự án |
|---|---|
| `200` | Đọc hoặc sửa thành công |
| `201` | Tạo mới thành công |
| `204` | Xóa thành công |
| `404` | Không tìm thấy lớp/sinh viên/đường dẫn |
| `409` | Trùng mã, trùng email hoặc dữ liệu đang được sử dụng |
| `422` | Dữ liệu gửi lên không hợp lệ |
| `500` | Lỗi không dự kiến tại máy chủ |

Middleware `error-handler.ts` là nơi đổi các lỗi này thành JSON thống nhất. Controller không cần lặp lại `try/catch` vì `asyncHandler` chuyển lỗi bất đồng bộ tới middleware.

## 9. Danh sách API

| Method | URL | Chức năng |
|---|---|---|
| `GET` | `/health` | Kiểm tra API đang chạy |
| `GET` | `/api/v1/classes` | Danh sách, tìm kiếm, phân trang lớp |
| `POST` | `/api/v1/classes` | Tạo lớp |
| `GET` | `/api/v1/classes/:id` | Xem một lớp |
| `PATCH` | `/api/v1/classes/:id` | Sửa lớp |
| `DELETE` | `/api/v1/classes/:id` | Xóa lớp |
| `GET` | `/api/v1/students` | Danh sách, tìm kiếm, lọc, phân trang sinh viên |
| `POST` | `/api/v1/students` | Tạo sinh viên |
| `GET` | `/api/v1/students/:id` | Xem một sinh viên |
| `PATCH` | `/api/v1/students/:id` | Sửa sinh viên |
| `DELETE` | `/api/v1/students/:id` | Xóa sinh viên |

Query string được hỗ trợ:

```text
classes:  q, page, limit
students: q, classId, page, limit
```

`limit` có giá trị từ 1 đến 100 để tránh một request lấy quá nhiều dữ liệu.

## 10. TanStack Query đang làm gì?

TanStack Query quản lý dữ liệu lấy từ server. Mỗi request có một `queryKey`, ví dụ:

```ts
["students", { q: "nguyen", classId: 1, page: 2 }]
```

Khi một phần trong key thay đổi, thư viện hiểu đó là dữ liệu khác và gọi API. Khi thêm/sửa/xóa thành công, `invalidateQueries` đánh dấu dữ liệu cũ cần lấy lại.

State của dự án được chia làm hai loại:

- **Server state:** danh sách lớp, sinh viên; TanStack Query quản lý.
- **UI state:** nội dung input, dialog đang mở; `useState` quản lý.

Phân biệt hai loại này giúp component đơn giản hơn khi ứng dụng lớn dần.

## 11. Docker Compose đang làm gì?

`compose.yaml` khai báo:

- `db`: MySQL 8.4, dữ liệu lưu trong volume `mysql_data`.
- `api`: mount thư mục `api`, chạy migration rồi chạy `tsx watch` ở cổng 3000.
- `web`: mount thư mục `web`, chạy Vite ở cổng 5173.

Tên service cũng là hostname trong mạng Docker. Vì vậy API kết nối database bằng `DB_HOST=db`, còn Vite chuyển request tới `http://api:3000`. Từ trình duyệt Windows, bạn vẫn dùng `localhost` vì Docker đã map cổng ra máy.

Hai volume `api_node_modules` và `web_node_modules` giữ thư viện Linux bên trong Docker, tránh trộn với `node_modules` cài trên Windows.

## 12. Cách học dự án theo thứ tự

1. Mở `compose.yaml` để hiểu ba service kết nối nhau.
2. Đọc hai file migration để hiểu quan hệ database.
3. Gọi API bằng trình duyệt hoặc Postman trước khi đọc React.
4. Theo module `classes` từ routes → controller → service → repository.
5. Theo lại cùng luồng ở module `students`.
6. Đọc `StudentsPage.tsx` để hiểu state, query và render danh sách.
7. Đọc `StudentFormPage.tsx` để hiểu form controlled và mutation.
8. Thay một tiêu đề hoặc thêm một trường nhỏ, quan sát Vite cập nhật giao diện.

Sau khi hiểu bản hiện tại, những bài tập mở rộng phù hợp là:

- Thêm số điện thoại và địa chỉ sinh viên.
- Thêm sắp xếp theo tên hoặc ngày tạo.
- Thêm trang chi tiết sinh viên.
- Thêm chức năng chuyển nhiều sinh viên sang lớp khác.
- Thêm đăng nhập, phân quyền quản trị và giảng viên.
- Thêm test API và test component.

## 13. Kiểm tra mã không cần khởi động toàn bộ Docker

Nếu Node.js đã cài trên Windows:

```powershell
cd api
npm install
npm run typecheck
npm run build

cd ../web
npm install
npm run typecheck
npm run build
```

`typecheck` chỉ kiểm tra TypeScript. `build` kiểm tra mã có thể đóng gói để triển khai hay không. API vẫn cần MySQL khi thực sự chạy hoặc chạy migration.

## 14. Một số lỗi thường gặp

### Docker Desktop chưa mở

Thông báo thường có dạng “Cannot connect to the Docker daemon”. Mở Docker Desktop, đợi engine chạy rồi thử lại.

### Cổng đã được sử dụng

Nếu 5173, 3000 hoặc 3307 đang bận, tạo file `.env` ở thư mục gốc và đổi cổng:

```env
WEB_PORT=5174
API_PORT=3001
MYSQL_PORT=3308
```

Sau đó chạy lại `docker compose up -d`. Nếu đổi `WEB_PORT`, địa chỉ giao diện cũng đổi theo.

### Sửa code nhưng chưa cập nhật

Thông thường Vite và `tsx watch` tự tải lại. Trên một số cấu hình Docker Desktop cho Windows, sự kiện thay đổi file có thể chậm. Chạy:

```powershell
docker compose restart api web
```

### Database có cấu trúc cũ

Chạy migration:

```powershell
docker compose exec api npm run db:migrate
```

Nếu đây chỉ là dữ liệu học tập và bạn muốn làm lại hoàn toàn:

```powershell
docker compose down -v
docker compose up --build -d
docker compose exec api npm run db:seed
```

Lệnh `down -v` xóa dữ liệu hiện có, nên hãy kiểm tra kỹ trước khi dùng.
