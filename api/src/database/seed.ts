import { db } from "./connection.js";

const classes = [
  { code: "CNTT01", name: "Công nghệ thông tin 01", description: "Lớp học lập trình và hệ thống thông tin" },
  { code: "QTKD01", name: "Quản trị kinh doanh 01", description: "Lớp quản trị kinh doanh tổng hợp" },
  { code: "NNA01", name: "Ngôn ngữ Anh 01", description: "Lớp ngôn ngữ Anh thương mại" }
];

const studentNames = [
  "Nguyễn Minh Anh", "Trần Quốc Bảo", "Lê Hoàng Duy", "Phạm Thu Hà",
  "Hoàng Gia Hân", "Võ Minh Khang", "Đặng Thùy Linh", "Bùi Nhật Minh",
  "Đỗ Kim Ngân", "Ngô Hải Nam", "Dương Khánh Ngọc", "Lý Minh Phúc",
  "Nguyễn Thảo Quỳnh", "Trần Đức Thành", "Lê Anh Thư", "Phạm Quốc Trung",
  "Hoàng Thanh Tùng", "Võ Khánh Vy", "Đặng Tuấn Anh", "Bùi Ngọc Bích",
  "Đỗ Thành Công", "Ngô Mỹ Duyên", "Dương Quang Huy", "Lý Bảo Trâm"
];

try {
  await db.transaction(async (trx) => {
    await trx("students").del();
    await trx("classes").del();
    await trx("classes").insert(classes);

    const savedClasses = await trx("classes").select("id").orderBy("id");
    const students = studentNames.map((fullName, index) => ({
      student_code: `SV${String(index + 1).padStart(4, "0")}`,
      full_name: fullName,
      email: `student${index + 1}@example.com`,
      birth_date: `200${index % 5}-${String((index % 12) + 1).padStart(2, "0")}-${String((index % 27) + 1).padStart(2, "0")}`,
      class_id: savedClasses[index % savedClasses.length]!.id
    }));

    await trx("students").insert(students);
  });

  console.log("Đã tạo 3 lớp và 24 sinh viên mẫu");
} finally {
  await db.destroy();
}
