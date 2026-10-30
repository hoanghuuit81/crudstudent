import knex from "knex";
import { databaseConfig } from "./config.js";

const connection = knex(databaseConfig);

try {
  const [, migrations] = await connection.migrate.rollback();
  console.log(migrations.length > 0 ? `Đã rollback: ${migrations.join(", ")}` : "Không có migration để rollback");
} finally {
  await connection.destroy();
}
