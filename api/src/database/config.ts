import { readdir } from "node:fs/promises";
import { basename, extname, join } from "node:path";
import type { Knex } from "knex";
import { fileURLToPath, pathToFileURL } from "node:url";
import { env } from "../config/env.js";

const migrationExtension = import.meta.url.endsWith(".ts") ? ".ts" : ".js";
const migrationDirectory = fileURLToPath(new URL("./migrations", import.meta.url));

class StableMigrationSource implements Knex.MigrationSource<unknown> {
  async getMigrations(): Promise<unknown[]> {
    const files = await readdir(migrationDirectory);
    return files
      .filter((file) => extname(file) === migrationExtension)
      .sort()
      .map((file) => join(migrationDirectory, file));
  }

  getMigrationName(migration: unknown): string {
    return basename(String(migration)).replace(/\.js$/, ".ts");
  }

  async getMigration(migration: unknown): Promise<Knex.Migration> {
    return import(pathToFileURL(String(migration)).href) as Promise<Knex.Migration>;
  }
}

export const databaseConfig: Knex.Config = {
  client: "mysql2",
  connection: {
    host: env.DB_HOST,
    port: env.DB_PORT,
    database: env.DB_NAME,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    timezone: "+07:00",
    dateStrings: true
  },
  migrations: {
    migrationSource: new StableMigrationSource()
  }
};
