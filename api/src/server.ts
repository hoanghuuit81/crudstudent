import { app } from "./app.js";
import { env } from "./config/env.js";
import { db } from "./database/connection.js";

const server = app.listen(env.PORT, () => {
  console.log(`API đang chạy tại http://localhost:${env.PORT}`);
});

async function shutdown(signal: string): Promise<void> {
  console.log(`Nhận ${signal}, đang dừng máy chủ...`);
  server.close(async () => {
    await db.destroy();
    process.exit(0);
  });
}

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));
