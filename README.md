# CRUD Student

Ứng dụng học React, Node.js và MySQL qua bài toán quản lý sinh viên và lớp học.

[![CI](https://github.com/hoanghuuit81/crudstudent/actions/workflows/ci.yml/badge.svg)](https://github.com/hoanghuuit81/crudstudent/actions/workflows/ci.yml)

## Chạy nhanh

```powershell
docker compose up --build -d
docker compose exec api npm run db:seed
```

Mở giao diện tại <http://localhost:5173>. API chạy tại <http://localhost:3000>.

Xem tài liệu chi tiết trong [huongdan.md](./huongdan.md).

## Kiểm tra chất lượng

Mỗi lần push hoặc mở Pull Request vào `main`, GitHub Actions sẽ kiểm tra TypeScript, build API, build giao diện và build hai Docker image production.

`compose.yaml` dùng để phát triển trên máy. `compose.prod.yaml` là cấu hình dành cho cloud và đọc giá trị mẫu từ `production.env.example`.
