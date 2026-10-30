import knex from "knex";
import { databaseConfig } from "./config.js";

const connection = knex(databaseConfig);

try {
  const [, migrations] = await connection.migrate.latest();
  console.log(migrations.length > 0 ? `Đã chạy migrations: ${migrations.join(", ")}` : "Database đã ở phiên bản mới nhất");
} finally {
  await connection.destroy();
}
